# backend/dependencies/auth.py
# Módulo de dependencias de autenticación.
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.session import AnonymousSession
from models.token import RevokedToken
from core.security import decode_token
from uuid import uuid4
from datetime import datetime

class UserContext:
    def __init__(self, user_type: str, user_id: str, consultas_restantes: int, plan: str = None):
        self.user_type = user_type
        self.user_id = user_id
        self.consultas_restantes = consultas_restantes
        self.plan = plan  # Añadido para reflejar el plan del usuario

async def get_user_context(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    session_id = request.headers.get("X-Session-ID")
    client_ip = request.client.host

    # Caso 1: Usuario registrado con token
    if token:
        # Verificar si el token está revocado
        if db.query(RevokedToken).filter(RevokedToken.token == token).first():
            raise HTTPException(status_code=401, detail="Token revocado")

        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido o no es de acceso")

        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if not user.activo:
            raise HTTPException(status_code=403, detail="Usuario inactivo")

        # Actualizar IP y guardar cambios
        user.ultima_ip = client_ip
        db.commit()
        return UserContext(
            user_type="registered",
            user_id=str(user.id),
            consultas_restantes=user.consultas_restantes,
            plan=user.plan.value
        )

    # Caso 2: Usuario anónimo
    if not session_id:
        # Nueva sesión anónima
        session_id = str(uuid4())
        new_session = AnonymousSession(
            id=session_id,
            consultas_restantes=100,
            ultima_actividad=datetime.utcnow(),
            ultima_ip=client_ip
        )
        db.add(new_session)
        db.commit()
        return UserContext(
            user_type="anonymous",
            user_id=session_id,
            consultas_restantes=100
        )
    else:
        # Sesión anónima existente
        session = db.query(AnonymousSession).filter(AnonymousSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=400, detail="Sesión anónima inválida")
        
        # Actualizar IP y actividad
        session.ultima_ip = client_ip
        session.ultima_actividad = datetime.utcnow()
        db.commit()
        return UserContext(
            user_type="anonymous",
            user_id=session.id,
            consultas_restantes=session.consultas_restantes
        )

    # Caso 3: Ningún token o sesión válida
    raise HTTPException(status_code=401, detail="No autorizado")