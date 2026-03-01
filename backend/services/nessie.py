import os
import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal, List

router = APIRouter()

NESSIE_BASE = "http://api.nessieisreal.com"


def _key():
    key = os.environ.get("NESSIE_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="NESSIE_KEY not configured")
    return key


# ── Read Endpoints ──────────────────────────────────

@router.get("/balance/{account_id}")
async def get_balance(account_id: str):
    """Get the live balance for a Nessie account (dynamically calculated)."""
    key = _key()
    async with httpx.AsyncClient() as client:
        # Fetch account, deposits, and purchases concurrently
        acct_resp, dep_resp, pur_resp = await asyncio_gather(
            client.get(f"{NESSIE_BASE}/accounts/{account_id}", params={"key": key}),
            client.get(f"{NESSIE_BASE}/accounts/{account_id}/deposits", params={"key": key}),
            client.get(f"{NESSIE_BASE}/accounts/{account_id}/purchases", params={"key": key}),
        )

        if acct_resp.status_code != 200:
            raise HTTPException(status_code=acct_resp.status_code, detail="Nessie account not found")
        
        acct_data = acct_resp.json()
        base_balance = acct_data.get("balance", 0.0)

        # Calculate live balance from transactions
        live_balance = base_balance

        if dep_resp.status_code == 200:
            for dep in dep_resp.json():
                # In sandbox, all transactions are treated as completed
                live_balance += dep.get("amount", 0.0)
                
        if pur_resp.status_code == 200:
            for pur in pur_resp.json():
                live_balance -= pur.get("amount", 0.0)

        return {
            "balance": round(live_balance, 2),
            "account_id": acct_data.get("_id", account_id),
            "nickname": acct_data.get("nickname", "My Account"),
            "type": acct_data.get("type", "Checking"),
            "rewards": acct_data.get("rewards", 0),
            "customer_id": acct_data.get("customer_id"),
        }


@router.get("/accounts")
async def list_accounts():
    """List all accounts under our API key."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()


@router.get("/deposits/{account_id}")
async def get_deposits(account_id: str):
    """Get all deposits (income) for an account."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts/{account_id}/deposits",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()


@router.get("/bills/{account_id}")
async def get_bills(account_id: str):
    """Get all bills (scheduled expenses) for an account."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts/{account_id}/bills",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()


@router.get("/purchases/{account_id}")
async def get_purchases(account_id: str):
    """Get all purchases (expenses) for an account."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NESSIE_BASE}/accounts/{account_id}/purchases",
            params={"key": _key()}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Nessie API error")
        return resp.json()


@router.get("/transactions/{account_id}")
async def get_all_transactions(account_id: str):
    """Get combined deposits + purchases for a unified transaction feed."""
    key = _key()
    async with httpx.AsyncClient() as client:
        dep_resp, pur_resp = await asyncio_gather(
            client.get(f"{NESSIE_BASE}/accounts/{account_id}/deposits", params={"key": key}),
            client.get(f"{NESSIE_BASE}/accounts/{account_id}/purchases", params={"key": key}),
        )

    transactions = []

    if dep_resp.status_code == 200:
        for d in dep_resp.json():
            transactions.append({
                "id": d.get("_id"),
                "type": "deposit",
                "amount": d.get("amount", 0),
                "date": d.get("transaction_date"),
                "description": d.get("description", "Deposit"),
                "status": "completed",
                "medium": d.get("medium", "balance"),
            })

    if pur_resp.status_code == 200:
        for p in pur_resp.json():
            transactions.append({
                "id": p.get("_id"),
                "type": "purchase",
                "amount": p.get("amount", 0),
                "date": p.get("purchase_date"),
                "description": p.get("description", "Purchase"),
                "status": "completed",
                "medium": p.get("medium", "balance"),
                "merchant_id": p.get("merchant_id"),
            })

    # Sort by date descending (most recent first)
    transactions.sort(key=lambda t: t.get("date") or "", reverse=True)
    return transactions


async def asyncio_gather(*coros):
    """Run multiple awaitables concurrently."""
    import asyncio
    return await asyncio.gather(*coros)


# ── Write Endpoints ─────────────────────────────────

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
    """Create a Nessie customer + Checking account in one call."""
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
            raise HTTPException(
                status_code=cust_resp.status_code,
                detail=f"Failed to create Nessie customer: {cust_resp.text}",
            )

        cust_data = cust_resp.json()
        customer_id = cust_data.get("objectCreated", {}).get("_id")
        if not customer_id:
            customer_id = cust_data.get("_id") or cust_data.get("id")
        if not customer_id:
            raise HTTPException(status_code=500, detail="Could not extract customer ID")

        # 2. Create checking account
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
            raise HTTPException(
                status_code=acct_resp.status_code,
                detail=f"Failed to create Nessie account: {acct_resp.text}",
            )

        acct_data = acct_resp.json()
        account_id = acct_data.get("objectCreated", {}).get("_id")
        if not account_id:
            account_id = acct_data.get("_id") or acct_data.get("id")
        if not account_id:
            raise HTTPException(status_code=500, detail="Could not extract account ID")

        return {
            "customer_id": customer_id,
            "account_id": account_id,
            "balance": req.balance,
            "nickname": "CampusCoin Checking",
        }


class CreateDepositRequest(BaseModel):
    account_id: str
    amount: float
    description: str = "Deposit"
    medium: Literal["balance", "rewards"] = "balance"
    transaction_date: Optional[str] = None  # YYYY-MM-DD


@router.post("/deposit")
async def create_deposit(req: CreateDepositRequest):
    """
    Create a deposit (income) on a Nessie account.
    This simulates a paycheck, financial aid disbursement, family transfer, etc.
    The account balance will be automatically increased by Nessie.
    """
    key = _key()
    tx_date = req.transaction_date or datetime.now().strftime("%Y-%m-%d")

    payload = {
        "medium": req.medium,
        "transaction_date": tx_date,
        "amount": req.amount,
        "description": req.description,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{NESSIE_BASE}/accounts/{req.account_id}/deposits",
            params={"key": key},
            json=payload,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"Failed to create deposit: {resp.text}",
            )
        data = resp.json()
        deposit_id = data.get("objectCreated", {}).get("_id")
        return {
            "deposit_id": deposit_id,
            "amount": req.amount,
            "description": req.description,
            "date": tx_date,
        }


class CreatePurchaseRequest(BaseModel):
    account_id: str
    amount: float
    description: str = "Purchase"
    medium: Literal["balance", "rewards"] = "balance"
    purchase_date: Optional[str] = None  # YYYY-MM-DD
    merchant_id: Optional[str] = None


@router.post("/purchase")
async def create_purchase(req: CreatePurchaseRequest):
    """
    Create a purchase (expense) on a Nessie account.
    This simulates rent, groceries, tuition, etc.
    The account balance will be automatically decreased by Nessie.
    """
    key = _key()
    px_date = req.purchase_date or datetime.now().strftime("%Y-%m-%d")

    payload = {
        "medium": req.medium,
        "purchase_date": px_date,
        "amount": req.amount,
        "description": req.description,
    }
    if req.merchant_id:
        payload["merchant_id"] = req.merchant_id

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Nessie requires a merchant_id for purchases — create a dummy merchant if not provided
        merchant_id = req.merchant_id
        if not merchant_id:
            # Use a known merchant or create one
            merch_resp = await client.post(
                f"{NESSIE_BASE}/merchants",
                params={"key": key},
                json={
                    "name": req.description,
                    "category": ["expense"],
                    "address": {
                        "street_number": "1",
                        "street_name": "Main St",
                        "city": "Champaign",
                        "state": "IL",
                        "zip": "61820",
                    },
                    "geocode": {"lat": 40.1164, "lng": -88.2434},
                },
            )
            if merch_resp.status_code in (200, 201):
                merch_data = merch_resp.json()
                merchant_id = merch_data.get("objectCreated", {}).get("_id")

        if merchant_id:
            payload["merchant_id"] = merchant_id

        resp = await client.post(
            f"{NESSIE_BASE}/accounts/{req.account_id}/purchases",
            params={"key": key},
            json=payload,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"Failed to create purchase: {resp.text}",
            )
        data = resp.json()
        purchase_id = data.get("objectCreated", {}).get("_id")
        return {
            "purchase_id": purchase_id,
            "amount": req.amount,
            "description": req.description,
            "date": px_date,
            "merchant_id": merchant_id,
        }


class CreateBillRequest(BaseModel):
    account_id: str
    payee: str
    amount: float
    payment_date: Optional[str] = None  # YYYY-MM-DD
    recurring_date: Optional[int] = None  # 1-31
    nickname: Optional[str] = None


@router.post("/bill")
async def create_bill(req: CreateBillRequest):
    """
    Create a bill (scheduled expense) on a Nessie account.
    """
    key = _key()
    p_date = req.payment_date or datetime.now().strftime("%Y-%m-%d")

    payload = {
        "status": "pending",
        "payee": req.payee,
        "nickname": req.nickname or req.payee,
        "payment_date": p_date,
        "payment_amount": req.amount,
    }
    if req.recurring_date:
        payload["recurring_date"] = req.recurring_date

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{NESSIE_BASE}/accounts/{req.account_id}/bills",
            params={"key": key},
            json=payload,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"Failed to create bill: {resp.text}",
            )
        data = resp.json()
        bill_id = data.get("objectCreated", {}).get("_id")
        return {
            "bill_id": bill_id,
            "payee": req.payee,
            "amount": req.amount,
            "date": p_date,
        }
