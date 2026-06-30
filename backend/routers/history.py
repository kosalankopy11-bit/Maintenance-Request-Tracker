from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import MaintenanceRequest, RequestHistory
from ..schemas.history import HistoryRead

router = APIRouter(prefix="/requests/{request_id}/history", tags=["History"])


@router.get("", response_model=list[HistoryRead])
def get_history(request_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if current["role"] == "tenant" and request.tenant_id != current["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")
    rows = db.query(RequestHistory).filter(RequestHistory.request_id == request_id).order_by(RequestHistory.changed_at.desc()).all()
    return [{**row.__dict__, "staff_name": row.staff.name if row.staff else None} for row in rows]
