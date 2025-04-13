# backend/models/coupon.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    credits = Column(Integer, nullable=False,default=0)
    coupon_type_id = Column(Integer, ForeignKey("coupon_types.id"), nullable=False)
    unique_identifier = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    redeemed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="active")  # "active", "redeemed", "expired"
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)
    redeemed_by_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    redeemed_by_session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)
    active = Column(Boolean, default=True)

    coupon_type = relationship("CouponType")
    
    user = relationship("User", foreign_keys=[user_id])
    session = relationship("GuestsSession", foreign_keys=[session_id])
    redeemed_by_user = relationship("User", foreign_keys=[redeemed_by_user_id])
    redeemed_by_session = relationship("GuestsSession", foreign_keys=[redeemed_by_session_id])