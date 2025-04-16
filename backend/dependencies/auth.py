# backend/dependencies/auth.py
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User, UserTypeEnum
from core.security import decode_token
from core.logging import configure_logging
from pydantic import BaseModel
from fastapi import Response
import random
import string
from datetime import datetime
from uuid import uuid4

logger = configure_logging()


class UserContext(BaseModel):
    user_type: str  # "registered" o "anonymous"
    user_id: str
    email: str
    username: str
    credits: int
    subscription: str
    rol: str

    class Config:
        from_attributes = True

def generate_unique_username(db: Session) -> str:
    while True:
        random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
        username = f"Guest_{random_chars}"
        if not db.query(User).filter(User.username == username).first():
            return username


async def get_user_context(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    client_ip = request.client.host
    logger.info(f"Procesando solicitud: token={bool(token)}, ip={client_ip}")

    try:
        if token:
            # Usuario registrado
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
            
            user.last_ip = client_ip
            user.last_login = datetime.utcnow()
            db.commit()
            logger.info(f"Usuario registrado ID {user.id} autenticado desde IP {client_ip}")
            return UserContext(
                user_type=user.type.value,
                user_id=str(user.id),
                email=user.email or "anonymous@example.com",
                username=user.username,
                credits=user.credits,
                subscription=user.subscription.value,
                rol=user.rol
            )
        else:
            # Usuario anónimo
            user_id_raw = request.headers.get("X-User-ID")
            if user_id_raw:
                try:
                    user_id = int(user_id_raw)
                    user = db.query(User).filter(User.id == user_id).first()
                except ValueError:
                    user = None  # ID inválido, crearemos uno nuevo
            else:
                user = None

            if not user:
                logger.info(f"Creando nuevo usuario anónimo desde IP {client_ip}")
                username = generate_unique_username(db)
                new_user = User(
                    type=UserTypeEnum.ANONYMOUS,
                    username=username,
                    credits=10,
                    create_at=datetime.utcnow(),
                    last_ip=client_ip
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user = new_user
            
            response.headers["X-User-ID"] = str(user.id)
            logger.info(f"Usuario anónimo ID {user.id} procesado desde IP {client_ip}")
            return UserContext(
                user_type="anonymous",
                user_id=str(user.id),
                email="anonymous@example.com",
                username=user.username,
                credits=user.credits,
                subscription="freemium",
                rol="anonymous"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en get_user_context desde IP {client_ip}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la autenticación")