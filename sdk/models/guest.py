from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GuestsSessionResponse(BaseModel):
    id: str
    username: str
    credits: int
    create_at: datetime
    ultima_actividad: Optional[datetime]
    last_ip: Optional[str]

    class Config:
        from_attributes = True
