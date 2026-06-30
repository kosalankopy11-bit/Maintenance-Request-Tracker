from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), current=Depends(get_current_user)):
    query = db.query(Notification)
    if current["role"] == "tenant":
        query = query.filter(Notification.tenant_id == current["id"])
    else:
        query = query.filter(Notification.staff_id == current["id"])
    rows = query.order_by(Notification.created_at.desc()).limit(20).all()
    return [
        {
            "notification_id": row.notification_id,
            "title": row.title,
            "message": row.message,
            "created_at": row.created_at,
        }
        for row in rows
    ]
