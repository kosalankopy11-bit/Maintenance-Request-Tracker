from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .models import Staff, Tenant
from .security import decode_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
    except ValueError:
        raise credentials_error
    role = payload.get("role")
    user_id = payload.get("user_id")
    if role == "tenant":
        user = db.get(Tenant, user_id)
    elif role == "staff":
        user = db.get(Staff, user_id)
    else:
        user = None
    if not user:
        raise credentials_error
    return {"role": role, "id": user_id, "user": user}


def require_staff(current=Depends(get_current_user)):
    if current["role"] != "staff":
        raise HTTPException(status_code=403, detail="Staff access required")
    return current


def require_tenant(current=Depends(get_current_user)):
    if current["role"] != "tenant":
        raise HTTPException(status_code=403, detail="Tenant access required")
    return current
