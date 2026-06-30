from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    requests = relationship("MaintenanceRequest", back_populates="tenant", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="tenant")


class Staff(Base):
    __tablename__ = "staff"

    staff_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    requests = relationship("MaintenanceRequest", back_populates="staff")
    comments = relationship("Comment", back_populates="staff")
    history = relationship("RequestHistory", back_populates="staff")
