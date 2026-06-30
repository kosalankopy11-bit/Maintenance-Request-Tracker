from datetime import datetime
from pydantic import BaseModel


class HistoryRead(BaseModel):
    history_id: int
    request_id: int
    staff_id: int | None
    previous_status: str | None
    status: str
    changed_at: datetime
    staff_name: str | None = None

    model_config = {"from_attributes": True}
