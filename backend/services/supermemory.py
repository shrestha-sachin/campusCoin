import os
import httpx
from typing import List
from fastapi import APIRouter, HTTPException
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import MemoryStoreRequest, AcademicEvent

router = APIRouter()

SUPERMEMORY_BASE = "https://api.supermemory.ai/v3"


def _headers():
    key = os.environ.get("SUPERMEMORY_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="SUPERMEMORY_KEY not configured")
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


@router.post("/store")
async def store_memory(req: MemoryStoreRequest):
    p = req.profile
    goals_str = ", ".join(p.financial_goals) if p.financial_goals else "not specified"
    content = (
        f"Student {p.name} attends {p.university}, majoring in {p.major}, "
        f"graduating {p.graduation_date}. Current balance: ${p.current_balance:.2f}. "
        f"Goals: {goals_str}."
    )
    payload = {
        "content": content,
        "metadata": {
            "userId": p.user_id,
            "type": "financial_profile"
        }
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPERMEMORY_BASE}/memories",
            json=payload,
            headers=_headers()
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"Supermemory error: {resp.text}")
        return {"success": True, "detail": resp.json()}


async def store_academic_events(user_id: str, events: List[AcademicEvent]):
    """Store extracted academic stress periods as Supermemory memories tied to user_id."""
    for event in events:
        content = (
            f"Academic event: {event.title} ({event.date_range}). "
            f"Expected hours reduction: {event.inferred_hours_reduction}hrs/wk. "
            f"Financial impact: ${event.financial_impact:.2f}. "
            f"Action: {event.recommended_action}"
        )
        payload = {
            "content": content,
            "metadata": {
                "userId": user_id,
                "type": "academic_event",
                "title": event.title,
                "date_range": event.date_range,
            }
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{SUPERMEMORY_BASE}/memories",
                    json=payload,
                    headers=_headers()
                )
                if resp.status_code not in (200, 201):
                    print(f"[Supermemory] Failed to store event '{event.title}': {resp.text}")
        except Exception as e:
            print(f"[Supermemory] Error storing event '{event.title}': {e}")


async def recall_academic_events(user_id: str) -> list[str]:
    """Fetch previously stored academic events for a user from Supermemory.
    Returns a list of formatted strings ready to inject into the advisor prompt."""
    if not user_id or user_id == "anonymous":
        return []
    key = os.environ.get("SUPERMEMORY_KEY")
    if not key:
        return []
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{SUPERMEMORY_BASE}/memories",
                params={"filter": f"userId:{user_id} type:academic_event"},
                headers=headers,
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            memories = data.get("memories", data) if isinstance(data, dict) else data
            if not isinstance(memories, list):
                return []
            return [m.get("content", "") for m in memories if m.get("content")]
    except Exception as e:
        print(f"[Supermemory] recall_academic_events failed: {e}")
        return []


@router.get("/recall/{user_id}")
async def recall_memory(user_id: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPERMEMORY_BASE}/memories",
            params={"filter": f"userId:{user_id}"},
            headers=_headers()
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Supermemory error: {resp.text}")
        return resp.json()
