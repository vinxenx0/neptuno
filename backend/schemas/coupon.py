# backend/schemas/coupon.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CouponBase(BaseModel):
    name: str
    description: Optional[str] = None
    unique_identifier: str
    expires_at: Optional[datetime] = None
    credits: int
    active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    expires_at: Optional[datetime] = None
    credits: Optional[int] = None
    active: Optional[bool] = None
    status: Optional[str] = None

class CouponResponse(CouponBase):
    id: int
    issued_at: datetime
    redeemed_at: Optional[datetime] = None
    status: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    redeemed_by_user_id: Optional[int] = None
    redeemed_by_session_id: Optional[str] = None

    class Config:
        from_attributes = True  # Reemplaza orm_mode=True, siguiendo la versión moderna de Pydantic