# backend/api/v1/gamification.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.gamification_service import (
    create_event_type, get_badges_for_event, get_event_details, get_event_types, get_rankings, get_user_events, get_user_gamification, get_user_progress_for_event, register_event, update_event_type, delete_event_type,
    create_badge, get_badges, update_badge, delete_badge
)
from schemas.gamification import (
    EventTypeCreate, EventTypeResponse, BadgeCreate, BadgeResponse,
    GamificationEventCreate, GamificationEventResponse, UserGamificationResponse, RankingResponse
)
from typing import List

router = APIRouter(tags=["Gamification"])

# Endpoints existentes
@router.get("/rankings", response_model=List[RankingResponse])
def get_rankings_endpoint(db: Session = Depends(get_db)):
    return get_rankings(db)

@router.post("/events")
async def create_event(event: GamificationEventCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return register_event(db, event, user)

@router.get("/me", response_model=List[UserGamificationResponse])
def get_my_gamification(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return get_user_gamification(db, user)

@router.get("/events", response_model=List[GamificationEventResponse])
def get_my_events(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return get_user_events(db, user)

@router.get("/events/{event_id}", response_model=GamificationEventResponse)
def get_event_details_endpoint(event_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    event = get_event_details(db, event_id, user)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/event-types/{event_type_id}/badges", response_model=List[BadgeResponse])
def get_badges_for_event_endpoint(event_type_id: int, db: Session = Depends(get_db)):
    badges = get_badges_for_event(db, event_type_id)
    if not badges:
        raise HTTPException(status_code=404, detail="No badges found for this event type")
    return badges

@router.get("/progress/{event_type_id}", response_model=UserGamificationResponse)
def get_user_progress_for_event_endpoint(event_type_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    progress = get_user_progress_for_event(db, user, event_type_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found for this event")
    return progress

# Nuevos endpoints para administración
@router.post("/event-types", response_model=EventTypeResponse)
def create_event_type_endpoint(event_type: EventTypeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_event_type(db, event_type)

@router.get("/event-types", response_model=List[EventTypeResponse])
def get_event_types_endpoint(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_event_types(db)

@router.put("/event-types/{event_type_id}", response_model=EventTypeResponse)
def update_event_type_endpoint(event_type_id: int, event_type_update: EventTypeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_event_type(db, event_type_id, event_type_update)

@router.delete("/event-types/{event_type_id}")
def delete_event_type_endpoint(event_type_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return delete_event_type(db, event_type_id)

@router.post("/badges", response_model=BadgeResponse)
def create_badge_endpoint(badge: BadgeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_badge(db, badge)

@router.get("/badges", response_model=List[BadgeResponse])
def get_badges_endpoint(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_badges(db)

@router.put("/badges/{badge_id}", response_model=BadgeResponse)
def update_badge_endpoint(badge_id: int, badge_update: BadgeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_badge(db, badge_id, badge_update)

@router.delete("/badges/{badge_id}")
def delete_badge_endpoint(badge_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return delete_badge(db, badge_id)


@router.post("/event-types", response_model=EventTypeResponse)
def create_event_type_endpoint(event_type: EventTypeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_event_type(db, event_type)

@router.get("/event-types", response_model=List[EventTypeResponse])
def get_event_types_endpoint(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_event_types(db)

@router.put("/event-types/{event_type_id}", response_model=EventTypeResponse)
def update_event_type_endpoint(event_type_id: int, event_type_update: EventTypeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_event_type(db, event_type_id, event_type_update)

@router.delete("/event-types/{event_type_id}")
def delete_event_type_endpoint(event_type_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return delete_event_type(db, event_type_id)

# Endpoints para Badge
@router.post("/badges", response_model=BadgeResponse)
def create_badge_endpoint(badge: BadgeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_badge(db, badge)

@router.get("/badges", response_model=List[BadgeResponse])
def get_badges_endpoint(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_badges(db)

@router.put("/badges/{badge_id}", response_model=BadgeResponse)
def update_badge_endpoint(badge_id: int, badge_update: BadgeCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_badge(db, badge_id, badge_update)

@router.delete("/badges/{badge_id}")
def delete_badge_endpoint(badge_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return delete_badge(db, badge_id)