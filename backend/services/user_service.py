# backend/services/user_service.py
# Servicio para gestión y actualización de usuarios

from sqlalchemy.orm import Session
from models.user import User
from fastapi import HTTPException

def get_user_info(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def update_user(db: Session, user_id: int, email: str = None, username: str = None, ciudad: str = None, website: str = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if email and email != user.email:
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = email
    
    if username and username != user.username:
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="El username ya está en uso")
        user.username = username
    
    if ciudad is not None:
        user.ciudad = ciudad
    if website is not None:
        user.website = website
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}

def list_users(db: Session):
    return db.query(User).all()