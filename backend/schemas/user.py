# backend/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    ciudad: Optional[str] = None
    website: Optional[str] = None

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
    subscription: str  # Esto funciona porque Pydantic automáticamente usa el .value de los Enum
    ciudad: Optional[str] = None
    website: Optional[str] = None
    credits: int
    create_at: datetime
    last_ip: Optional[str] = None

    class Config:
        from_attributes = True  # Esto reemplaza a orm_mode = True en Pydantic v2