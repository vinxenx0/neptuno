# backend/services/gamification_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from models.guests import GuestsSession
from models.gamification import GamificationEvent, UserGamification, EventType, Badge
from schemas.gamification import BadgeCreate, EventTypeCreate, GamificationEventCreate, RankingResponse
from dependencies.auth import UserContext
from sqlalchemy import func
from fastapi import HTTPException
from models.user import User
import logging
import asyncio
from wsockets import notify_points, notify_badge

logger = logging.getLogger(__name__)

def register_event(db: Session, event: GamificationEventCreate, user: UserContext) -> GamificationEvent:
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
    if user.user_type == "registered":
        return db.query(UserGamification).filter(UserGamification.user_id == int(user.user_id)).all()
    return db.query(UserGamification).filter(UserGamification.session_id == user.session_id).all()

def get_user_events(db: Session, user: UserContext) -> List[GamificationEvent]:
    if user.user_type == "registered":
        return db.query(GamificationEvent).filter(GamificationEvent.user_id == int(user.user_id)).all()
    return db.query(GamificationEvent).filter(GamificationEvent.session_id == user.session_id).all()

def get_event_details(db: Session, event_id: int, user: UserContext) -> Optional[GamificationEvent]:
    event = db.query(GamificationEvent).filter(GamificationEvent.id == event_id).first()
    if not event:
        return None
    if (user.user_type == "registered" and event.user_id == int(user.user_id)) or \
       (user.user_type == "anonymous" and event.session_id == user.session_id):
        return event
    return None

def get_badges_for_event(db: Session, event_type_id: int) -> List[Badge]:
    return db.query(Badge).filter(Badge.event_type_id == event_type_id).all()

def get_user_progress_for_event(db: Session, user: UserContext, event_type_id: int) -> Optional[UserGamification]:
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
    logger.info(f"Actualizando gamificación para user_type={user.user_type}, user_id={user.user_id}, session_id={user.session_id}, event_type_id={event_type_id}")
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
        logger.info("Creado nuevo registro de UserGamification")

    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise ValueError("Event type not found")

    events_count = db.query(GamificationEvent).filter(
        GamificationEvent.event_type_id == event_type_id,
        (GamificationEvent.user_id == user_id) if user_id else (GamificationEvent.session_id == session_id)
    ).count()
    logger.info(f"Contados {events_count} eventos para event_type_id={event_type_id}")

    gamification.points = events_count * event_type.points_per_event

    badge = db.query(Badge).filter(
        Badge.event_type_id == event_type_id,
        Badge.user_type.in_([user.user_type, "both"]),
        Badge.required_points <= gamification.points
    ).order_by(Badge.required_points.desc()).first()
    logger.info(f"Badge encontrado: {badge.id if badge else 'None'}")

    previous_badge_id = gamification.badge_id
    gamification.badge_id = badge.id if badge else None
    db.commit()
    db.refresh(gamification)

    # Emitir eventos WebSocket
    if user.user_type == "registered":
        asyncio.create_task(notify_points(user.user_id, gamification.points))
        if badge and badge.id != previous_badge_id:
            asyncio.create_task(notify_badge(user.user_id, badge.name))

    return gamification

def create_event_type(db: Session, event_type: EventTypeCreate):
    db_event_type = EventType(**event_type.dict())
    db.add(db_event_type)
    db.commit()
    db.refresh(db_event_type)
    return db_event_type

def get_event_types(db: Session) -> List[EventType]:
    return db.query(EventType).all()

def update_event_type(db: Session, event_type_id: int, event_type_update: EventTypeCreate):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    for key, value in event_type_update.dict().items():
        setattr(event_type, key, value)
    db.commit()
    db.refresh(event_type)
    return event_type

def delete_event_type(db: Session, event_type_id: int):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    db.delete(event_type)
    db.commit()
    return {"message": "Event type deleted"}

def create_badge(db: Session, badge: BadgeCreate):
    db_badge = Badge(**badge.dict())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def get_badges(db: Session) -> List[Badge]:
    return db.query(Badge).all()

def update_badge(db: Session, badge_id: int, badge_update: BadgeCreate):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    for key, value in badge_update.dict().items():
        setattr(badge, key, value)
    db.commit()
    db.refresh(badge)
    return badge

def delete_badge(db: Session, badge_id: int):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    db.delete(badge)
    db.commit()
    return {"message": "Badge deleted"}

def get_rankings(db: Session) -> List[RankingResponse]:
    registered = db.query(
        User.username,
        func.sum(UserGamification.points).label("total_points"),
        func.count(UserGamification.badge_id).label("badges_count")
    ).join(UserGamification, User.id == UserGamification.user_id
    ).group_by(User.id).all()

    anonymous = db.query(
        GuestsSession.username,
        func.sum(UserGamification.points).label("total_points"),
        func.count(UserGamification.badge_id).label("badges_count")
    ).join(UserGamification, GuestsSession.id == UserGamification.session_id
    ).group_by(GuestsSession.id).all()

    all_rankings = [
        RankingResponse(
            username=r.username,
            points=r.total_points,
            badges_count=r.badges_count,
            user_type="registered" if r in registered else "anonymous"
        ) for r in registered + anonymous
    ]
    return sorted(all_rankings, key=lambda x: x.points, reverse=True)