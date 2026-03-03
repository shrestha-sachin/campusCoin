import json
import os
import hashlib
import modal
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

router = APIRouter()

# ── Modal Dicts (same as the rest of the app) ──────────────────────────────────
auth_dict = modal.Dict.from_name("campuscoin-auth", create_if_missing=True)
student_id_dict = modal.Dict.from_name("campuscoin-student-ids", create_if_missing=True)
profiles_dict = modal.Dict.from_name("campuscoin-profiles", create_if_missing=True)

ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "campuscoin-admin-2026")


def _require_admin(x_admin_key: Optional[str]):
    if not x_admin_key or x_admin_key != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin key")


def _iter_dict(d: modal.Dict):
    """Iterate over all key-value pairs in a Modal Dict."""
    try:
        for key in d.keys():
            try:
                yield key, d[key]
            except Exception:
                pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error iterating dict: {e}")


@router.get("/users")
async def get_all_users(x_admin_key: Optional[str] = Header(None)):
    """Return all registered user auth records."""
    _require_admin(x_admin_key)
    users = []
    for key, raw in _iter_dict(auth_dict):
        try:
            entry = json.loads(raw)
            users.append({
                "email": entry.get("email", key),
                "user_id": entry.get("user_id"),
                "name": entry.get("name"),
                "student_id": entry.get("student_id"),
                "password_hash": entry.get("password_hash"),  # SHA-256 hex, not plaintext
                "hash_algorithm": "sha256",
            })
        except Exception:
            users.append({"email": key, "raw": str(raw)[:200], "parse_error": True})
    return {"count": len(users), "users": users}


@router.get("/profiles")
async def get_all_profiles(x_admin_key: Optional[str] = Header(None)):
    """Return all saved user profiles (income, expenses, goals, etc.)."""
    _require_admin(x_admin_key)
    profiles = []
    for user_id, raw in _iter_dict(profiles_dict):
        try:
            data = json.loads(raw)
            profiles.append({"user_id": user_id, **data})
        except Exception:
            profiles.append({"user_id": user_id, "raw": str(raw)[:200], "parse_error": True})
    return {"count": len(profiles), "profiles": profiles}


@router.get("/student-ids")
async def get_student_id_map(x_admin_key: Optional[str] = Header(None)):
    """Return all student-id -> email mappings (reverse lookup index)."""
    _require_admin(x_admin_key)
    mappings = []
    for student_id, email in _iter_dict(student_id_dict):
        mappings.append({"student_id": student_id, "email": email})
    return {"count": len(mappings), "mappings": mappings}


@router.get("/stats")
async def get_stats(x_admin_key: Optional[str] = Header(None)):
    """Return high-level database statistics."""
    _require_admin(x_admin_key)
    user_count = sum(1 for _ in _iter_dict(auth_dict))
    profile_count = sum(1 for _ in _iter_dict(profiles_dict))
    sid_count = sum(1 for _ in _iter_dict(student_id_dict))
    return {
        "total_registered_users": user_count,
        "total_saved_profiles": profile_count,
        "total_student_id_mappings": sid_count,
    }


@router.delete("/users/{email}")
async def delete_user(email: str, x_admin_key: Optional[str] = Header(None)):
    """Admin hard-delete a user by email (auth + profile + student-id)."""
    _require_admin(x_admin_key)
    email = email.strip().lower()
    user_id = hashlib.md5(email.encode()).hexdigest()

    results = {}

    try:
        raw = auth_dict[email]
        entry = json.loads(raw)
        sid = entry.get("student_id")
        del auth_dict[email]
        results["auth_deleted"] = True
        if sid:
            try:
                del student_id_dict[sid]
                results["student_id_deleted"] = True
            except Exception:
                results["student_id_deleted"] = False
    except KeyError:
        results["auth_deleted"] = False

    try:
        del profiles_dict[user_id]
        results["profile_deleted"] = True
    except KeyError:
        results["profile_deleted"] = False

    return {"success": True, "email": email, **results}
