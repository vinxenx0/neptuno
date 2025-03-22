from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IntegrationBase(BaseModel):
    name: str
    webhook_url: str
    event_type: str

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationResponse(IntegrationBase):
    id: int
    user_id: int
    active: bool
    created_at: datetime
    last_triggered: Optional[datetime] = None

    class Config:
        from_attributes = True  # Para mapear desde objetos SQLAlchemy