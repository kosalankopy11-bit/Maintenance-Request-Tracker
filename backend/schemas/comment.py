from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    comment: str = Field(min_length=1, max_length=2000)


class CommentRead(BaseModel):
    comment_id: int
    request_id: int
    tenant_id: int | None
    staff_id: int | None
    comment: str
    created_at: datetime
    author_name: str
    author_role: str
    avatar: str | None = None

    model_config = {"from_attributes": True}
