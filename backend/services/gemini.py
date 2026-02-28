import os
import json
import re
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import AnalyzeRequest, AIInsight, ChatRequest, ChatResponse

router = APIRouter()


def _get_client():
    api_key = os.environ.get("GEMINI_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_KEY not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-3-flash-preview")


def _strip_fences(text: str) -> str:
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```", "", text)
    return text.strip()


def _extract_json(text: str) -> dict:
    """
    Try to robustly extract a JSON object from model output.
    Prefers the first {...} block if extra prose sneaks in.
    """
    cleaned = _strip_fences(text or "")
    # If it's already valid JSON, use it directly
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: grab the first {...} block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise json.JSONDecodeError("No JSON object found in model response", cleaned, 0)
    snippet = match.group(0)
    return json.loads(snippet)


@router.post("/analyze", response_model=AIInsight)
async def analyze_finances(req: AnalyzeRequest):
    model = _get_client()

    income_summary = "\n".join([
        f"  - {s.label}: {'$' + str(s.lump_sum_amount) + ' lump sum' if s.is_lump_sum else f'${s.hourly_rate}/hr x {s.weekly_hours}hrs/wk'} "
        f"({s.start_date} to {s.end_date}) [{'ACTIVE' if s.is_active else 'INACTIVE'}]"
        for s in req.income_streams
    ])
    expense_summary = "\n".join([
        f"  - {e.label}: ${e.amount} {e.frequency} [{'ACTIVE' if e.is_active else 'INACTIVE'}]"
        for e in req.expenses
    ])

    runway_preview = ""
    if req.runway:
        last = req.runway[-1]
        runway_preview = f"Projected balance in {len(req.runway)} days: ${last.projected_balance:.2f}"
        negatives = [r for r in req.runway if r.projected_balance < 0]
        if negatives:
            runway_preview += f"\nFirst negative balance on: {negatives[0].date} (${negatives[0].projected_balance:.2f})"

    prompt = f"""You are a financial advisor for college students. Analyze this student's financial situation and return ONLY valid JSON (no markdown, no explanation outside JSON).

STUDENT PROFILE:
Name: {req.profile.name}
Email: {req.profile.email}
University: {req.profile.university}
Major: {req.profile.major}
Graduation: {req.profile.graduation_date}
Current Balance: ${req.profile.current_balance:.2f}
Goals: {', '.join(req.profile.financial_goals)}

INCOME STREAMS:
{income_summary}

EXPENSES:
{expense_summary}

RUNWAY PROJECTION:
{runway_preview}

Return ONLY this JSON structure (no markdown fences, no extra text):
{{
  "status": "on_track|caution|critical",
  "next_best_action": "one concrete actionable sentence",
  "emergency_mode": false,
  "emergency_resources": [],
  "full_analysis": "2-3 paragraph analysis using real numbers from the data",
  "shortfall_date": null,
  "shortfall_amount": 0.00
}}

Rules:
- Set status to "critical" if balance hits $0 or can't cover rent/food within 30 days
- Set status to "caution" if projected balance drops below $300 within 60 days
- Set emergency_mode to true if balance hits $0 or can't cover rent/food within 30 days
- When emergency_mode is true, populate emergency_resources with objects like {{"type": "food_pantry|emergency_grant|work_study|financial_counseling", "label": "...", "description": "...", "link": "..."}}
- When emergency_mode is true, populate emergency_resources with 3 objects in this exact format:
  {{"type": "food_pantry|emergency_grant|work_study|financial_counseling", "label": "Name of the program", "description": "One sentence description", "link": "https://..."}}
- STRICT LINK RULE: The "link" value MUST be a complete, absolute URL beginning with "https://" that resolves to a real university or government webpage. You MUST research the exact page for that university. NEVER use "#", relative paths, internal routes, or placeholder values. DO NOT provide any links belonging to the domain "campuscoin.tech" or "localhost". If you're unsure of the exact URL for a university page, use the format: "https://www.google.com/search?q=UWGB+emergency+grant" replacing UWGB with the actual institution abbreviation. The student's email is {req.profile.email or 'unknown'} and university is {req.profile.university}.
- shortfall_date should be the ISO date string when balance first goes negative, or null
- shortfall_amount should be the magnitude of the shortfall at that date"""

    try:
        # Let Gemini respond normally and then robustly extract JSON.
        try:
            response = model.generate_content(prompt, tools="google_search_retrieval")
        except Exception:
            # Fallback if the SDK/Model version doesn't support the tools parameter format
            response = model.generate_content(prompt)

        data = _extract_json(getattr(response, "text", "") or str(response))
        return AIInsight(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    model = _get_client()

    history_text = ""
    recent = req.conversation_history[-6:] if len(req.conversation_history) > 6 else req.conversation_history
    for msg in recent:
        role = "User" if msg.get("role") == "user" else "Assistant"
        history_text += f"{role}: {msg.get('content', '')}\n"

    income_summary = "\n".join([
        f"  - {s.label}: {'$' + str(s.lump_sum_amount) + ' lump sum' if s.is_lump_sum else f'${s.hourly_rate}/hr x {s.weekly_hours}hrs/wk'}"
        for s in req.income_streams if s.is_active
    ])
    expense_summary = "\n".join([
        f"  - {e.label}: ${e.amount} {e.frequency}"
        for e in req.expenses if e.is_active
    ])

    prompt = f"""You are CampusCoin AI, a financial advisor for college students. Answer directly and mathematically using the student's real numbers. Keep responses under 180 words. Be practical and student-friendly.
STUDENT: {req.profile.name}
EMAIL: {req.profile.email}
UNIVERSITY: {req.profile.university}
BALANCE: ${req.profile.current_balance:.2f}

CRITICAL INSTRUCTION: If the student asks for resources, funding, or help, act as a researcher. Use their email domain and university name to search your knowledge base for accurate, real-world URLs from their specific university's webpage or nearby location websites to help them fund their education and plan ahead.

ACTIVE INCOME:
{income_summary}

ACTIVE EXPENSES:
{expense_summary}

CONVERSATION:
{history_text}
User: {req.user_query}

If the question is "can I afford X?", give a clear yes/no with math showing your work.
If this is a financial emergency (balance nearly $0, can't cover rent/food in 30 days), end your response with [[EMERGENCY_MODE]] on its own line.
Assistant:"""

    try:
        try:
            response = model.generate_content(prompt, tools="google_search_retrieval")
        except Exception:
            response = model.generate_content(prompt)
            
        text = response.text.strip()
        emergency = "[[EMERGENCY_MODE]]" in text
        text = text.replace("[[EMERGENCY_MODE]]", "").strip()
        return ChatResponse(response=text, emergency_mode=emergency)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
