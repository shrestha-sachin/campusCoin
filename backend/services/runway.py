from fastapi import APIRouter
from datetime import date, timedelta
from typing import List
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import RunwayRequest, RunwayPoint

router = APIRouter()


@router.post("/calculate", response_model=List[RunwayPoint])
async def calculate_runway(req: RunwayRequest):
    today = date.today()
    balance = req.current_balance
    results = []

    for day_offset in range(req.days):
        current_date = today + timedelta(days=day_offset)
        daily_delta = 0.0

        for stream in req.income_streams:
            if not stream.is_active:
                continue
            try:
                start = date.fromisoformat(stream.start_date)
                end = date.fromisoformat(stream.end_date) if stream.end_date else date.max
            except Exception:
                continue
            if not (start <= current_date <= end):
                continue

            if stream.is_lump_sum and stream.lump_sum_amount:
                if stream.end_date:
                    duration_days = max((end - start).days, 1)
                else:
                    duration_days = 1
                
                if current_date == start if not stream.end_date else (start <= current_date <= end):
                    if not stream.end_date:
                         daily_delta += stream.lump_sum_amount
                    else:
                         daily_delta += stream.lump_sum_amount / duration_days
            else:
                daily_delta += (stream.hourly_rate * stream.weekly_hours) / 7.0

        for expense in req.expenses:
            if not expense.is_active:
                continue
            try:
                due = date.fromisoformat(expense.due_date)
            except Exception:
                continue

            freq = expense.frequency
            if freq == "monthly":
                if current_date.day == due.day:
                    daily_delta -= expense.amount
            elif freq == "weekly":
                days_since = (current_date - due).days
                if days_since >= 0 and days_since % 7 == 0:
                    daily_delta -= expense.amount
            elif freq in ("one-time", "semesterly"):
                if current_date == due:
                    daily_delta -= expense.amount

        balance += daily_delta
        results.append(RunwayPoint(
            date=current_date.isoformat(),
            projected_balance=round(balance, 2)
        ))

    return results
