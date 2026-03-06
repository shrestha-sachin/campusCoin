import json
import hashlib
import modal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()

# Stores: firebase_uid -> { firebase_uid, email, name, student_id }
# We switch the key from 'email' to 'firebase_uid' for better reliability
auth_dict = modal.Dict.from_name("campuscoin-auth", create_if_missing=True)

# Stores: student_id -> firebase_uid (reverse lookup)
student_id_dict = modal.Dict.from_name("campuscoin-student-ids", create_if_missing=True)

class SignupRequest(BaseModel):
    firebase_uid: str
    email: str
    name: str
    student_id: str
    university: Optional[str] = None

class LoginRequest(BaseModel):
    firebase_uid: str
    email: Optional[str] = None
    student_id: Optional[str] = None

@router.post("/signup")
async def signup(req: SignupRequest):
    """
    Register a new user in the backend using their Firebase UID.
    """
    uid = req.firebase_uid.strip()
    email = req.email.strip().lower()
    student_id = req.student_id.strip()

    if not uid:
        raise HTTPException(status_code=400, detail="Firebase UID is required")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID is required")

    # Check if this student ID is already taken
    try:
        existing_uid = student_id_dict[student_id]
        if existing_uid and existing_uid != uid:
            raise HTTPException(status_code=409, detail="This Student ID is already linked to another account.")
    except KeyError:
        pass

    auth_entry = {
        "firebase_uid": uid,
        "email": email,
        "name": req.name.strip(),
        "student_id": student_id,
        "university": req.university
    }
    
    # Store by UID
    auth_dict[uid] = json.dumps(auth_entry)
    
    # Store reverse lookup
    student_id_dict[student_id] = uid

    return {
        "success": True,
        "user_id": uid, # We use firebase UID as user_id now
        "name": auth_entry["name"],
        "email": email,
        "student_id": student_id,
    }

@router.post("/login")
async def login(req: LoginRequest):
    """
    Verify the user exists in our backend via their Firebase UID.
    """
    uid = req.firebase_uid.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="Firebase UID is required")

    try:
        raw = auth_dict[uid]
        auth_entry = json.loads(raw)
    except KeyError:
        raise HTTPException(status_code=404, detail="No backend profile found for this Firebase user.")

    # Try to fetch their saved profile
    from services.profile import profiles_dict
    profile_data = None
    try:
        profile_raw = profiles_dict[uid]
        profile_data = json.loads(profile_raw)
    except KeyError:
        pass

    return {
        "success": True,
        "user_id": uid,
        "name": auth_entry["name"],
        "email": auth_entry["email"],
        "student_id": auth_entry.get("student_id", ""),
        "profile_data": profile_data,
    }

@router.post("/delete-account")
async def delete_account(req: LoginRequest):
    """Delete a user's backend entry."""
    uid = req.firebase_uid.strip()
    
    try:
        raw = auth_dict[uid]
        auth_entry = json.loads(raw)
        sid = auth_entry.get("student_id")
        
        if sid:
            try: del student_id_dict[sid]
            except: pass
            
        del auth_dict[uid]
        
        from services.profile import profiles_dict
        try: del profiles_dict[uid]
        except: pass
        
        return {"success": True, "message": "Account deleted from backend."}
    except KeyError:
        return {"success": False, "message": "User not found."}
