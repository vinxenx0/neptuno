# backend/api/v1/graphql/schema/user.py
import strawberry
from typing import Optional, List
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from models.user import User
from schemas.user import UserResponse, UpdateProfileRequest

@strawberry.type
class UserType:
    id: int
    email: str
    username: str
    rol: str
    activo: bool
    subscription: str
    ciudad: Optional[str]
    website: Optional[str]
    credits: int
    create_at: str
    last_ip: Optional[str]

    @classmethod
    def from_db(cls, user: User):
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            rol=user.rol,
            activo=user.activo,
            subscription=user.subscription.value,
            ciudad=user.ciudad,
            website=user.website,
            credits=user.credits,
            create_at=user.create_at.isoformat(),
            last_ip=user.last_ip
        )

@strawberry.input
class UpdateProfileInput:
    email: Optional[str] = None
    username: Optional[str] = None
    ciudad: Optional[str] = None
    website: Optional[str] = None

@strawberry.type
class UserQueries:
    @strawberry.field
    async def me(self, info) -> Optional[UserType]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can access this")
        db_user = info.context["user_service"].get_user_info(info.context["db"], int(user.user_id))
        return UserType.from_db(db_user)

    @strawberry.field
    async def user(self, info, user_id: int) -> Optional[UserType]:
        current_user = await get_user_context(info.context["request"], info.context["db"])
        if current_user.rol != "admin":
            raise Exception("Only admins can view other users")
        db_user = info.context["user_service"].get_user_info(info.context["db"], user_id)
        return UserType.from_db(db_user)

    @strawberry.field
    async def users(
        self,
        info,
        page: int = 1,
        limit: int = 10
    ) -> List[UserType]:
        current_user = await get_user_context(info.context["request"], info.context["db"])
        if current_user.rol != "admin":
            raise Exception("Only admins can list users")
        
        offset = (page - 1) * limit
        users = info.context["db"].query(User).offset(offset).limit(limit).all()
        return [UserType.from_db(user) for user in users]

@strawberry.type
class UserMutations:
    @strawberry.mutation
    async def update_me(
        self,
        info,
        input: UpdateProfileInput
    ) -> UserType:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can update profile")
        
        update_data = UpdateProfileRequest(
            email=input.email,
            username=input.username,
            ciudad=input.ciudad,
            website=input.website
        )
        updated_user = info.context["user_service"].update_user(
            info.context["db"],
            int(user.user_id),
            update_data.email,
            update_data.username,
            update_data.ciudad,
            update_data.website
        )
        return UserType.from_db(updated_user)

    @strawberry.mutation
    async def delete_me(self, info) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can delete account")
        
        info.context["user_service"].delete_user(info.context["db"], int(user.user_id))
        return True

    @strawberry.mutation
    async def update_user(
        self,
        info,
        user_id: int,
        input: UpdateProfileInput
    ) -> UserType:
        current_user = await get_user_context(info.context["request"], info.context["db"])
        if current_user.rol != "admin":
            raise Exception("Only admins can update other users")
        
        update_data = UpdateProfileRequest(
            email=input.email,
            username=input.username,
            ciudad=input.ciudad,
            website=input.website
        )
        updated_user = info.context["user_service"].update_user(
            info.context["db"],
            user_id,
            update_data.email,
            update_data.username,
            update_data.ciudad,
            update_data.website
        )
        return UserType.from_db(updated_user)

    @strawberry.mutation
    async def delete_user(self, info, user_id: int) -> bool:
        current_user = await get_user_context(info.context["request"], info.context["db"])
        if current_user.rol != "admin":
            raise Exception("Only admins can delete users")
        
        info.context["user_service"].delete_user(info.context["db"], user_id)
        return True