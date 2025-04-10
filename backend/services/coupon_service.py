# backend/services/coupon_service.py
from typing import Optional
from sqlalchemy.orm import Session
from models.guests import GuestsSession
from models.user import User
from models.coupon import Coupon
from models.coupon_type import CouponType
from schemas.coupon import CouponCreate, CouponResponse
from core.logging import configure_logging
from fastapi import HTTPException
import uuid
from datetime import datetime

logger = configure_logging()

def create_coupon(db: Session, coupon_data: CouponCreate) -> Coupon:
    coupon_type = db.query(CouponType).filter(CouponType.id == coupon_data.coupon_type_id, CouponType.active == True).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="Tipo de cupón no encontrado o inactivo")

    unique_identifier = str(uuid.uuid4())
    while db.query(Coupon).filter(Coupon.unique_identifier == unique_identifier).first():
        unique_identifier = str(uuid.uuid4())

    coupon = Coupon(
        coupon_type_id=coupon_data.coupon_type_id,
        unique_identifier=unique_identifier,
        user_id=coupon_data.user_id,
        session_id=coupon_data.session_id,
        status="active"
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón creado: {coupon.unique_identifier} para tipo {coupon_type.name}")
    return coupon

def get_coupon_by_id(db: Session, coupon_id: int) -> Coupon:
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return coupon

def get_user_coupons(db: Session, user_id: Optional[int], session_id: Optional[str]) -> list[Coupon]:
    query = db.query(Coupon)
    if user_id:
        query = query.filter(Coupon.user_id == user_id)
    elif session_id:
        query = query.filter(Coupon.session_id == session_id)
    return query.all()

def get_all_coupons(db: Session) -> list[Coupon]:
    return db.query(Coupon).all()

def update_coupon(db: Session, coupon_id: int, coupon_update: dict) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    for key, value in coupon_update.items():
        if value is not None:
            setattr(coupon, key, value)
    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón actualizado: {coupon.unique_identifier}")
    return coupon

def delete_coupon(db: Session, coupon_id: int):
    coupon = get_coupon_by_id(db, coupon_id)
    db.delete(coupon)
    db.commit()
    logger.info(f"Cupón eliminado: {coupon.unique_identifier}")
    return {"message": "Cupón eliminado"}

def redeem_coupon(db: Session, coupon_id: int, user_id: Optional[int], session_id: Optional[str]) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    
    if coupon.status != "active":
        raise HTTPException(status_code=400, detail="Cupón no está activo")
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        coupon.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Cupón expirado")
    if (coupon.user_id and coupon.user_id != user_id) or (coupon.session_id and coupon.session_id != session_id):
        raise HTTPException(status_code=403, detail="Cupón no pertenece a este usuario/sesión")

    coupon.redeemed_at = datetime.utcnow()
    coupon.status = "redeemed"
    
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user.credits += coupon.coupon_type.credits
        coupon.redeemed_by_user_id = user_id
    elif session_id:
        session = db.query(GuestsSession).filter(GuestsSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")
        session.credits += coupon.coupon_type.credits
        coupon.redeemed_by_session_id = session_id

    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón canjeado: {coupon.unique_identifier} por {user_id or session_id}")
    return coupon