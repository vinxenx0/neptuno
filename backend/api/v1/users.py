from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserResponse, UpdateProfileRequest
from services.user_service import get_user_info, update_user, delete_user, list_users
from core.database import get_db
from dependencies.auth import UserContext, get_user_context

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserResponse)
def get_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return get_user_info(db, int(user.user_id))

@router.put("/me", response_model=UserResponse)
def update_me(
    request: UpdateProfileRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return update_user(
        db,
        int(user.user_id),
        request.email,
        request.username,
        request.ciudad,
        request.website
    )

@router.delete("/me", response_model=dict)
def delete_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return delete_user(db, int(user.user_id))

@router.get("/admin/users", response_model=list[UserResponse])
def get_all_users(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver la lista de usuarios")
    return list_users(db)

# Nuevo endpoint: obtener un usuario específico por ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden acceder a esta información")
    user_data = get_user_info(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_data

# Nuevo endpoint: actualizar un usuario específico por ID
@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(
    user_id: int,
    request: UpdateProfileRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden actualizar usuarios")
    updated_user = update_user(
        db,
        user_id,
        email=request.email,
        username=request.username,
        ciudad=request.ciudad,
        website=request.website
    )
    return updated_user

# Nuevo endpoint: eliminar un usuario específico por ID
@router.delete("/{user_id}", response_model=dict)
def delete_user_by_id(user_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar usuarios")
    result = delete_user(db, user_id)
    return result