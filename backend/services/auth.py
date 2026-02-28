import json
import hashlib
import modal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()

# Stores: email -> { user_id, password_hash, name }
auth_dict = modal.Dict.from_name("campuscoin-auth", create_if_missing=True)


def _hash_password(password: str) -> str:
    """Simple SHA-256 hash for hackathon. Use bcrypt in production."""
    return hashlib.sha256(password.encode()).hexdigest()


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
async def signup(req: SignupRequest):
    """
    Register a new user. Stores email + hashed password.
    Returns a user_id that links to their profile and Nessie account.
    """
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")

    # Validate .edu email
    if not email.endswith(".edu"):
        raise HTTPException(status_code=400, detail="Please use a valid university email (.edu)")

    # Check if email already exists
    try:
        existing = auth_dict[email]
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    except KeyError:
        pass  # Email not found — good, we can create

    # Generate a user_id from the email (deterministic so it's always the same)
    user_id = hashlib.md5(email.encode()).hexdigest()

    auth_entry = {
        "user_id": user_id,
        "password_hash": _hash_password(req.password),
        "name": req.name.strip(),
        "email": email,
    }
    auth_dict[email] = json.dumps(auth_entry)

    return {
        "success": True,
        "user_id": user_id,
        "name": req.name.strip(),
        "email": email,
    }


@router.post("/login")
async def login(req: LoginRequest):
    """
    Verify email + password. Returns user_id + profile data if found.
    """
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Look up the user
    try:
        raw = auth_dict[email]
        auth_entry = json.loads(raw)
    except KeyError:
        raise HTTPException(status_code=401, detail="No account found with this email. Please sign up first.")

    # Verify password
    if auth_entry["password_hash"] != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    user_id = auth_entry["user_id"]

    # Try to fetch their saved profile
    from services.profile import profiles_dict
    profile_data = None
    try:
        profile_raw = profiles_dict[user_id]
        profile_data = json.loads(profile_raw)
    except KeyError:
        pass  # No profile yet (user signed up but didn't complete onboarding)

    return {
        "success": True,
        "user_id": user_id,
        "name": auth_entry["name"],
        "email": email,
        "profile_data": profile_data,  # null if not onboarded yet
    }


class DeleteRequest(BaseModel):
    email: str


@router.post("/delete-account")
async def delete_account(req: DeleteRequest):
    """Delete a user's auth entry and profile data."""
    email = req.email.strip().lower()
    user_id = hashlib.md5(email.encode()).hexdigest()

    deleted_auth = False
    deleted_profile = False

    try:
        del auth_dict[email]
        deleted_auth = True
    except KeyError:
        pass

    from services.profile import profiles_dict
    try:
        del profiles_dict[user_id]
        deleted_profile = True
    except KeyError:
        pass

    return {
        "success": True,
        "email": email,
        "user_id": user_id,
        "deleted_auth": deleted_auth,
        "deleted_profile": deleted_profile,
    }
