import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

NESSIE_BASE = "http://api.nessieisreal.com"


def _key():
    key = os.environ.get("NESSIE_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="NESSIE_KEY not configured")
    return key


@router.get("/balance/{account_id}")
async def get_balance(account_id: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts/{account_id}",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        data = resp.json()
        return {
            "balance": data.get("balance", 0.0),
            "account_id": data.get("_id", account_id),
            "nickname": data.get("nickname", "My Account")
        }


@router.get("/transactions/{account_id}")
async def get_transactions(account_id: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts/{account_id}/purchases",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()


@router.get("/accounts")
async def list_accounts():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()
