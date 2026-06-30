from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Comment, MaintenanceRequest
from ..schemas.comment import CommentCreate, CommentRead
from ..services.notifications import notify_staff, notify_tenant

router = APIRouter(prefix="/requests/{request_id}/comments", tags=["Comments"])


def ensure_access(request: MaintenanceRequest, current):
    if current["role"] == "tenant" and request.tenant_id != current["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.get("", response_model=list[CommentRead])
def get_comments(request_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    ensure_access(request, current)
    rows = db.query(Comment).filter(Comment.request_id == request_id).order_by(Comment.created_at.desc()).all()
    return [
        {
            **row.__dict__,
            "author_name": row.tenant.name if row.tenant else row.staff.name,
            "author_role": "tenant" if row.tenant_id else "staff",
            "avatar": row.tenant.profile_picture if row.tenant else row.staff.profile_picture,
        }
        for row in rows
    ]


@router.post("", response_model=CommentRead, status_code=201)
def add_comment(request_id: int, payload: CommentCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    ensure_access(request, current)
    comment = Comment(
        request_id=request_id,
        tenant_id=current["id"] if current["role"] == "tenant" else None,
        staff_id=current["id"] if current["role"] == "staff" else None,
        comment=payload.comment,
    )
    db.add(comment)
    if current["role"] == "tenant" and request.staff_id:
        notify_staff(db, request.staff_id, "Comment Added", f"Tenant commented on request #{request_id}")
    if current["role"] == "staff":
        notify_tenant(db, request.tenant_id, "Comment Added", f"Staff commented on request #{request_id}")
    db.commit()
    db.refresh(comment)
    return {
        **comment.__dict__,
        "author_name": current["user"].name,
        "author_role": current["role"],
        "avatar": current["user"].profile_picture,
    }
