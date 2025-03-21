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

logger = configure_logging()

class UserContext:
    def __init__(self, user_type: str, user_id: str, consultas_restantes: int, plan: str = None):
        self.user_type = user_type
        self.user_id = user_id
        self.consultas_restantes = consultas_restantes
        self.plan = plan

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

            user.ultima_ip = client_ip
            db.commit()
            logger.info(f"Usuario registrado ID {user.id} autenticado desde IP {client_ip}")
            return UserContext(
                user_type="registered",
                user_id=str(user.id),
                consultas_restantes=user.consultas_restantes,
                plan=user.plan.value
            )

        if not session_id:
            session_id = str(uuid4())
            new_session = AnonymousSession(
                id=session_id,
                consultas_restantes=100,
                ultima_actividad=datetime.utcnow(),
                ultima_ip=client_ip
            )
            db.add(new_session)
            db.commit()
            logger.info(f"Nueva sesión anónima creada ID {session_id} desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=session_id,
                consultas_restantes=100
            )
        else:
            session = db.query(AnonymousSession).filter(AnonymousSession.id == session_id).first()
            if not session:
                logger.warning(f"Sesión anónima inválida ID {session_id} desde IP {client_ip}")
                raise HTTPException(status_code=400, detail="Sesión anónima inválida")
            
            session.ultima_ip = client_ip
            session.ultima_actividad = datetime.utcnow()
            db.commit()
            logger.info(f"Sesión anónima ID {session_id} actualizada desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=session.id,
                consultas_restantes=session.consultas_restantes
            )

        logger.error(f"No autorizado: sin token ni sesión válida desde IP {client_ip}")
        raise HTTPException(status_code=401, detail="No autorizado")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en get_user_context desde IP {client_ip}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la autenticación")