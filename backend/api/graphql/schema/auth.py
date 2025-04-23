# backend/api/v1/graphql/schema/auth.py
from api.graphql.schema.user import UserType
import strawberry
from typing import Optional
from fastapi import Depends
from sqlalchemy.orm import Session
from ..rest.auth import router as auth_rest_router
from core.database import get_db
from dependencies.auth import get_user_context
from schema.auth import TokenResponse

@strawberry.type
class AuthQueries:
    @strawberry.field
    async def me(self, info) -> Optional[UserType]:
        # Reuse your existing dependency
        user = await get_user_context(info.context["request"])
        if not user:
            return None
        return UserType.from_orm(user)

@strawberry.type
class AuthMutations:
    @strawberry.mutation
    async def login(self, info, username: str, password: str) -> TokenResponse:
        # Reuse your REST endpoint logic
        db = info.context["db"]
        request = info.context["request"]
        form_data = OAuth2PasswordRequestForm(
            username=username,
            password=password,
            scope=""
        )
        return await auth_rest_router.login_for_access_token(
            request=request,
            form_data=form_data,
            db=db
        )