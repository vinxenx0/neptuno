from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    ciudad: Optional[str] = None
    url: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    ciudad: Optional[str] = None
    url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    rol: str
    activo: bool
    plan: str
    ciudad: Optional[str] = None
    url: Optional[str] = None
    consultas_restantes: int
    fecha_creacion: datetime
    ultima_ip: Optional[str] = None

    class Config:
        from_attributes = True  # Permite mapear desde modelos SQLAlchemy