import os
import httpx
from fastapi import APIRouter, HTTPException
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import MemoryStoreRequest

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
