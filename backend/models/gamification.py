# backend/models/gamification.py
# Modelo de gamificación: eventos, badges, puntos, ranking

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
from models.user import User
from models.guests import GuestsSession


# backend/models/gamification.py
class EventType(Base):
    __tablename__ = "event_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ej: "api_usage"
    description = Column(String(255), nullable=True)
    points_per_event = Column(Integer, default=0)  # Puntos por ocurrencia del evento

    badges = relationship("Badge", back_populates="event_type")
    gamification_events = relationship("GamificationEvent", back_populates="event_type")
    user_gamification = relationship("UserGamification", back_populates="event_type")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ej: "Novato", "Becario"
    description = Column(String(255), nullable=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    required_points = Column(Integer, nullable=False)  # Puntos necesarios para el badge
    user_type = Column(String(20), default="both")  # "anonymous", "registered", "both"

    event_type = relationship("EventType", back_populates="badges")
    user_gamification = relationship("UserGamification", back_populates="badge")

class GamificationEvent(Base):
    __tablename__ = "gamification_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    event_type = relationship("EventType", back_populates="gamification_events")
    user = relationship("User", back_populates="gamification_events")
    session = relationship("GuestsSession", back_populates="gamification_events")

class UserGamification(Base):
    __tablename__ = "user_gamification"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    points = Column(Integer, default=0)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=True)
    
    event_type = relationship("EventType", back_populates="user_gamification")
    badge = relationship("Badge", back_populates="user_gamification")
    user = relationship("User", back_populates="gamification")
    session = relationship("GuestsSession", back_populates="gamification")