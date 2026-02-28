import json
import modal
from fastapi import APIRouter, HTTPException
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import FinancialData

router = APIRouter()

profiles_dict = modal.Dict.from_name("campuscoin-profiles", create_if_missing=True)


@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        raw = profiles_dict[user_id]
        return json.loads(raw)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Profile not found for user_id: {user_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}")
async def save_profile(user_id: str, data: FinancialData):
    try:
        serialized = data.model_dump_json()
        profiles_dict[user_id] = serialized
        return {"success": True, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
