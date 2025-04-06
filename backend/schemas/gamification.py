# backend/schemas/gamification.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EventTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    points_per_event: int = 0

class EventTypeCreate(EventTypeBase):
    pass

class EventTypeResponse(EventTypeBase):
    id: int

    class Config:
        from_attributes = True

class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    event_type_id: int
    required_points: int
    user_type: str = "both"

class BadgeCreate(BadgeBase):
    pass

class BadgeResponse(BadgeBase):
    id: int

    class Config:
        from_attributes = True

class GamificationEventBase(BaseModel):
    event_type_id: int

class GamificationEventCreate(GamificationEventBase):
    pass

class GamificationEventResponse(GamificationEventBase):
    id: int
    user_id: Optional[int]
    session_id: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class UserGamificationBase(BaseModel):
    points: int
    badge_id: Optional[int]

class UserGamificationResponse(UserGamificationBase):
    event_type_id: int
    user_id: Optional[int]
    session_id: Optional[str]
    event_type: EventTypeResponse
    badge: Optional[BadgeResponse]

    class Config:
        from_attributes = True
        
        
class RankingResponse(BaseModel):
    username: str
    points: int
    badges_count: int
    user_type: str

    class Config:
        from_attributes = True