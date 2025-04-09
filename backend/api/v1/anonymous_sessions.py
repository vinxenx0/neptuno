# backend/api/v1/anonymous_sessions.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from models.guests import GuestsSession
from schemas.anonymous_session import GuestsSessionResponse  # Asegúrate de que este esquema existe
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from math import ceil

router = APIRouter(tags=["Sessions"])


@router.get("/", response_model=dict)
def get_anonymous_sessions(page: int = Query(1, ge=1),
                           limit: int = Query(10, ge=1, le=100),
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)) -> dict:
    """
    Retrieve a paginated list of anonymous sessions.

    Args:
        page (int): The page number to retrieve. Defaults to 1. Must be greater than or equal to 1.
        limit (int): The number of items per page. Defaults to 10. Must be between 1 and 100.
        user (UserContext): The user context, injected via dependency. Must have an "admin" role to access this endpoint.
        db (Session): The database session, injected via dependency.

    Raises:
        HTTPException: If the user is not an admin (403 Forbidden).

    Returns:
        dict: A dictionary containing the following keys:
            - data (List[GuestsSessionResponse]): A list of serialized anonymous session data.
            - total_items (int): The total number of anonymous sessions.
            - total_pages (int): The total number of pages based on the limit.
            - current_page (int): The current page number.
    """
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo los administradores pueden acceder a este recurso")

    offset = (page - 1) * limit
    query = db.query(GuestsSession)
    total_items = query.count()
    sessions = query.offset(offset).limit(limit).all()

    # Convertir los modelos SQLAlchemy a esquemas Pydantic
    sessions_data = [
        GuestsSessionResponse.from_orm(session) for session in sessions
    ]

    return {
        "data": sessions_data,  # Usar los datos serializados
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }


@router.get("/credits", response_model=dict)
async def get_anonymous_credits(user: UserContext = Depends(get_user_context),
                                db: Session = Depends(get_db)) -> dict:
    """
    Retrieve the credits for an anonymous user session.

    Args:
        user (UserContext): The user context, injected via dependency. Must have a "user_type" of "anonymous".
        db (Session): The database session, injected via dependency.

    Raises:
        HTTPException: If the user is not anonymous (403 Forbidden).
        HTTPException: If the session is not found (404 Not Found).

    Returns:
        dict: A dictionary containing the following key:
            - credits (int): The number of credits available for the anonymous session.
    """
    if user.user_type != "anonymous":
        raise HTTPException(status_code=403,
                            detail="Solo para usuarios anónimos")
    session = db.query(GuestsSession).filter(
        GuestsSession.id == user.user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {"credits": session.credits}
