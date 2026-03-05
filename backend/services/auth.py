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

# Stores: email -> { user_id, password_hash, name, student_id }
auth_dict = modal.Dict.from_name("campuscoin-auth", create_if_missing=True)

# Stores: student_id -> email (reverse lookup for login-by-student-id)
student_id_dict = modal.Dict.from_name("campuscoin-student-ids", create_if_missing=True)


def _hash_password(password: str) -> str:
    """Simple SHA-256 hash for hackathon. Use bcrypt in production."""
    return hashlib.sha256(password.encode()).hexdigest()


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    student_id: str


class LoginRequest(BaseModel):
    identifier: str  # Can be email OR student ID
    password: str


class ChangePasswordRequest(BaseModel):
    email: str
    current_password: str
    new_password: str


@router.post("/signup")
async def signup(req: SignupRequest):
    """
    Register a new user. Stores email + hashed password + student ID.
    Returns a user_id that links to their profile and Nessie account.
    """
    email = req.email.strip().lower()
    student_id = req.student_id.strip()

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if not student_id:
        raise HTTPException(status_code=400, detail="University Student ID is required")


    # Check if email already exists
    try:
        existing = auth_dict[email]
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    except KeyError:
        pass

    # Check if student ID already exists
    try:
        existing_sid = student_id_dict[student_id]
        if existing_sid:
            raise HTTPException(status_code=409, detail="This Student ID is already linked to another account.")
    except KeyError:
        pass

    # Generate a user_id from the email (deterministic)
    user_id = hashlib.md5(email.encode()).hexdigest()

    auth_entry = {
        "user_id": user_id,
        "password_hash": _hash_password(req.password),
        "name": req.name.strip(),
        "email": email,
        "student_id": student_id,
    }
    auth_dict[email] = json.dumps(auth_entry)

    # Store reverse lookup: student_id -> email
    student_id_dict[student_id] = email

    return {
        "success": True,
        "user_id": user_id,
        "name": req.name.strip(),
        "email": email,
        "student_id": student_id,
    }


@router.post("/login")
async def login(req: LoginRequest):
    """
    Verify (email OR student_id) + password. Returns user_id + profile data.
    """
    identifier = req.identifier.strip().lower()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or Student ID is required")

    email = None

    # Determine if identifier is email or student ID
    if "@" in identifier:
        email = identifier
    else:
        # Try student ID lookup
        try:
            email = student_id_dict[identifier.upper()]  # Student IDs stored as-is
        except KeyError:
            # Also try lowercase
            try:
                email = student_id_dict[identifier]
            except KeyError:
                raise HTTPException(
                    status_code=401,
                    detail="No account found with this Student ID. Please sign up first."
                )

    # Look up the user by email
    try:
        raw = auth_dict[email]
        auth_entry = json.loads(raw)
    except KeyError:
        raise HTTPException(status_code=401, detail="No account found. Please sign up first.")

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
        pass

    return {
        "success": True,
        "user_id": user_id,
        "name": auth_entry["name"],
        "email": email,
        "student_id": auth_entry.get("student_id", ""),
        "profile_data": profile_data,
    }


@router.post("/change-password")
async def change_password(req: ChangePasswordRequest):
    """Change user's password after verifying current password."""
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not req.new_password or len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters")

    try:
        raw = auth_dict[email]
        auth_entry = json.loads(raw)
    except KeyError:
        raise HTTPException(status_code=404, detail="Account not found")

    # Verify current password
    if auth_entry["password_hash"] != _hash_password(req.current_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Update password
    auth_entry["password_hash"] = _hash_password(req.new_password)
    auth_dict[email] = json.dumps(auth_entry)

    return {"success": True, "message": "Password updated successfully"}


class DeleteRequest(BaseModel):
    email: str


@router.post("/delete-account")
async def delete_account(req: DeleteRequest):
    """Delete a user's auth entry and profile data."""
    email = req.email.strip().lower()
    user_id = hashlib.md5(email.encode()).hexdigest()

    deleted_auth = False
    deleted_profile = False

    # Delete auth entry and get student_id for reverse lookup cleanup
    try:
        raw = auth_dict[email]
        auth_entry = json.loads(raw)
        student_id = auth_entry.get("student_id")
        del auth_dict[email]
        deleted_auth = True

        # Also remove student ID reverse lookup
        if student_id:
            try:
                del student_id_dict[student_id]
            except KeyError:
                pass
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
