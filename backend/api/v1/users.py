#backend/api/v1/users.py
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserResponse, UpdateProfileRequest
from services.user_service import get_user_info, update_user, delete_user, list_users
from core.database import get_db
from dependencies.auth import UserContext, get_user_context

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(user: UserContext = Depends(get_user_context),
           db: Session = Depends(get_db)):
    """
    Retrieve the information of the currently authenticated user.

    This endpoint is restricted to users with the "registered" user type. 
    If the user is not registered, a 403 HTTP exception is raised.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        UserResponse: The response model containing the user's information.

    Raises:
        HTTPException: If the user is not of type "registered" or if any other error occurs.
    """
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return get_user_info(db, int(user.user_id))


@router.put("/me", response_model=UserResponse)
def update_me(request: UpdateProfileRequest,
              user: UserContext = Depends(get_user_context),
              db: Session = Depends(get_db)):
    """
    Update the profile of the currently authenticated user.

    Args:
        request (UpdateProfileRequest): The request body containing the updated profile information.
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        UserResponse: The updated user profile.

    Raises:
        HTTPException: If the user is not of type "registered".
    """
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return update_user(db, int(user.user_id), request.email, request.username,
                       request.ciudad, request.website)


@router.delete("/me", response_model=dict)
def delete_me(user: UserContext = Depends(get_user_context),
              db: Session = Depends(get_db)):
    """
    Delete the currently authenticated user's account.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A confirmation message.

    Raises:
        HTTPException: If the user is not of type "registered".
    """
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return delete_user(db, int(user.user_id))


@router.get("/admin/users", response_model=dict)
def get_all_users(page: int = Query(1, ge=1),
                  limit: int = Query(10, ge=1, le=100),
                  user=Depends(get_user_context),
                  db: Session = Depends(get_db)):
    """
    Retrieve a paginated list of all users (admin only).

    Args:
        page (int): The page number to retrieve (default is 1).
        limit (int): The number of users per page (default is 10, max is 100).
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing the paginated list of users and metadata.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden ver la lista de usuarios")

    offset = (page - 1) * limit
    query = db.query(User)
    total_items = query.count()
    users = query.offset(offset).limit(limit).all()

    # Convertimos los usuarios a esquemas Pydantic
    users_data = [UserResponse.model_validate(user) for user in users]

    return {
        "data": users_data,
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int,
             user: UserContext = Depends(get_user_context),
             db: Session = Depends(get_db)):
    """
    Retrieve a specific user's information by ID (admin only).

    Args:
        user_id (int): The ID of the user to retrieve.
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        UserResponse: The user's information.

    Raises:
        HTTPException: If the user is not an admin or if the user is not found.
    """
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden acceder a esta información")
    user_data = get_user_info(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_data


@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(user_id: int,
                      request: UpdateProfileRequest,
                      user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):
    """
    Update a specific user's information by ID (admin only).

    Args:
        user_id (int): The ID of the user to update.
        request (UpdateProfileRequest): The request body containing the updated user information.
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        UserResponse: The updated user's information.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden actualizar usuarios")
    updated_user = update_user(db,
                               user_id,
                               email=request.email,
                               username=request.username,
                               ciudad=request.ciudad,
                               website=request.website)
    return updated_user


@router.delete("/{user_id}", response_model=dict)
def delete_user_by_id(user_id: int,
                      user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):
    """
    Delete a specific user's account by ID (admin only).

    Args:
        user_id (int): The ID of the user to delete.
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A confirmation message.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden eliminar usuarios")
    result = delete_user(db, user_id)
    return result
