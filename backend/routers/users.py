from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.user import PasswordChange, ProfileUpdate, UserProfile
from ..security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["Users"])


def profile_payload(current) -> dict:
    user = current["user"]
    if current["role"] == "tenant":
        return {
            "id": user.tenant_id,
            "name": user.name,
            "email": user.email,
            "role": "tenant",
            "phone": user.phone,
            "department": None,
            "profile_picture": user.profile_picture,
            "created_at": user.created_at,
        }
    return {
        "id": user.staff_id,
        "name": user.name,
        "email": user.email,
        "role": "staff",
        "phone": None,
        "department": user.department,
        "profile_picture": user.profile_picture,
        "created_at": user.created_at,
    }


@router.get("/profile", response_model=UserProfile)
def get_profile(current=Depends(get_current_user)):
    return profile_payload(current)


@router.put("/profile", response_model=UserProfile)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    user = current["user"]
    if payload.name is not None:
        user.name = payload.name
    if current["role"] == "tenant" and payload.phone is not None:
        user.phone = payload.phone
    if current["role"] == "staff" and payload.department is not None:
        user.department = payload.department
    if payload.profile_picture is not None:
        user.profile_picture = payload.profile_picture
    db.commit()
    db.refresh(user)
    return profile_payload(current)


@router.post("/change-password")
def change_password(payload: PasswordChange, db: Session = Depends(get_db), current=Depends(get_current_user)):
    user = current["user"]
    if not verify_password(payload.current_password, user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
