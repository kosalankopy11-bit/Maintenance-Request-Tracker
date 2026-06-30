from datetime import datetime
from pydantic import BaseModel, Field


class RequestBase(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10)
    priority: str = Field(pattern="^(Low|Medium|High)$")
    attachment: str | None = None


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = Field(default=None, min_length=10)
    priority: str | None = Field(default=None, pattern="^(Low|Medium|High)$")


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(Open|In Progress|Resolved)$")


class AssignRequest(BaseModel):
    staff_id: int


class RequestRead(BaseModel):
    request_id: int
    tenant_id: int
    staff_id: int | None
    title: str
    description: str
    priority: str
    status: str
    attachment: str | None
    created_at: datetime
    updated_at: datetime
    tenant_name: str | None = None
    staff_name: str | None = None

    model_config = {"from_attributes": True}


class RequestListResponse(BaseModel):
    items: list[RequestRead]
    total: int
    page: int
    page_size: int
