# backend/middleware/gamification.py
from fastapi import Depends
from functools import wraps
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.gamification_service import register_event
from schemas.gamification import GamificationEventCreate
from models.gamification import EventType


def track_gamification_event(event_type_name: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
            event_type = db.query(EventType).filter(EventType.name == event_type_name).first()
            if not event_type:
                raise ValueError(f"Event type '{event_type_name}' not found")

            event = GamificationEventCreate(event_type_id=event_type.id)
            register_event(db, event, user)

            return await func(user=user, db=db, *args, **kwargs)
        return wrapper
    return decorator