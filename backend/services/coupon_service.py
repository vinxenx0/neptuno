# backend/services/coupon_service.py
from typing import Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session
from models.coupon import Coupon
from models.user import User
# from models.guests import GuestsSession
from schemas.coupon import CouponCreate, CouponResponse, CouponUpdate
from core.logging import configure_logging
from fastapi import HTTPException
import uuid
from datetime import datetime, timedelta

logger = configure_logging()

def create_test_coupon(db: Session, coupon_type_id: int, admin_user_id: int):
    unique_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=24)  # Expira en 24 horas
    new_coupon = Coupon(
        coupon_type_id=coupon_type_id,
        name="Test Coupon",  # Valor predeterminado para el campo name
        unique_identifier=unique_id,
        status="active",
        credits=1,
        issued_at=datetime.utcnow(),
        expires_at=expires_at,
        active=True,
        user_id=admin_user_id  # Asignamos el cupón al admin
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

def get_coupon_activity(db: Session, page: int = 1, limit: int = 10) -> dict:
    """
    Obtiene la actividad de cupones con paginación.
    """
    offset = (page - 1) * limit
    total_items = db.query(Coupon).count()
    total_pages = (total_items + limit - 1) // limit

    coupons = (
        db.query(Coupon)
        .order_by(desc(Coupon.issued_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Serialización manual para coincidir con el frontend
    coupons_data = [
        {
            "id": coupon.id,
            "coupon_type": coupon.coupon_type_id,
            "unique_identifier": coupon.unique_identifier,
            "user_id": coupon.user_id,
            "session_id": coupon.session_id,
            "status": coupon.status,
            "issued_at": coupon.issued_at.isoformat(),
            "redeemed_at": coupon.redeemed_at.isoformat() if coupon.redeemed_at else None,
        }
        for coupon in coupons
    ]

    return {
        "data": coupons_data,
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
    }

def create_coupon(db: Session, coupon_data: CouponCreate, user_id: int) -> Coupon:
    unique_identifier = str(uuid.uuid4())
    while db.query(Coupon).filter(Coupon.unique_identifier == unique_identifier).first():
        unique_identifier = str(uuid.uuid4())
    coupon = Coupon(
        coupon_type_id=coupon_data.coupon_type_id,
        name=coupon_data.name,
        credits=coupon_data.credits,
        description=coupon_data.description,
        unique_identifier=unique_identifier,
        expires_at=coupon_data.expires_at,
        active=coupon_data.active,
        user_id=user_id
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón creado: {coupon.unique_identifier}")
    return coupon

def get_coupon_by_id(db: Session, coupon_id: int) -> Coupon:
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return coupon

def get_user_coupons(db: Session, user_id: int) -> list[Coupon]:
    return db.query(Coupon).filter(Coupon.user_id == user_id).all()

def get_all_coupons(db: Session) -> list[Coupon]:
    return db.query(Coupon).all()

def update_coupon(db: Session, coupon_id: int, coupon_update: CouponUpdate) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    for key, value in coupon_update.dict(exclude_unset=True).items():
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

def redeem_coupon(db: Session, coupon_id: int, user_id: int) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    if coupon.status != "active":
        raise HTTPException(status_code=400, detail="Cupón no está activo")
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        coupon.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Cupón expirado")
    if coupon.user_id != user_id:
        raise HTTPException(status_code=403, detail="Cupón no pertenece a este usuario")

    coupon.redeemed_at = datetime.utcnow()
    coupon.status = "redeemed"
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.credits += coupon.credits
    coupon.redeemed_by_user_id = user_id

    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón canjeado: {coupon.unique_identifier} por usuario ID {user_id}")
    return coupon
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
        user.credits += coupon.credits
        coupon.redeemed_by_user_id = user_id
    elif session_id:
        session = db.query(GuestsSession).filter(GuestsSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")
        session.credits += coupon.credits
        coupon.redeemed_by_session_id = session_id

    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón canjeado: {coupon.unique_identifier} por {user_id or session_id}")
    return coupon