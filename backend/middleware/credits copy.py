# backend/middleware/credits.py
# Módulo de middleware para créditos.
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from models.user import User
from models.session import AnonymousSession
from core.database import get_db

def require_credits(func):
    @wraps(func)
    async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
        if user.consultas_restantes <= 0:
            raise HTTPException(status_code=403, detail="No te quedan créditos.")
        
        response = await func(user=user, db=db, *args, **kwargs)

        # Decrementar créditos
        if user.user_type == "registered":
            user_db = db.query(User).filter(User.id == int(user.user_id)).first()
            user_db.consultas_restantes -= 1
        else:
            session_db = db.query(AnonymousSession).filter(AnonymousSession.id == user.user_id).first()
            session_db.consultas_restantes -= 1
        db.commit()

        return response
    return wrapper