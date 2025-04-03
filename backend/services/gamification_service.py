# backend/services/gamification_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from models.gamification import GamificationEvent, UserGamification, EventType, Badge
from schemas.gamification import GamificationEventCreate, EventTypeCreate, BadgeCreate
from dependencies.auth import UserContext

from typing import List, Optional
from sqlalchemy.orm import Session
from models.gamification import GamificationEvent, UserGamification, EventType, Badge
from schemas.gamification import GamificationEventCreate
from dependencies.auth import UserContext

def register_event(db: Session, event: GamificationEventCreate, user: UserContext) -> GamificationEvent:
    """Registra un evento de gamificación y actualiza los puntos del usuario."""
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None

    db_event = GamificationEvent(
        event_type_id=event.event_type_id,
        user_id=user_id,
        session_id=session_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    update_user_gamification(db, user, event.event_type_id)
    return db_event

def get_user_gamification(db: Session, user: UserContext) -> List[UserGamification]:
    """Obtiene todos los registros de gamificación del usuario."""
    if user.user_type == "registered":
        return db.query(UserGamification).filter(UserGamification.user_id == int(user.user_id)).all()
    return db.query(UserGamification).filter(UserGamification.session_id == user.session_id).all()

def get_user_events(db: Session, user: UserContext) -> List[GamificationEvent]:
    """Obtiene todos los eventos de gamificación del usuario."""
    if user.user_type == "registered":
        return db.query(GamificationEvent).filter(GamificationEvent.user_id == int(user.user_id)).all()
    return db.query(GamificationEvent).filter(GamificationEvent.session_id == user.session_id).all()

def get_event_details(db: Session, event_id: int, user: UserContext) -> Optional[GamificationEvent]:
    """Obtiene los detalles de un evento específico si pertenece al usuario."""
    event = db.query(GamificationEvent).filter(GamificationEvent.id == event_id).first()
    if not event:
        return None
    if (user.user_type == "registered" and event.user_id == int(user.user_id)) or \
       (user.user_type == "anonymous" and event.session_id == user.session_id):
        return event
    return None

def get_badges_for_event(db: Session, event_type_id: int) -> List[Badge]:
    """Obtiene todos los badges asociados a un tipo de evento."""
    return db.query(Badge).filter(Badge.event_type_id == event_type_id).all()

def get_user_progress_for_event(db: Session, user: UserContext, event_type_id: int) -> Optional[UserGamification]:
    """Obtiene el progreso del usuario para un tipo de evento específico."""
    if user.user_type == "registered":
        return db.query(UserGamification).filter(
            UserGamification.user_id == int(user.user_id),
            UserGamification.event_type_id == event_type_id
        ).first()
    return db.query(UserGamification).filter(
        UserGamification.session_id == user.session_id,
        UserGamification.event_type_id == event_type_id
    ).first()

def update_user_gamification(db: Session, user: UserContext, event_type_id: int) -> UserGamification:
    """Actualiza los puntos y badges del usuario para un tipo de evento."""
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None

    gamification = get_user_progress_for_event(db, user, event_type_id)
    if not gamification:
        gamification = UserGamification(
            user_id=user_id,
            session_id=session_id,
            event_type_id=event_type_id,
            points=0
        )
        db.add(gamification)

    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise ValueError("Event type not found")

    events_count = db.query(GamificationEvent).filter(
        GamificationEvent.event_type_id == event_type_id,
        (GamificationEvent.user_id == user_id) if user_id else (GamificationEvent.session_id == session_id)
    ).count()

    gamification.points = events_count * event_type.points_per_event

    badge = db.query(Badge).filter(
        Badge.event_type_id == event_type_id,
        Badge.user_type.in_([user.user_type, "both"]),
        Badge.required_points <= gamification.points
    ).order_by(Badge.required_points.desc()).first()

    gamification.badge_id = badge.id if badge else None
    db.commit()
    db.refresh(gamification)
    return gamification

def create_event_type(db: Session, event_type: EventTypeCreate):
    db_event_type = EventType(**event_type.dict())
    db.add(db_event_type)
    db.commit()
    db.refresh(db_event_type)
    return db_event_type

def create_badge(db: Session, badge: BadgeCreate):
    db_badge = Badge(**badge.dict())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def calculate_points(api_usages: int) -> int:
    """Calcula los puntos según el número de usos de la API."""
    if api_usages >= 30:
        return 1000
    elif api_usages >= 20:
        return 500
    elif api_usages >= 10:
        return 100
    elif api_usages >= 1:
        return 5
    return 0



