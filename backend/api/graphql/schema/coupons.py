# backend/api/v1/graphql/schema/coupons.py
import strawberry
from typing import List, Optional
from datetime import datetime
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from schemas.coupon import CouponResponse, CouponTypeResponse
from services.coupon_service import (
    create_coupon,
    get_user_coupons,
    get_all_coupons,
    update_coupon,
    delete_coupon,
    redeem_coupon,
    create_coupon_type,
    get_coupon_types,
    create_test_coupon,
    get_coupon_activity
)
from services.settings_service import get_setting

@strawberry.type
class Coupon:
    id: int
    name: str
    description: Optional[str]
    unique_identifier: str
    issued_at: str
    expires_at: Optional[str]
    redeemed_at: Optional[str]
    active: bool
    status: str
    credits: int
    user_id: Optional[int]
    session_id: Optional[str]
    redeemed_by_user_id: Optional[int]
    redeemed_by_session_id: Optional[str]

    @classmethod
    def from_db(cls, coupon):
        return cls(
            id=coupon.id,
            name=coupon.name,
            description=coupon.description,
            unique_identifier=coupon.unique_identifier,
            issued_at=coupon.issued_at.isoformat(),
            expires_at=coupon.expires_at.isoformat() if coupon.expires_at else None,
            redeemed_at=coupon.redeemed_at.isoformat() if coupon.redeemed_at else None,
            active=coupon.active,
            status=coupon.status,
            credits=coupon.credits,
            user_id=coupon.user_id,
            session_id=coupon.session_id,
            redeemed_by_user_id=coupon.redeemed_by_user_id,
            redeemed_by_session_id=coupon.redeemed_by_session_id
        )

@strawberry.type
class CouponType:
    id: int
    name: str
    description: Optional[str]
    credits: int
    active: bool
    created_at: str
    updated_at: str

    @classmethod
    def from_db(cls, coupon_type):
        return cls(
            id=coupon_type.id,
            name=coupon_type.name,
            description=coupon_type.description,
            credits=coupon_type.credits,
            active=coupon_type.active,
            created_at=coupon_type.created_at.isoformat(),
            updated_at=coupon_type.updated_at.isoformat()
        )

@strawberry.input
class CouponInput:
    name: str
    description: Optional[str] = None
    credits: int
    expires_at: Optional[str] = None
    active: bool = True

@strawberry.input
class CouponTypeInput:
    name: str
    description: Optional[str] = None
    credits: int
    active: bool = True

@strawberry.type
class CouponActivity:
    id: int
    coupon_type: int
    unique_identifier: str
    user_id: Optional[int]
    session_id: Optional[str]
    status: str
    issued_at: str
    redeemed_at: Optional[str]

@strawberry.type
class CouponQueries:
    @strawberry.field
    async def my_coupons(self, info) -> List[Coupon]:
        user = await get_user_context(info.context["request"], info.context["db"])
        enable_coupons = get_setting(info.context["db"], "enable_coupons")
        if enable_coupons != "true":
            raise Exception("Coupons functionality is disabled")
        
        user_id = int(user.user_id) if user.user_type == "registered" else None
        session_id = user.session_id if user.user_type == "anonymous" else None
        coupons = get_user_coupons(info.context["db"], user_id, session_id)
        return [Coupon.from_db(c) for c in coupons]

    @strawberry.field
    async def coupons(self, info) -> List[Coupon]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can view all coupons")
        return [Coupon.from_db(c) for c in get_all_coupons(info.context["db"])]

    @strawberry.field
    async def coupon_types(self, info) -> List[CouponType]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can view coupon types")
        return [CouponType.from_db(ct) for ct in get_coupon_types(info.context["db"])]

    @strawberry.field
    async def coupon_activity(
        self,
        info,
        page: int = 1,
        limit: int = 10
    ) -> List[CouponActivity]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can view coupon activity")
        
        activity = get_coupon_activity(info.context["db"], page, limit)
        return [
            CouponActivity(
                id=item["id"],
                coupon_type=item["coupon_type"],
                unique_identifier=item["unique_identifier"],
                user_id=item["user_id"],
                session_id=item["session_id"],
                status=item["status"],
                issued_at=item["issued_at"],
                redeemed_at=item["redeemed_at"]
            )
            for item in activity["data"]
        ]

@strawberry.type
class CouponMutations:
    @strawberry.mutation
    async def create_coupon(
        self,
        info,
        input: CouponInput
    ) -> Coupon:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create coupons")
        
        coupon_data = {
            "name": input.name,
            "description": input.description,
            "credits": input.credits,
            "expires_at": datetime.fromisoformat(input.expires_at) if input.expires_at else None,
            "active": input.active
        }
        coupon = create_coupon(info.context["db"], coupon_data)
        return Coupon.from_db(coupon)

    @strawberry.mutation
    async def update_coupon(
        self,
        info,
        coupon_id: int,
        input: CouponInput
    ) -> Coupon:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can update coupons")
        
        coupon_data = {
            "name": input.name,
            "description": input.description,
            "credits": input.credits,
            "expires_at": datetime.fromisoformat(input.expires_at) if input.expires_at else None,
            "active": input.active
        }
        coupon = update_coupon(info.context["db"], coupon_id, coupon_data)
        return Coupon.from_db(coupon)

    @strawberry.mutation
    async def delete_coupon(
        self,
        info,
        coupon_id: int
    ) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can delete coupons")
        
        delete_coupon(info.context["db"], coupon_id)
        return True

    @strawberry.mutation
    async def redeem_coupon(
        self,
        info,
        coupon_id: int
    ) -> Coupon:
        user = await get_user_context(info.context["request"], info.context["db"])
        enable_coupons = get_setting(info.context["db"], "enable_coupons")
        if enable_coupons != "true":
            raise Exception("Coupons functionality is disabled")
        
        user_id = int(user.user_id) if user.user_type == "registered" else None
        session_id = user.session_id if user.user_type == "anonymous" else None
        coupon = redeem_coupon(info.context["db"], coupon_id, user_id, session_id)
        return Coupon.from_db(coupon)

    @strawberry.mutation
    async def create_coupon_type(
        self,
        info,
        input: CouponTypeInput
    ) -> CouponType:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create coupon types")
        
        coupon_type = create_coupon_type(info.context["db"], {
            "name": input.name,
            "description": input.description,
            "credits": input.credits,
            "active": input.active
        })
        return CouponType.from_db(coupon_type)

    @strawberry.mutation
    async def create_test_coupon(
        self,
        info,
        coupon_type_id: int
    ) -> Coupon:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create test coupons")
        
        coupon = create_test_coupon(info.context["db"], coupon_type_id, int(user.user_id))
        return Coupon.from_db(coupon)