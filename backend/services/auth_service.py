# backend/services/auth_service.py
# Módulo de servicio de autenticación.
from os import getenv
from uuid import uuid4
from sqlalchemy.orm import Session
from models.user import User, subscriptionEnum
from models.token import PasswordResetToken, RevokedToken
from core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, decode_token
)
from core.logging import configure_logging
from core.security import google_client, meta_client

from datetime import datetime, timedelta
from fastapi import HTTPException
import requests
from threading import Lock
from threading import Lock
from datetime import datetime, timedelta
from fastapi import HTTPException
from threading import Lock
import jwt

refresh_lock = Lock()

logger = configure_logging()

def register_user(
    db: Session, 
    email: str, 
    username: str, 
    password: str, 
    ciudad: str = None, 
    website: str = None, 
    subscription: str = "freemium"
):
    try:
        if db.query(User).filter(User.email == email).first():
            logger.warning(f"Intento de registro con email duplicado: {email}")
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        if db.query(User).filter(User.username == username).first():
            logger.warning(f"Intento de registro con username duplicado: {username}")
            raise HTTPException(status_code=400, detail="El username ya está registrado")
        
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            username=username,
            password_hash=hashed_password,
            ciudad=ciudad,
            website=website,
            subscription=subscriptionEnum(subscription),
            credits=100,
            renewal=datetime.utcnow(),
            create_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        access_token = create_access_token({"sub": str(user.id), "type": "registered"})
        refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
        logger.info(f"Usuario registrado ID {user.id} con subscription {subscription}")
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en registro de usuario {email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al registrar usuario")

def login_user(db: Session, email: str, password: str, ip: str):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            logger.error(f"Intento de login fallido para email {email} desde IP {ip}")
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        if not user.activo:
            logger.warning(f"Intento de login con usuario inactivo ID {user.id} desde IP {ip}")
            raise HTTPException(status_code=403, detail="Usuario inactivo")
        
        user.last_ip = ip
        db.commit()
        
        # Añadir log para inspeccionar los datos del usuario
        logger.debug(f"Usuario encontrado: ID={user.id}, email={user.email}, subscription={user.subscription}, type={type(user.subscription)}")
        
        # Generar el token
        access_token = create_access_token({"sub": str(user.id), "type": "registered"})
        refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
        logger.info(f"Login exitoso para usuario ID {user.id} desde IP {ip}")
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    except Exception as e:
        logger.critical(f"Error inesperado en login para {email} desde IP {ip}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error al iniciar sesión")





def refresh_access_token(db: Session, refresh_token: str):
    if not refresh_token or len(refresh_token) < 10:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    with refresh_lock:
        try:
            # 1. Decodificar primero sin verificar revocación
            try:
                payload = jwt.decode(
                    refresh_token,
                    getenv("SECRET_KEY"),
                    algorithms=["HS256"],
                    options={"verify_exp": True}
                )
            except jwt.ExpiredSignatureError:
                logger.warning("Refresh token expirado")
                raise HTTPException(status_code=401, detail="Refresh token expirado")
            except Exception as e:
                logger.warning(f"Error decodificando token: {str(e)}")
                raise HTTPException(status_code=401, detail="Token inválido")

            # 2. Verificar si el token fue revocado DESPUÉS de decodificar
            if db.query(RevokedToken).filter(RevokedToken.token == refresh_token).first():
                logger.warning("Refresh token ya revocado")
                raise HTTPException(status_code=401, detail="Refresh token revocado")

            # 3. Validar claims
            if payload.get("type") != "refresh":
                raise HTTPException(status_code=401, detail="Tipo de token incorrecto")

            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Falta sub claim")

            # 4. Verificar usuario
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user or not user.activo:
                raise HTTPException(status_code=403, detail="Usuario inválido")

            # 5. Revocar el token actual
            db.add(RevokedToken(token=refresh_token, user_id=user.id))
            
            # 6. Crear nuevos tokens
            new_access_token = create_access_token({"sub": str(user.id), "type": "registered"})
            new_refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
            
            db.commit()  # Hacer commit después de crear los nuevos tokens
            
            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer"
            }

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error crítico: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno")

        
def logout_user(db: Session, token: str): #_estimate ?
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    revoked_token = RevokedToken(token=token)
    db.add(revoked_token)
    db.commit()
    return {"message": "Sesión cerrada"}

def request_password_reset(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email no encontrado")
    
    token = str(uuid4())
    reset_token = PasswordResetToken(user_id=user.id, token=token)
    db.add(reset_token)
    db.commit()
    
    logger.info(f"Token de reseteo generado para usuario ID {user.id}: {token}")
    return {"message": "Solicitud de recuperación enviada", "token": token}

def confirm_password_reset(db: Session, token: str, new_password: str):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    if not reset_token:
        raise HTTPException(status_code=400, detail="Token inválido")
    if reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expirado")
    
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.password_hash = get_password_hash(new_password)
    db.delete(reset_token)
    db.commit()
    return {"message": "Contraseña actualizada con éxito"}

def change_user_password(db: Session, user_id: int, current_password: str, new_password: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Contraseña actualizada con éxito"}

def login_with_provider(db: Session, provider: str, code: str, ip: str):
    if provider == "google":
        token_url = "https://oauth2.googleapis.com/token"
        client_id = getenv("GOOGLE_CLIENT_ID")
        client_secret = getenv("GOOGLE_CLIENT_SECRET")
        redirect_uri = getenv("GOOGLE_REDIRECT_URI")
    elif provider == "meta":
        token_url = "https://graph.facebook.com/v13.0/oauth/access_token"
        client_id = getenv("META_CLIENT_ID")
        client_secret = getenv("META_CLIENT_SECRET")
        redirect_uri = getenv("META_REDIRECT_URI")
    else:
        raise HTTPException(status_code=400, detail="Proveedor no soportado")

    token_data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    response = requests.post(token_url, data=token_data)
    if response.status_code != 200:
        logger.error(f"Error al obtener token de {provider}: {response.text}")
        raise HTTPException(status_code=400, detail="Error al autenticar con el proveedor")

    token_info = response.json()
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo" if provider == "google" else "https://graph.facebook.com/me?fields=id,email"
    user_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {token_info['access_token']}"})
    user_data = user_response.json()

    email = user_data.get("email")
    provider_id = user_data.get("id") or user_data.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            username=email.split("@")[0],
            auth_provider=provider,
            provider_id=provider_id,
            credits=100,
            create_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if user.auth_provider != provider or user.provider_id != provider_id:
            logger.warning(f"Conflicto de proveedor para email {email}")
            raise HTTPException(status_code=400, detail="Email ya registrado con otro proveedor")

    user.last_ip = ip
    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "type": "registered"})
    refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
    logger.info(f"Login con {provider} exitoso para usuario ID {user.id}")
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}