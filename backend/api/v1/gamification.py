# backend/api/v1/gamification.py
# Endpoints para gamificación: eventos, puntos, badges, rankings
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, desc, func
from sqlalchemy.orm import Session
from models.gamification import Badge, EventType, GamificationEvent, UserGamification
from models.user import User
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.gamification_service import (
    create_event_type, get_badges_for_event, get_event_details,
    get_event_types, get_rankings, get_user_events, get_user_gamification,
    get_user_progress_for_event, register_event, update_event_type,
    delete_event_type, create_badge, get_badges, update_badge, delete_badge)
from schemas.gamification import (EventTypeCreate, EventTypeResponse,
                                  BadgeCreate, BadgeResponse,
                                  GamificationEventCreate,
                                  GamificationEventResponse,
                                  UserGamificationResponse, RankingResponse)
from typing import List

router = APIRouter(tags=["Gamification"])


# Endpoints existentes
@router.get("/rankings", response_model=List[RankingResponse])
def get_rankings_endpoint(db: Session = Depends(get_db)):
    return get_rankings(db)


@router.post("/events")
async def create_event(event: GamificationEventCreate,
                       user: UserContext = Depends(get_user_context),
                       db: Session = Depends(get_db)):
    return register_event(db, event, user)


@router.get("/me", response_model=List[UserGamificationResponse])
def get_my_gamification(user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    return get_user_gamification(db, user)


@router.get("/events", response_model=List[GamificationEventResponse])
def get_my_events(user: UserContext = Depends(get_user_context),
                  db: Session = Depends(get_db)):
    return get_user_events(db, user)


@router.get("/events/{event_id}", response_model=GamificationEventResponse)
def get_event_details_endpoint(event_id: int,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    event = get_event_details(db, event_id, user)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/progress/{event_type_id}",
            response_model=UserGamificationResponse)
def get_user_progress_for_event_endpoint(
    event_type_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)):
    progress = get_user_progress_for_event(db, user, event_type_id)
    if not progress:
        raise HTTPException(status_code=404,
                            detail="Progress not found for this event")
    return progress


@router.get("/event-types/{event_type_id}/badges",
            response_model=List[BadgeResponse])
def get_badges_for_event_endpoint(event_type_id: int,
                                  db: Session = Depends(get_db)):
    badges = get_badges_for_event(db, event_type_id)
    if not badges:
        raise HTTPException(status_code=404,
                            detail="No badges found for this event type")
    return badges


@router.post("/event-types", response_model=EventTypeResponse)
def create_event_type_endpoint(event_type: EventTypeCreate,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_event_type(db, event_type)


@router.get("/event-types", response_model=List[EventTypeResponse])
def get_event_types_endpoint(user: UserContext = Depends(get_user_context),
                             db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_event_types(db)


@router.put("/event-types/{event_type_id}", response_model=EventTypeResponse)
def update_event_type_endpoint(event_type_id: int,
                               event_type_update: EventTypeCreate,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_event_type(db, event_type_id, event_type_update)


@router.delete("/event-types/{event_type_id}")
def delete_event_type_endpoint(event_type_id: int,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_event_type(db, event_type_id)
    return {"message": "Tipo de evento eliminado"}


@router.post("/badges", response_model=BadgeResponse)
def create_badge_endpoint(badge: BadgeCreate,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_badge(db, badge)


@router.get("/badges", response_model=List[BadgeResponse])
def get_badges_endpoint(user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_badges(db)


@router.put("/badges/{badge_id}", response_model=BadgeResponse)
def update_badge_endpoint(badge_id: int,
                          badge_update: BadgeCreate,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_badge(db, badge_id, badge_update)


@router.delete("/badges/{badge_id}")
def delete_badge_endpoint(badge_id: int,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_badge(db, badge_id)
    return {"message": "Badge eliminado"}


# backend/api/v1/admin.py
@router.get("/kpis")
def get_gamification_kpis(user=Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    # Total de eventos
    total_events = db.query(GamificationEvent).count()

    # Usuarios activos en gamificación
    active_users = db.query(GamificationEvent).distinct(
        case(
            (GamificationEvent.user_id.isnot(None), GamificationEvent.user_id),
            else_=GamificationEvent.session_id
        )
    ).count()

    # Total de badges otorgados
    total_badges = db.query(UserGamification).filter(UserGamification.badge_id.isnot(None)).count()

    # Puntos totales
    total_points = db.query(func.sum(UserGamification.points)).scalar() or 0

    # Ranking global
    rankings = db.query(
        User.username,
        func.sum(UserGamification.points).label("points"),
        func.count(UserGamification.badge_id).label("badges")
    ).outerjoin(UserGamification, User.id == UserGamification.user_id
    ).group_by(User.id).order_by(desc("points")).limit(10).all()

    # Distribución de badges
    badge_dist = db.query(
        Badge.name,
        func.count(UserGamification.id).label("count")
    ).outerjoin(UserGamification, Badge.id == UserGamification.badge_id
    ).group_by(Badge.id).all()

    # Actividad por tipo de evento
    event_dist = db.query(
        EventType.name,
        func.count(GamificationEvent.id).label("count")
    ).outerjoin(GamificationEvent, EventType.id == GamificationEvent.event_type_id
    ).group_by(EventType.id).all()

    return {
        "total_events": total_events,
        "active_users": active_users,
        "total_badges": total_badges,
        "total_points": total_points,
        "rankings": [{"username": r[0], "points": r[1], "badges": r[2]} for r in rankings],
        "badge_distribution": [{"name": b[0], "count": b[1]} for b in badge_dist],
        "event_distribution": [{"name": e[0], "count": e[1]} for e in event_dist]
    }
