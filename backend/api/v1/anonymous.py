# backend/api/v1/anonymous.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.session import AnonymousSession
from core.database import get_db
from dependencies.auth import get_user_context
import uuid
from datetime import datetime

router = APIRouter(tags=["anonymous"])

@router.get("/me")
async def get_anonymous_user(session_id: str = Depends(get_user_context), db: Session = Depends(get_db)):
    session = db.query(AnonymousSession).filter(AnonymousSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {
        "id": session.id,
        "username": session.username,
        "credits": session.credits,
        "rol": "anonymous",
        "session_id": session.id
    }



@router.post("/create")
async def create_anonymous_session(db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    username = f"Guest_{session_id[:8]}"  # Generar un username único
    new_session = AnonymousSession(
        id=session_id,
        username=username,
        credits=100,
        create_at=datetime.utcnow(),
        ultima_actividad=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    return {
        "id": session_id,
        "username": username,
        "credits": 100,
        "rol": "anonymous",
        "session_id": session_id
    }