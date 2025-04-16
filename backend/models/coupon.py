# backend/models/coupon.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
# from models.guests import GuestsSession
from models.user import User
from core.database import Base
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    coupon_type_id = Column(Integer, ForeignKey("coupon_types.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    unique_identifier = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    redeemed_at = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    status = Column(String(20), default="active")
    credits = Column(Integer, nullable=False)

    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    redeemed_by_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="coupons")
    redeemed_by_user = relationship("User", foreign_keys=[redeemed_by_user_id])