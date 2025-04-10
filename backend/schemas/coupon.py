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
    coupon_type_id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None

class CouponResponse(CouponBase):
    id: int
    coupon_type_id: int
    issued_at: datetime
    redeemed_at: Optional[datetime] = None
    status: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    redeemed_by_user_id: Optional[int] = None
    redeemed_by_session_id: Optional[str] = None

    class Config:
        from_attributes = True