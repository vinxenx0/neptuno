# backend/dependencies/auth.py
# Módulo de dependencias de autenticación.
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.session import AnonymousSession
from models.token import RevokedToken
from core.security import decode_token
from core.logging import configure_logging
from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel

logger = configure_logging()
class UserContext(BaseModel):
    user_id: str
    email: str
    username: str
    user_type: str  # "registered" o "anonymous"
    subscription: str
    credits: int
    rol: str
    class Config:
        from_attributes=True #orm_mode = True


async def get_user_context(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    session_id = request.headers.get("X-Session-ID")
    client_ip = request.client.host

    try:
        if token:
            if db.query(RevokedToken).filter(RevokedToken.token == token).first():
                logger.warning(f"Intento de uso de token revocado desde IP {client_ip}")
                raise HTTPException(status_code=401, detail="Token revocado")
            payload = decode_token(token)
            if not payload or payload.get("type") != "access":
                logger.error(f"Token inválido recibido desde IP {client_ip}")
                raise HTTPException(status_code=401, detail="Token inválido o no es de acceso")
            user = db.query(User).filter(User.id == int(payload["sub"])).first()
            if not user:
                logger.error(f"Usuario no encontrado para token desde IP {client_ip}")
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if not user.activo:
                logger.warning(f"Intento de acceso con usuario inactivo ID {user.id} desde IP {client_ip}")
                raise HTTPException(status_code=403, detail="Usuario inactivo")
            if user.token_valid_until and user.token_valid_until < datetime.utcnow():
                logger.warning(f"Token expirado manualmente para usuario ID {user.id} desde IP {client_ip}")
                raise HTTPException(status_code=401, detail="Token no válido")
            
            user.last_ip = client_ip
            user.last_login = datetime.utcnow()
            db.commit()
            logger.info(f"Usuario registrado ID {user.id} autenticado desde IP {client_ip}")
            return UserContext(
                user_type="registered",
                user_id=str(user.id),
                email=user.email,
                username=user.username,
                credits=user.credits,
                subscription=user.subscription.value,
                rol=user.rol
            )

        if not session_id:
            session_id = str(uuid4())
            new_session = AnonymousSession(
                id=session_id,
                credits=100,
                ultima_actividad=datetime.utcnow(),
                last_ip=client_ip
            )
            db.add(new_session)
            db.commit()
            logger.info(f"Nueva sesión anónima creada ID {session_id} desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=session_id,
                email="anonymous@example.com",  # Valor por defecto
                username="anonymous",           # Valor por defecto
                credits=100,
                subscription="basic",                   # Valor por defecto
                rol="anonymous"                 # Valor por defecto
            )
        else:
            session = db.query(AnonymousSession).filter(AnonymousSession.id == session_id).first()
            if not session:
                logger.warning(f"Sesión anónima inválida ID {session_id} desde IP {client_ip}")
                raise HTTPException(status_code=400, detail="Sesión anónima inválida")
            
            session.last_ip = client_ip
            session.ultima_actividad = datetime.utcnow()
            db.commit()
            logger.info(f"Sesión anónima ID {session_id} actualizada desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=session.id,
                email="anonymous@example.com",  # Valor por defecto
                username="anonymous",           # Valor por defecto
                credits=session.credits,
                subscription="basic",                   # Valor por defecto
                rol="anonymous"                 # Valor por defecto
            )

        logger.error(f"No autorizado: sin token ni sesión válida desde IP {client_ip}")
        raise HTTPException(status_code=401, detail="No autorizado")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en get_user_context desde IP {client_ip}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la autenticación")