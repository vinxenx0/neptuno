# backend/schemas/coupon.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CouponTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    credits: int
    active: bool = True

class CouponTypeCreate(CouponTypeBase):
    pass

class CouponTypeResponse(CouponTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CouponBase(BaseModel):
    unique_identifier: str
    expires_at: Optional[datetime] = None

class CouponCreate(BaseModel):
    name: str
    description: Optional[str] = None
    credits: int
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    active: bool = True
    unique_identifier: str
    coupon_type_id: int  # Campo obligatorio         
    status: str
    unique_identifier: str
    coupon_type_id: int

class CouponResponse(CouponCreate):
    id: int
    name: str
    credits: int
    issued_at: datetime
    expires_at: Optional[datetime] = None
    redeemed_at: Optional[datetime] = None
    status: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    redeemed_by_user_id: Optional[str] = None
    redeemed_by_session_id: Optional[str] = None

    class Config:
        from_attributes = True