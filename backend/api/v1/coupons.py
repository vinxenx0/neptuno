# backend/api/v1/coupons.py
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.coupon_service import (
    create_coupon, get_user_coupons, get_all_coupons, update_coupon, delete_coupon, redeem_coupon
)
from schemas.coupon import CouponCreate, CouponResponse, CouponUpdate
from services.settings_service import get_setting
from typing import List

router = APIRouter(tags=["Coupons"])

@router.post("/", response_model=CouponResponse)
def create_coupon_endpoint(
    coupon_data: CouponCreate,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear cupones")
    return create_coupon(db, coupon_data)

@router.get("/me", response_model=List[CouponResponse])
def get_my_coupons(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(status_code=403, detail="La funcionalidad de cupones está deshabilitada")
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None
    return get_user_coupons(db, user_id, session_id)

@router.get("/", response_model=List[CouponResponse])
def get_all_coupons_endpoint(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver todos los cupones")
    return get_all_coupons(db)

@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon_endpoint(
    coupon_id: int,
    coupon_update: CouponUpdate,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden actualizar cupones")
    return update_coupon(db, coupon_id, coupon_update)

@router.delete("/{coupon_id}")
def delete_coupon_endpoint(
    coupon_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar cupones")
    return delete_coupon(db, coupon_id)

@router.post("/redeem/{coupon_id}", response_model=CouponResponse)
def redeem_coupon_endpoint(
    coupon_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(status_code=403, detail="La funcionalidad de cupones está deshabilitada")
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None
    return redeem_coupon(db, coupon_id, user_id, session_id)

@router.post("/generate-demo-coupon", response_model=CouponResponse)
def generate_demo_coupon(
    credits: int,
    db: Session = Depends(get_db)
):
    coupon_data = CouponCreate(
        name="Demo Coupon",
        description="Cupón de demostración",
        credits=credits,
        active=True,
        unique_identifier=str(uuid.uuid4())
    )
    coupon = create_coupon(db, coupon_data)
    return coupon