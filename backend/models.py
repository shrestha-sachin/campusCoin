from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import date


class Profile(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    university: str
    major: str
    graduation_date: str  # YYYY-MM-DD
    financial_goals: List[str] = []
    current_balance: float = 0.0
    student_id: Optional[str] = None
    avatar_url: Optional[str] = None
    nessie_account_id: Optional[str] = None
    nessie_customer_id: Optional[str] = None


class IncomeStream(BaseModel):
    id: str
    type: Literal["campus_job", "internship", "stipend", "family", "other"]
    label: str
    hourly_rate: float = 0.0
    weekly_hours: float = 0.0
    start_date: str  # YYYY-MM-DD
    end_date: Optional[str] = None    # YYYY-MM-DD
    first_payday: Optional[str] = None  # Expected or actual first paycheck date
    tax_rate: float = 0.0              # Tax percentage (e.g., 12.5)
    is_lump_sum: bool = False
    lump_sum_amount: Optional[float] = None
    is_active: bool = True


class Expense(BaseModel):
    id: str
    type: Literal["fixed", "variable"]
    label: str
    amount: float
    frequency: Literal["monthly", "semesterly", "weekly", "one-time"]
    due_date: str  # YYYY-MM-DD
    is_active: bool = True


class Goal(BaseModel):
    id: str
    name: str
    target: float
    current: float = 0.0


class FinancialData(BaseModel):
    profile: Profile
    income_streams: List[IncomeStream] = []
    expenses: List[Expense] = []
    goals: List[Goal] = []


class RunwayRequest(BaseModel):
    current_balance: float
    income_streams: List[IncomeStream]
    expenses: List[Expense]
    days: int = 180


class RunwayPoint(BaseModel):
    date: str
    projected_balance: float


class AnalyzeRequest(BaseModel):
    profile: Profile
    income_streams: List[IncomeStream]
    expenses: List[Expense]
    runway: List[RunwayPoint] = []


class EmergencyResource(BaseModel):
    type: str
    label: str
    description: str
    link: str


class StrategyPoint(BaseModel):
    label: str
    details: str
    icon: str # Lucide icon name
    color: str # 'blue', 'green', 'orange', 'red', 'purple'


class AIInsight(BaseModel):
    status: Literal["on_track", "caution", "critical"]
    next_best_action: str
    emergency_mode: bool = False
    emergency_resources: List[EmergencyResource] = []
    full_analysis: str
    strategy_points: List[StrategyPoint] = []
    shortfall_date: Optional[str] = None
    shortfall_amount: float = 0.0


class ChatRequest(BaseModel):
    profile: Profile
    income_streams: List[IncomeStream]
    expenses: List[Expense]
    user_query: str
    conversation_history: List[dict] = []


class ChatResponse(BaseModel):
    response: str
    emergency_mode: bool = False


class MemoryStoreRequest(BaseModel):
    profile: Profile


class NessieBalance(BaseModel):
    balance: float
    account_id: str
    nickname: str
