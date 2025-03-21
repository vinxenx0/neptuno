# backend/services/auth_service.py
# Módulo de servicio de autenticación.
from sqlalchemy.orm import Session
from models.user import User, PlanEnum
from models.token import RevokedToken
from core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, decode_token
)
from core.logging import configure_logging
from datetime import datetime, timedelta
from fastapi import HTTPException

logger = configure_logging()

def register_user(
    db: Session, 
    email: str, 
    username: str, 
    password: str, 
    ciudad: str = None, 
    url: str = None, 
    plan: str = "freemium"
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
            url=url,
            plan=PlanEnum(plan),
            consultas_restantes=100,
            fecha_renovacion=datetime.utcnow(),
            fecha_creacion=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        access_token = create_access_token({"sub": str(user.id), "type": "registered"})
        refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
        logger.info(f"Usuario registrado ID {user.id} con plan {plan}")
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
        
        user.ultima_ip = ip
        db.commit()
        
        access_token = create_access_token({"sub": str(user.id), "type": "registered"})
        refresh_token = create_refresh_token({"sub": str(user.id), "type": "registered"})
        logger.info(f"Login exitoso para usuario ID {user.id} desde IP {ip}")
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en login para {email} desde IP {ip}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al iniciar sesión")

def refresh_access_token(db: Session, refresh_token: str):
    """Renueva el token de acceso usando el refresh token."""
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh" or db.query(RevokedToken).filter(RevokedToken.token == refresh_token).first():
        raise HTTPException(status_code=401, detail="Refresh token inválido o revocado")
    
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.activo:
        raise HTTPException(status_code=403, detail="Usuario no encontrado o inactivo")
    
    new_access_token = create_access_token({"sub": str(user.id), "type": "registered"})
    return {"access_token": new_access_token, "token_type": "bearer"}

def logout_user(db: Session, token: str):
    """Revoca un token para cerrar sesión."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    revoked_token = RevokedToken(token=token)
    db.add(revoked_token)
    db.commit()
    return {"message": "Sesión cerrada"}

def get_user_info(db: Session, user_id: int):
    """Obtiene la información completa del usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def update_user(db: Session, user_id: int, email: str = None, username: str = None, ciudad: str = None, url: str = None):
    """Actualiza los datos del usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if email:
        user.email = email
    if username:
        user.username = username
    if ciudad:
        user.ciudad = ciudad
    if url:
        user.url = url
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    """Elimina un usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}

def request_password_reset(db: Session, email: str):
    """Solicita la recuperación de contraseña (pendiente implementación completa)."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email no encontrado")
    # Aquí iría la lógica de enviar un email con un token de reset
    return {"message": "Solicitud de recuperación enviada"}