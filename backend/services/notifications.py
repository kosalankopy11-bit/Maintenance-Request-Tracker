from sqlalchemy.orm import Session
from ..models import Notification, Staff


def notify_tenant(db: Session, tenant_id: int, title: str, message: str) -> None:
    db.add(Notification(tenant_id=tenant_id, title=title, message=message))


def notify_staff(db: Session, staff_id: int, title: str, message: str) -> None:
    db.add(Notification(staff_id=staff_id, title=title, message=message))


def notify_all_staff(db: Session, title: str, message: str) -> None:
    for staff in db.query(Staff).all():
        notify_staff(db, staff.staff_id, title, message)
