# backend/schemas/anonymous_session.py
# Esquema Pydantic para sesiones anónimas

from pydantic import BaseModel
from datetime import datetime

class GuestsSessionBase(BaseModel):
    id: str
    username: str  # Nuevo campo
    credits: int
    create_at: datetime
    ultima_actividad: datetime | None
    last_ip: str | None

class GuestsSessionResponse(GuestsSessionBase):
    class Config:
        from_attributes = True  # Reemplaza orm_mode = True