# backend/schemas/allowed_origin.py
# Esquema Pydantic para orígenes permitidos (CORS)

from pydantic import BaseModel

class AllowedOrigin(BaseModel):
    id: int
    origin: str

    class Config:
        orm_mode = True

class AllowedOriginCreate(BaseModel):
    origin: str

class AllowedOriginResponse(BaseModel):
    id: int
    origin: str

    class Config:
        orm_mode = True