from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class RequestHistory(Base):
    __tablename__ = "request_history"

    history_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("maintenance_requests.request_id"), index=True)
    staff_id: Mapped[int | None] = mapped_column(ForeignKey("staff.staff_id"), nullable=True)
    previous_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(30))
    changed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request = relationship("MaintenanceRequest", back_populates="history")
    staff = relationship("Staff", back_populates="history")
