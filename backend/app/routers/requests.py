from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..dependencies import get_current_user, require_staff, require_tenant
from ..models import MaintenanceRequest, RequestHistory, Staff, Tenant
from ..schemas.request import AssignRequest, RequestCreate, RequestListResponse, RequestRead, RequestUpdate, StatusUpdate
from ..services.exporter import requests_to_csv, requests_to_pdf
from ..services.importer import parse_csv
from ..services.notifications import notify_all_staff, notify_staff, notify_tenant
from ..services.requests import can_transition, log_status_change, serialize_request

router = APIRouter(tags=["Requests"])


def base_query(db: Session):
    return db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.tenant),
        joinedload(MaintenanceRequest.staff),
    )


def apply_filters(query, search=None, status=None, priority=None, assigned_staff=None, date_from=None, date_to=None):
    if search:
        like = f"%{search}%"
        query = query.filter(MaintenanceRequest.title.like(like))
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if priority:
        query = query.filter(MaintenanceRequest.priority == priority)
    if assigned_staff:
        query = query.filter(MaintenanceRequest.staff_id == assigned_staff)
    if date_from:
        query = query.filter(MaintenanceRequest.created_at >= date_from)
    if date_to:
        query = query.filter(MaintenanceRequest.created_at <= date_to)
    return query


@router.post("/requests", response_model=RequestRead, status_code=201)
def create_request(payload: RequestCreate, db: Session = Depends(get_db), current=Depends(require_tenant)):
    request = MaintenanceRequest(
        tenant_id=current["id"],
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        attachment=payload.attachment,
        status="Open",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    notify_all_staff(db, "New Request", f"#{request.request_id} {request.title} was submitted")
    db.commit()
    return serialize_request(request)


@router.get("/requests/tenant", response_model=RequestListResponse)
def tenant_requests(
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current=Depends(require_tenant),
):
    query = apply_filters(base_query(db).filter(MaintenanceRequest.tenant_id == current["id"]), search)
    total = query.count()
    rows = query.order_by(MaintenanceRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"items": [serialize_request(row) for row in rows], "total": total, "page": page, "page_size": page_size}


@router.get("/requests", response_model=RequestListResponse)
def all_requests(
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    assigned_staff: int | None = None,
    sort: str = "created_at",
    direction: str = "desc",
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    query = apply_filters(base_query(db), search, status, priority, assigned_staff)
    total = query.count()
    sort_col = getattr(MaintenanceRequest, sort, MaintenanceRequest.created_at)
    query = query.order_by(sort_col.asc() if direction == "asc" else sort_col.desc())
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": [serialize_request(row) for row in rows], "total": total, "page": page, "page_size": page_size}


@router.get("/requests/{request_id}", response_model=RequestRead)
def request_detail(request_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    request = base_query(db).filter(MaintenanceRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if current["role"] == "tenant" and request.tenant_id != current["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize_request(request)


@router.put("/requests/{request_id}", response_model=RequestRead)
def update_request(request_id: int, payload: RequestUpdate, db: Session = Depends(get_db), current=Depends(require_staff)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, key, value)
    db.commit()
    db.refresh(request)
    return serialize_request(request)


@router.delete("/requests/{request_id}", status_code=204)
def delete_request(request_id: int, db: Session = Depends(get_db), current=Depends(require_staff)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(request)
    db.commit()
    return None


@router.post("/requests/{request_id}/assign", response_model=RequestRead)
def assign_request(request_id: int, payload: AssignRequest, db: Session = Depends(get_db), current=Depends(require_staff)):
    request = db.get(MaintenanceRequest, request_id)
    staff = db.get(Staff, payload.staff_id)
    if not request or not staff:
        raise HTTPException(status_code=404, detail="Request or staff member not found")
    request.staff_id = payload.staff_id
    notify_staff(db, payload.staff_id, "Assigned Request", f"Request #{request.request_id} was assigned to you")
    notify_tenant(db, request.tenant_id, "Assigned Request", f"Request #{request.request_id} has been assigned to {staff.name}")
    db.commit()
    db.refresh(request)
    return serialize_request(request)


@router.post("/requests/{request_id}/status", response_model=RequestRead)
def update_status(request_id: int, payload: StatusUpdate, db: Session = Depends(get_db), current=Depends(require_staff)):
    request = db.get(MaintenanceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if not can_transition(request.status, payload.status):
        raise HTTPException(status_code=400, detail="Status must follow Open -> In Progress -> Resolved")
    log_status_change(db, request, payload.status, current["id"])
    title = "Resolved" if payload.status == "Resolved" else "Status Updated"
    notify_tenant(db, request.tenant_id, title, f"Request #{request.request_id} is now {payload.status}")
    db.commit()
    db.refresh(request)
    return serialize_request(request)


@router.get("/staff")
def list_staff(db: Session = Depends(get_db), current=Depends(require_staff)):
    return [{"staff_id": item.staff_id, "name": item.name, "department": item.department} for item in db.query(Staff).order_by(Staff.name).all()]


@router.get("/reports/summary")
def report_summary(db: Session = Depends(get_db), current=Depends(require_staff)):
    total = db.query(MaintenanceRequest).count()
    by_status = dict(db.query(MaintenanceRequest.status, func.count(MaintenanceRequest.request_id)).group_by(MaintenanceRequest.status).all())
    by_priority = dict(db.query(MaintenanceRequest.priority, func.count(MaintenanceRequest.request_id)).group_by(MaintenanceRequest.priority).all())
    resolved = db.query(MaintenanceRequest).filter(MaintenanceRequest.status == "Resolved").all()
    durations = [(item.updated_at - item.created_at).total_seconds() / 3600 for item in resolved if item.updated_at and item.created_at]
    recent_history = db.query(RequestHistory).order_by(RequestHistory.changed_at.desc()).limit(8).all()
    return {
        "request_count": total,
        "open": by_status.get("Open", 0),
        "resolved": by_status.get("Resolved", 0),
        "average_resolution_hours": round(sum(durations) / len(durations), 1) if durations else 0,
        "priority_distribution": by_priority,
        "status_distribution": by_status,
        "recent_activity": [
            {
                "history_id": h.history_id,
                "request_id": h.request_id,
                "previous_status": h.previous_status,
                "status": h.status,
                "changed_at": h.changed_at,
                "staff_name": h.staff.name if h.staff else None,
            }
            for h in recent_history
        ],
    }


@router.get("/export")
def export_requests(
    format: str = Query("csv", pattern="^(csv|pdf)$"),
    status: str | None = None,
    priority: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    rows = [serialize_request(row) for row in apply_filters(base_query(db), None, status, priority, None, date_from, date_to).all()]
    if format == "pdf":
        return Response(content=requests_to_pdf(rows), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=maintainhub-requests.pdf"})
    return PlainTextResponse(requests_to_csv(rows), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=maintainhub-requests.csv"})


@router.get("/import-csv/sample")
def sample_csv():
    return PlainTextResponse("tenant_id,title,description,priority\n1,Leaking sink,Kitchen sink leaking under cabinet,High\n1,Broken light,Hallway light is flickering,Medium\n", media_type="text/csv")


@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), preview: bool = False, db: Session = Depends(get_db), current=Depends(require_staff)):
    parsed = parse_csv(await file.read())
    if preview:
        return {"preview": parsed["valid"], "failed": parsed["failed"], "errors": parsed["errors"], "imported": 0}
    fallback_tenant = db.query(Tenant).order_by(Tenant.tenant_id).first()
    if not fallback_tenant:
        raise HTTPException(status_code=400, detail="Create at least one tenant before importing requests")
    imported = 0
    for row in parsed["valid"]:
        tenant_id = int(row["tenant_id"]) if row.get("tenant_id") else fallback_tenant.tenant_id
        if not db.get(Tenant, tenant_id):
            parsed["failed"].append({"data": row, "errors": [f"Tenant {tenant_id} was not found"]})
            parsed["errors"].append(f"Tenant {tenant_id} was not found")
            continue
        db.add(MaintenanceRequest(tenant_id=tenant_id, title=row["title"], description=row["description"], priority=row["priority"], status="Open"))
        imported += 1
    db.commit()
    return {"imported": imported, "failed": parsed["failed"], "errors": parsed["errors"]}
