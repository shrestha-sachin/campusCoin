import os
import json
import re
import tempfile
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import AnalyzeRequest, AIInsight, ChatRequest, ChatResponse, IngestionResponse

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

    # Pre-compute key numbers for accuracy
    from datetime import date as dt_date
    today = dt_date.today()

    # Net monthly income (post-tax, active streams only, only if payday has begun)
    net_monthly_income = 0.0
    for s in req.income_streams:
        if not s.is_active:
            continue
        try:
            pay_start = dt_date.fromisoformat(s.first_payday) if s.first_payday else dt_date.fromisoformat(s.start_date)
        except Exception:
            pay_start = today
        if pay_start > today:
            continue
        tax_mult = 1.0 - (getattr(s, 'tax_rate', 0.0) / 100.0)
        if s.is_lump_sum and s.lump_sum_amount:
            net_monthly_income += (s.lump_sum_amount * tax_mult) / 12.0
        else:
            net_monthly_income += s.hourly_rate * s.weekly_hours * 4.33 * tax_mult

    # Monthly expenses (active only)
    monthly_expenses = 0.0
    for e in req.expenses:
        if not e.is_active:
            continue
        if e.frequency == "monthly":
            monthly_expenses += e.amount
        elif e.frequency == "weekly":
            monthly_expenses += e.amount * 4.33
        elif e.frequency == "semesterly":
            monthly_expenses += e.amount / 4.0

    net_monthly = net_monthly_income - monthly_expenses

    # Months until graduation
    try:
        grad_date = dt_date.fromisoformat(req.profile.graduation_date[:10])
        months_to_grad = max(0, round((grad_date - today).days / 30.44))
    except Exception:
        months_to_grad = None

    # Burn rate context
    burn_context = ""
    if net_monthly < 0:
        months_until_zero = abs(req.profile.current_balance / net_monthly) if net_monthly != 0 else 0
        burn_context = f"CRITICAL: Net cashflow is ${net_monthly:.2f}/mo (spending more than earning). Current balance depleted in ~{months_until_zero:.1f} months."
    elif net_monthly >= 0:
        burn_context = f"Positive cashflow of ${net_monthly:.2f}/mo. Estimated savings over graduation period: ${net_monthly * (months_to_grad or 0):.2f}."

    income_summary = "\n".join([
        f"  - {s.label}: "
        + (f"${s.lump_sum_amount} lump sum (${s.lump_sum_amount * (1 - getattr(s, 'tax_rate', 0)/100):.2f} after {getattr(s, 'tax_rate', 0)}% tax)" if s.is_lump_sum else
           f"${s.hourly_rate}/hr x {s.weekly_hours}hrs/wk = ${s.hourly_rate * s.weekly_hours * 4.33 * (1 - getattr(s, 'tax_rate', 0)/100):.0f}/mo net after {getattr(s, 'tax_rate', 0)}% tax")
        + f" | Start: {s.start_date}" + (f" | First Payday: {s.first_payday}" if s.first_payday else "")
        + (f" | End: {s.end_date}" if s.end_date else " | Ongoing")
        + f" [{'ACTIVE' if s.is_active else 'INACTIVE'}]"
        for s in req.income_streams
    ])
    expense_summary = "\n".join([
        f"  - {e.label}: ${e.amount} {e.frequency} (≈${e.amount if e.frequency == 'monthly' else e.amount*4.33 if e.frequency == 'weekly' else e.amount/4:.0f}/mo) [{'ACTIVE' if e.is_active else 'INACTIVE'}]"
        for e in req.expenses
    ])

    runway_preview = ""
    if req.runway:
        last = req.runway[-1]
        runway_preview = f"Projected balance in {len(req.runway)} days: ${last.projected_balance:.2f}"
        negatives = [r for r in req.runway if r.projected_balance < 0]
        if negatives:
            runway_preview += f"\nFirst negative balance on: {negatives[0].date} (${negatives[0].projected_balance:.2f})"
        else:
            # Find the lowest point
            min_point = min(req.runway, key=lambda r: r.projected_balance)
            runway_preview += f"\nLowest projected balance: ${min_point.projected_balance:.2f} on {min_point.date}"

    prompt = f"""You are a financial counselor personally reviewing a student's finances. Write in clear, warm, first-person voice — use "Based on my review," "I recommend," "My advice." Be specific with real dollar figures. Never sound like an AI. Sound like a knowledgeable human advisor who cares deeply about this student's success.

Analyze this student's financial situation and return ONLY valid JSON (no markdown, no explanation outside JSON).

STUDENT PROFILE:
Name: {req.profile.name}
University: {req.profile.university}
Major: {req.profile.major}
Graduation: {req.profile.graduation_date} ({months_to_grad} months away)
Current Balance: ${req.profile.current_balance:.2f}
Goals: {', '.join(req.profile.financial_goals) or 'None set'}

COMPUTED FINANCIAL SUMMARY (use these exact numbers in your analysis):
  Net Monthly Income (post-tax, active streams): ${net_monthly_income:.2f}
  Monthly Expenses: ${monthly_expenses:.2f}
  Net Monthly Cashflow: ${net_monthly:.2f}
  {burn_context}

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
  "full_analysis": "a concise executive summary",
  "strategy_points": [
    {{
      "label": "Concrete action title here",
      "details": "Specific 1-2 sentence advice using real numbers from this student's data.",
      "icon": "Wallet",
      "color": "blue"
    }}
  ],
  "shortfall_date": null,
  "shortfall_amount": 0.00
}}

Rules:
- Provide exactly 5-6 strategy_points covering: income optimization, savings habits, expense reduction, long-term planning, campus resources, and any urgent risk areas.
- Each strategy point MUST have: "label", "details", "icon" (Lucide icon name), and "color" (blue|green|orange|red|purple).
- Set status to "critical" if balance hits $0 or can't cover rent/food within 30 days
- Set status to "caution" if projected balance drops below $300 within 60 days
- Set emergency_mode to true if balance hits $0 or can't cover rent/food within 30 days
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


@router.post("/ingest_academic", response_model=IngestionResponse)
async def ingest_academic(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous"),
):
    model = _get_client()

    contents = await file.read()
    mime = file.content_type or "application/octet-stream"

    suffix = ".pdf" if "pdf" in mime else ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        uploaded = genai.upload_file(tmp_path, mime_type=mime)
    finally:
        os.unlink(tmp_path)

    prompt = """You are an academic-financial analyst for college students who juggle campus jobs.

Analyze this syllabus, course schedule, or academic calendar. Extract every major academic stress period — midterms, finals, large projects, lab practicals, paper deadlines — anything that would force a student to cut back on work hours.

For each event, infer:
1. The expected reduction in weekly working hours (e.g., a student who normally works 20 hrs/wk might drop to 8 during finals).
2. The dollar financial impact = (hours_reduction) × $13/hr × (number_of_weeks).
3. A concrete recommended_action the student should take NOW to cushion the gap (e.g., "Stash $78 this paycheck to cover finals week").

Return ONLY valid JSON matching this exact schema (no markdown fences, no extra text):
{
  "events": [
    {
      "title": "Event name",
      "date_range": "Mon DD - Mon DD",
      "inferred_hours_reduction": 12,
      "financial_impact": 156.00,
      "recommended_action": "Concrete dollar-specific advice"
    }
  ],
  "overall_summary": "A 2-3 sentence executive summary of the semester's financial risk from academic workload."
}

Rules:
- Extract AT LEAST every midterm and final exam period. Include large projects and paper deadlines too.
- If you cannot determine exact dates, estimate based on typical semester timing.
- Be specific with dollar amounts — students need actionable numbers.
- The overall_summary should quantify the total estimated income loss across the semester."""

    try:
        response = model.generate_content([prompt, uploaded])
        data = _extract_json(getattr(response, "text", "") or str(response))
        result = IngestionResponse(**data)

        try:
            from services.supermemory import store_academic_events
            import asyncio
            asyncio.ensure_future(store_academic_events(user_id, result.events))
        except Exception as mem_err:
            print(f"[CampusCoin] Supermemory store failed (non-blocking): {mem_err}")

        return result
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
