# backend/api/v1/anonymous_sessions.py
from pydantic import BaseModel
from datetime import datetime

class AnonymousSessionBase(BaseModel):
    id: str
    credits: int
    create_at: datetime
    ultima_actividad: datetime | None
    last_ip: str | None

class AnonymousSessionResponse(AnonymousSessionBase):
    class Config:
        from_attributes = True  # Reemplaza orm_mode = True