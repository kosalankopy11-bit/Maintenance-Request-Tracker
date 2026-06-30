from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class TenantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None


class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    phone: str | None = None
    department: str | None = None
    profile_picture: str | None = None
    created_at: datetime


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = None
    department: str | None = None
    profile_picture: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
