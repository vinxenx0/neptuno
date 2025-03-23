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