from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    request_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.tenant_id"), index=True)
    staff_id: Mapped[int | None] = mapped_column(ForeignKey("staff.staff_id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")
    status: Mapped[str] = mapped_column(String(30), default="Open", index=True)
    attachment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="requests")
    staff = relationship("Staff", back_populates="requests")
    comments = relationship("Comment", back_populates="request", cascade="all, delete-orphan")
    history = relationship("RequestHistory", back_populates="request", cascade="all, delete-orphan")
