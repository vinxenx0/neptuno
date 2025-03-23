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
        orm_mode = True