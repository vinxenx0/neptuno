from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.session import AnonymousSession
from schemas.anonymous_session import AnonymousSessionResponse
from dependencies.auth import get_user_context
from core.database import get_db

router = APIRouter( tags=["Sessions"])

@router.get("/", response_model=List[AnonymousSessionResponse])
def get_anonymous_sessions(
    user=Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden acceder a este recurso")
    sessions = db.query(AnonymousSession).all()
    return sessions