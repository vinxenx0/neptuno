# backend/schemas/message.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    to_user_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    from_user_id: Optional[int]
    to_user_id: Optional[int]
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True