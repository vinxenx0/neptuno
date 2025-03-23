from pydantic import BaseModel
from datetime import datetime

class ErrorLogBase(BaseModel):
    user_id: int | None
    session_id: str | None
    error_code: int
    message: str
    details: str | None
    url: str | None
    method: str | None
    ip_address: str | None
    created_at: datetime

class ErrorLogResponse(ErrorLogBase):
    id: int

    class Config:
        orm_mode = True  # Permite mapear desde objetos SQLAlchemy