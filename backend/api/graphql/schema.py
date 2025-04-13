import strawberry
from typing import Optional, List
from fastapi import Depends, Request
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from schemas.auth import TokenResponse
from schemas.user import RegisterRequest
from services.auth_service import (
    login_user,
    register_user,
    refresh_access_token,
    logout_user,
    request_password_reset,
    confirm_password_reset,
    change_user_password
)
from core.security import OAuth2PasswordRequestForm
from core.logging import configure_logger

logger = configure_logger()

@strawberry.type
class TokenResponseType:
    access_token: str
    refresh_token: str
    token_type: str

@strawberry.type
class UserType:
    id: str
    email: str
    username: str
    user_type: str
    subscription: str
    credits: int
    role: str

@strawberry.input
class LoginInput:
    username: str
    password: str

@strawberry.input
class RegisterInput:
    email: str
    username: str
    password: str

@strawberry.input
class PasswordResetInput:
    email: str

@strawberry.input
class PasswordResetConfirmInput:
    token: str
    new_password: str

@strawberry.input
class RefreshTokenInput:
    refresh_token: str

@strawberry.input
class ChangePasswordInput:
    current_password: str
    new_password: str

@strawberry.type
class AuthMutations:
    @strawberry.mutation
    async def login(
        self,
        info,
        input: LoginInput,
        request: Request,
        db: Session = Depends(get_db)
    ) -> TokenResponseType:
        form_data = OAuth2PasswordRequestForm(
            username=input.username,
            password=input.password,
            scope=""
        )
        ip = request.client.host
        token_data = login_user(db, form_data.username, form_data.password, ip)
        return TokenResponseType(
            access_token=token_data.access_token,
            refresh_token=token_data.refresh_token,
            token_type=token_data.token_type
        )

    @strawberry.mutation
    async def register(
        self,
        info,
        input: RegisterInput,
        db: Session = Depends(get_db)
    ) -> TokenResponseType:
        from services.settings_service import get_setting
        enable_registration = get_setting(db, "enable_registration")
        if enable_registration != "true":
            raise Exception("User registration is disabled")
        
        register_request = RegisterRequest(
            email=input.email,
            username=input.username,
            password=input.password
        )
        token_data = register_user(db, register_request)
        return TokenResponseType(
            access_token=token_data.access_token,
            refresh_token=token_data.refresh_token,
            token_type=token_data.token_type
        )

    @strawberry.mutation
    async def refresh_token(
        self,
        info,
        input: RefreshTokenInput,
        request: Request,
        db: Session = Depends(get_db)
    ) -> TokenResponseType:
        logger.info(f"Refresh token attempt from IP {request.client.host}")
        token_data = refresh_access_token(db, input.refresh_token)
        return TokenResponseType(
            access_token=token_data.access_token,
            refresh_token=token_data.refresh_token,
            token_type=token_data.token_type
        )

    @strawberry.mutation
    async def logout(
        self,
        info,
        token: str,
        db: Session = Depends(get_db)
    ) -> bool:
        logout_user(db, token)
        return True

    @strawberry.mutation
    async def request_password_reset(
        self,
        info,
        input: PasswordResetInput,
        db: Session = Depends(get_db)
    ) -> bool:
        request_password_reset(db, input.email)
        return True

    @strawberry.mutation
    async def confirm_password_reset(
        self,
        info,
        input: PasswordResetConfirmInput,
        db: Session = Depends(get_db)
    ) -> bool:
        confirm_password_reset(db, input.token, input.new_password)
        return True

    @strawberry.mutation
    async def change_password(
        self,
        info,
        input: ChangePasswordInput,
        user: UserContext = Depends(get_user_context),
        db: Session = Depends(get_db)
    ) -> bool:
        if user.user_type != "registered":
            raise Exception("Only registered users can change password")
        change_user_password(
            db,
            int(user.user_id),
            input.current_password,
            input.new_password
        )
        return True

@strawberry.type
class AuthQueries:
    @strawberry.field
    async def me(
        self,
        info,
        user: UserContext = Depends(get_user_context)
    ) -> UserType:
        return UserType(
            id=user.user_id,
            email=user.email,
            username=user.username,
            user_type=user.user_type,
            subscription=user.subscription,
            credits=user.credits,
            role=user.rol
        )

@strawberry.type
class Query(AuthQueries):
    pass

@strawberry.type
class Mutation(AuthMutations):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)