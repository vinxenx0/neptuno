# backend/models/coupon.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    unique_identifier = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    redeemed_at = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    status = Column(String(20), default="active")  # "active", "redeemed", "expired", "disabled"
    credits = Column(Integer, nullable=False)

    # Relaciones con usuario registrado o sesión anónima
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)

    # Quién canjeó el cupón
    redeemed_by_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    redeemed_by_session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)

    # Relaciones ORM
    user = relationship("User", foreign_keys=[user_id], back_populates="coupons")
    session = relationship("GuestsSession", foreign_keys=[session_id], back_populates="coupons")
    redeemed_by_user = relationship("User", foreign_keys=[redeemed_by_user_id])
    redeemed_by_session = relationship("GuestsSession", foreign_keys=[redeemed_by_session_id])

