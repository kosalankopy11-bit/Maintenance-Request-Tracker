from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Comment(Base):
    __tablename__ = "comments"

    comment_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("maintenance_requests.request_id"), index=True)
    tenant_id: Mapped[int | None] = mapped_column(ForeignKey("tenants.tenant_id"), nullable=True)
    staff_id: Mapped[int | None] = mapped_column(ForeignKey("staff.staff_id"), nullable=True)
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request = relationship("MaintenanceRequest", back_populates="comments")
    tenant = relationship("Tenant", back_populates="comments")
    staff = relationship("Staff", back_populates="comments")
