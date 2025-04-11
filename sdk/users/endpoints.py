# sdk/users/endpoints.py

from sdk.client import request
from sdk.models.user import UserResponse, UpdateProfileRequest
from typing import List


def get_me() -> UserResponse:
    """Obtener información del usuario actual (requiere token)"""
    result = request("GET", "/v1/users/me")
    return UserResponse(**result)


def update_me(data: UpdateProfileRequest) -> UserResponse:
    """Actualizar perfil del usuario actual"""
    result = request("PUT", "/v1/users/me", data=data.dict(exclude_none=True))
    return UserResponse(**result)


def delete_me() -> dict:
    """Eliminar la cuenta del usuario actual"""
    return request("DELETE", "/v1/users/me")


def get_user_by_id(user_id: int) -> UserResponse:
    """Admin: Obtener un usuario por su ID"""
    result = request("GET", f"/v1/users/{user_id}")
    return UserResponse(**result)


def update_user_by_id(user_id: int, data: UpdateProfileRequest) -> UserResponse:
    """Admin: Actualizar un usuario específico"""
    result = request("PUT", f"/v1/users/{user_id}", data=data.dict(exclude_none=True))
    return UserResponse(**result)


def delete_user_by_id(user_id: int) -> dict:
    """Admin: Eliminar un usuario específico"""
    return request("DELETE", f"/v1/users/{user_id}")


def get_all_users(page: int = 1, limit: int = 10) -> dict:
    """Admin: Obtener todos los usuarios con paginación"""
    result = request("GET", f"/v1/users/admin/users?page={page}&limit={limit}")
    return {
        "data": [UserResponse(**u) for u in result["data"]],
        "total_items": result["total_items"],
        "total_pages": result["total_pages"],
        "current_page": result["current_page"]
    }
