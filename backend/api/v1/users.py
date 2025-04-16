# backend/api/v1/users.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.user import User, UserTypeEnum
from schemas.user import UserResponse, UpdateProfileRequest
from services.user_service import get_user_info, update_user, delete_user
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from core.logging import configure_logging
from math import ceil

router = APIRouter(tags=["users"])

logger = configure_logging()

@router.get("/me", response_model=UserResponse)
def get_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return get_user_info(db, int(user.user_id))

@router.put("/me", response_model=UserResponse)
def update_me(request: UpdateProfileRequest, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados pueden actualizar su perfil")
    return update_user(db, int(user.user_id), request.email, request.username, request.ciudad, request.website)

@router.delete("/me", response_model=dict)
def delete_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados pueden eliminar su cuenta")
    return delete_user(db, int(user.user_id))

@router.get("/admin/users", response_model=dict)
def get_all_users(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), 
                  user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver la lista de usuarios")
    
    offset = (page - 1) * limit
    query = db.query(User)
    total_items = query.count()
    users = query.offset(offset).limit(limit).all()
    users_data = [UserResponse.model_validate(user) for user in users]
    
    return {
        "data": users_data,
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden acceder a esta información")
    user_data = get_user_info(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_data

@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(user_id: int, request: UpdateProfileRequest, 
                      user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden actualizar usuarios")
    return update_user(db, user_id, request.email, request.username, request.ciudad, request.website)

@router.delete("/{user_id}", response_model=dict)
def delete_user_by_id(user_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar usuarios")
    return delete_user(db, user_id)