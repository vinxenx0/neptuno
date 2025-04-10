# sdk/models/user.py

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UpdateProfileRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    ciudad: Optional[str] = None
    website: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    rol: str
    activo: bool
    subscription: str
    ciudad: Optional[str] = None
    website: Optional[str] = None
    credits: int
    create_at: datetime
    last_ip: Optional[str] = None

    class Config:
        from_attributes = True
