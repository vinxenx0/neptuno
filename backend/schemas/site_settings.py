# backend/schemas/site_settings.py
# Esquemas Pydantic para configuración del sitio

# Limpieza: todos los imports son usados en este archivo.

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SiteSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    tag: Optional[str] = None

class SiteSettingCreate(SiteSettingBase):
    pass

class SiteSettingResponse(SiteSettingBase):
    id: int
    updated_by: Optional[int] = None
    updated_at: datetime

    class Config:
        orm_mode = True