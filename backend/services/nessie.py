import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

NESSIE_BASE = "http://api.nessieisreal.com"


def _key():
    key = os.environ.get("NESSIE_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="NESSIE_KEY not configured")
    return key


# ── Read endpoints ──────────────────────────────────

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


# ── Create endpoints (for onboarding) ──────────────

class CreateAccountRequest(BaseModel):
    first_name: str
    last_name: str
    balance: float = 0.0
    street_number: str = "1"
    street_name: str = "Main St"
    city: str = "Champaign"
    state: str = "IL"
    zip_code: str = "61820"


@router.post("/create-account")
async def create_customer_and_account(req: CreateAccountRequest):
    """
    Creates a Nessie customer and a Checking account in one call.
    Returns the account_id and customer_id so the frontend can link them.
    """
    key = _key()

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Create customer
        customer_payload = {
            "first_name": req.first_name,
            "last_name": req.last_name,
            "address": {
                "street_number": req.street_number,
                "street_name": req.street_name,
                "city": req.city,
                "state": req.state,
                "zip": req.zip_code,
            },
        }
        cust_resp = await client.post(
            f"{NESSIE_BASE}/customers",
            params={"key": key},
            json=customer_payload,
        )
        if cust_resp.status_code not in (200, 201):
            detail = cust_resp.text
            raise HTTPException(
                status_code=cust_resp.status_code,
                detail=f"Failed to create Nessie customer: {detail}",
            )

        cust_data = cust_resp.json()
        # Nessie returns { "code": 201, "message": "...", "objectCreated": { "_id": "..." } }
        customer_id = cust_data.get("objectCreated", {}).get("_id")
        if not customer_id:
            # Some Nessie versions return the id differently
            customer_id = cust_data.get("_id") or cust_data.get("id")
        if not customer_id:
            raise HTTPException(status_code=500, detail="Could not extract customer ID from Nessie response")

        # 2. Create checking account for the customer
        account_payload = {
            "type": "Checking",
            "nickname": "CampusCoin Checking",
            "rewards": 0,
            "balance": req.balance,
        }
        acct_resp = await client.post(
            f"{NESSIE_BASE}/customers/{customer_id}/accounts",
            params={"key": key},
            json=account_payload,
        )
        if acct_resp.status_code not in (200, 201):
            detail = acct_resp.text
            raise HTTPException(
                status_code=acct_resp.status_code,
                detail=f"Failed to create Nessie account: {detail}",
            )

        acct_data = acct_resp.json()
        account_id = acct_data.get("objectCreated", {}).get("_id")
        if not account_id:
            account_id = acct_data.get("_id") or acct_data.get("id")
        if not account_id:
            raise HTTPException(status_code=500, detail="Could not extract account ID from Nessie response")

        return {
            "customer_id": customer_id,
            "account_id": account_id,
            "balance": req.balance,
            "nickname": "CampusCoin Checking",
        }
