from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_user_context, UserContext
from core.database import get_db
from services.gamification_service import (
    get_rankings,
    register_event,
    get_user_gamification,
    get_user_events,
    get_event_details,
    get_badges_for_event,
    get_user_progress_for_event
)
from schemas.gamification import (
    GamificationEventCreate,
    GamificationEventResponse,
    RankingResponse,
    UserGamificationResponse,
    EventTypeResponse,
    BadgeResponse
)
from typing import List

router = APIRouter(tags=["Gamification"])

#@router.post("/events", response_model=GamificationEventResponse)
#def create_event(event: GamificationEventCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
#    """Registra un nuevo evento de gamificación."""
#    return register_event(db, event, user)

@router.get("/rankings", response_model=List[RankingResponse])
def get_rankings_endpoint(db: Session = Depends(get_db)):
    return get_rankings(db)

@router.post("/events")
async def create_event(event: GamificationEventCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return register_event(db, event, user)

@router.get("/me", response_model=List[UserGamificationResponse])
def get_my_gamification(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    """Obtiene los puntos e insignias del usuario actual para todos los eventos."""
    return get_user_gamification(db, user)

@router.get("/events", response_model=List[GamificationEventResponse])
def get_my_events(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    """Obtiene todos los eventos de gamificación del usuario actual."""
    return get_user_events(db, user)

@router.get("/events/{event_id}", response_model=GamificationEventResponse)
def get_event_details_endpoint(event_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    """Obtiene detalles de un evento específico del usuario."""
    event = get_event_details(db, event_id, user)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/event-types/{event_type_id}/badges", response_model=List[BadgeResponse])
def get_badges_for_event_endpoint(event_type_id: int, db: Session = Depends(get_db)):
    """Obtiene la lista de badges disponibles para un tipo de evento."""
    badges = get_badges_for_event(db, event_type_id)
    if not badges:
        raise HTTPException(status_code=404, detail="No badges found for this event type")
    return badges

@router.get("/progress/{event_type_id}", response_model=UserGamificationResponse)
def get_user_progress_for_event_endpoint(event_type_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    """Obtiene el progreso del usuario en un evento específico."""
    progress = get_user_progress_for_event(db, user, event_type_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found for this event")
    return progress