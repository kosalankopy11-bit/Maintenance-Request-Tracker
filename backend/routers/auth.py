from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Staff, Tenant
from ..schemas.auth import LoginRequest, TokenResponse
from ..schemas.user import TenantCreate
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: TenantCreate, db: Session = Depends(get_db)):
    exists = db.query(Tenant).filter(Tenant.email == payload.email).first() or db.query(Staff).filter(Staff.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")
    tenant = Tenant(name=payload.name, email=payload.email, password=hash_password(payload.password), phone=payload.phone)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    token = create_access_token(tenant.email, "tenant", tenant.tenant_id)
    return {"access_token": token, "role": "tenant", "name": tenant.name, "email": tenant.email}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.email == payload.email).first()
    staff = db.query(Staff).filter(Staff.email == payload.email).first()
    user = tenant or staff
    role = "tenant" if tenant else "staff"
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = user.tenant_id if role == "tenant" else user.staff_id
    token = create_access_token(user.email, role, user_id)
    return {"access_token": token, "role": role, "name": user.name, "email": user.email}


@router.post("/logout")
def logout():
    return {"message": "Logged out. Remove the token on the client."}
