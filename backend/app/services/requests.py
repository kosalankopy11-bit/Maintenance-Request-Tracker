from sqlalchemy.orm import Session
from ..models import MaintenanceRequest, RequestHistory


STATUS_FLOW = ["Open", "In Progress", "Resolved"]


def serialize_request(item: MaintenanceRequest) -> dict:
    return {
        "request_id": item.request_id,
        "tenant_id": item.tenant_id,
        "staff_id": item.staff_id,
        "title": item.title,
        "description": item.description,
        "priority": item.priority,
        "status": item.status,
        "attachment": item.attachment,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "tenant_name": item.tenant.name if item.tenant else None,
        "staff_name": item.staff.name if item.staff else None,
    }


def can_transition(previous: str, new: str) -> bool:
    if previous == new:
        return True
    try:
        return STATUS_FLOW.index(new) == STATUS_FLOW.index(previous) + 1
    except ValueError:
        return False


def log_status_change(db: Session, request: MaintenanceRequest, new_status: str, staff_id: int | None) -> None:
    history = RequestHistory(
        request_id=request.request_id,
        staff_id=staff_id,
        previous_status=request.status,
        status=new_status,
    )
    request.status = new_status
    db.add(history)
