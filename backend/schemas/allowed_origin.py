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