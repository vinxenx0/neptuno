# backend/dependencies/auth.py
# Módulo de dependencias de autenticación.
# backend/dependencies/auth.py
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.guests import GuestsSession
from models.token import RevokedToken
from core.security import decode_token
from core.logging import configure_logging
from services.coupon_service import create_coupon
from schemas.coupon import CouponCreate
from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel
from fastapi import Response
import random
import string

logger = configure_logging()

class UserContext(BaseModel):
    user_id: str
    email: str
    username: str
    user_type: str  # "registered" o "anonymous"
    subscription: str
    credits: int
    rol: str
    session_id: str | None = None

    class Config:
        from_attributes = True

def generate_unique_username(db: Session) -> str:
    while True:
        random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
        username = f"Guest_{random_chars}"
        if not db.query(GuestsSession).filter(GuestsSession.username == username).first():
            return username

async def get_user_context(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    session_id = request.headers.get("X-Session-ID")  # Leer de header en lugar de cookie
    client_ip = request.client.host
    logger.info(f"Procesando solicitud: token={bool(token)}, session_id={session_id}, ip={client_ip}")

    try:
        if token:
            # Lógica para usuarios registrados (sin cambios)
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
            logger.info("No hay session_id en header, creando nueva sesión anónima")
            session_id = str(uuid4())
            username = generate_unique_username(db)  # Generar apodo único
            new_session = GuestsSession(
                id=session_id,
                username=username,  # Asignar el apodo
                credits=10,
                create_at=datetime.utcnow(),
                ultima_actividad=datetime.utcnow(),
                last_ip=client_ip
            )
            db.add(new_session)
            db.commit()

            # Crear cupón de bienvenida

            coupon_data = CouponCreate(
                name="Bienvenida",
                description="Cupón de bienvenida para usuarios anónimos",
                credits=5,
                active=True,
                unique_identifier=f"WELCOME-{session_id[:8]}"
            )
            create_coupon(db, coupon_data, session_id=session_id)
            logger.info(f"Cupón de bienvenida creado para sesión {session_id}")

        
            logger.info(f"Nueva sesión anónima creada ID {session_id} con username {username} desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=session_id,
                email="anonymous@example.com",
                username=username,  # Usar el apodo generado
                credits=10,
                subscription="basic",
                rol="anonymous",
                session_id=session_id
            )
        else:
            logger.info(f"Buscando sesión anónima con ID {session_id} desde header")
            session = db.query(GuestsSession).filter(GuestsSession.id == session_id).first()
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
                email="anonymous@example.com",
                username=session.username,  # Usar el username de la sesión
                credits=session.credits,
                subscription="basic",
                rol="anonymous",
                session_id=session_id
            )

        logger.error(f"No autorizado: sin token ni sesión válida desde IP {client_ip}")
        raise HTTPException(status_code=401, detail="No autorizado")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en get_user_context desde IP {client_ip}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la autenticación")