from pydantic import BaseModel
from datetime import datetime

class APILogBase(BaseModel):
    user_id: int | None
    endpoint: str
    method: str
    status_code: int
    request_data: str | None
    response_data: str | None
    timestamp: datetime

class APILogResponse(APILogBase):
    id: int

    class Config:
        from_attributes = True  # Reemplaza orm_mode = True