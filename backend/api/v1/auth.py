# backend/api/v1/auth.py
# Módulo de autenticación de la API v1.

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from services.settings_service import get_setting
from schemas.auth import (ChangePasswordRequest, PasswordResetConfirm,
                          TokenResponse, RefreshTokenRequest,
                          PasswordResetRequest)
from schemas.user import RegisterRequest
from services.auth_service import (login_user, register_user,
                                   refresh_access_token, logout_user,
                                   request_password_reset,
                                   confirm_password_reset,
                                   change_user_password, login_with_provider)
from core.database import get_db
from core.security import oauth2_scheme, OAuth2PasswordRequestForm
from core.security import get_oauth2_redirect_url
from dependencies.auth import UserContext, get_user_context
from core.logging import configure_logging

router = APIRouter(tags=["auth"])
logger = configure_logging()


@router.post("/token", response_model=TokenResponse)
def login_for_access_token(request: Request,
                           form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):
    """
    Authenticate a user and generate an access token.

    Args:
        request (Request): The HTTP request object, used to retrieve client IP.
        form_data (OAuth2PasswordRequestForm): The form data containing username and password.
        db (Session): The database session dependency.

    Returns:
        TokenResponse: The access token and refresh token for the authenticated user.

    Raises:
        HTTPException: If authentication fails or an unexpected error occurs.
    """
    try:
        ip = request.client.host
        return login_user(db, form_data.username, form_data.password, ip)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(
            f"Unexpected error during login from IP {request.client.host}: {str(e)}"
        )
        raise HTTPException(status_code=500, detail="Error processing login")


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        data (RegisterRequest): The registration data including email, username, password, city, and website.
        db (Session): The database session dependency.

    Returns:
        TokenResponse: The access token and refresh token for the newly registered user.

    Raises:
        HTTPException: If registration is disabled or an error occurs during registration.
    """
    enable_registration = get_setting(db, "enable_registration")
    if enable_registration != "true":
        raise HTTPException(status_code=403,
                            detail="User registration is disabled")
    return register_user(db, data.email, data.username, data.password,
                         data.ciudad, data.website)


@router.post("/password-reset", response_model=dict)
def reset_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request a password reset for a user.

    Args:
        data (PasswordResetRequest): The request data containing the user's email.
        db (Session): The database session dependency.

    Returns:
        dict: A response indicating the success of the password reset request.
    """
    return request_password_reset(db, data.email)


@router.post("/password-reset/confirm", response_model=dict)
def confirm_password_reset(data: PasswordResetConfirm,
                           db: Session = Depends(get_db)):
    """
    Confirm a password reset using a token.

    Args:
        data (PasswordResetConfirm): The confirmation data containing the reset token and new password.
        db (Session): The database session dependency.

    Returns:
        dict: A response indicating the success of the password reset confirmation.
    """
    return confirm_password_reset(db, data.token, data.new_password)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request,
                  data: RefreshTokenRequest,
                  db: Session = Depends(get_db)):
    """
    Refresh an access token using a refresh token.

    Args:
        request (Request): The HTTP request object, used to retrieve client IP.
        data (RefreshTokenRequest): The request data containing the refresh token.
        db (Session): The database session dependency.

    Returns:
        TokenResponse: The new access token and refresh token.

    Raises:
        HTTPException: If the refresh token is invalid or an unexpected error occurs.
    """
    try:
        logger.info(f"Token refresh attempt from IP {request.client.host}")
        result = refresh_access_token(db, data.refresh_token)
        logger.info("Token refresh successful")
        return result
    except HTTPException as e:
        logger.error(f"Error refreshing token: {e.detail}")
        raise
    except Exception as e:
        logger.critical(f"Unexpected error in refresh_token: {str(e)}",
                        exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/logout", response_model=dict)
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Log out a user by invalidating their access token.

    Args:
        token (str): The access token to be invalidated.
        db (Session): The database session dependency.

    Returns:
        dict: A response indicating the success of the logout operation.
    """
    return logout_user(db, token)


@router.get("/login/{provider}", response_model=dict)
def get_provider_login_url(provider: str):
    """
    Get the login URL for a social login provider.

    Args:
        provider (str): The name of the social login provider.

    Returns:
        dict: A dictionary containing the redirect URL for the provider.

    Raises:
        HTTPException: If social login is disabled or the provider is unsupported.
    """
    enable_social_login = get_setting(db, "enable_social_login")
    if enable_social_login != "true":
        raise HTTPException(status_code=403, detail="Social login is disabled")

    try:
        redirect_url = get_oauth2_redirect_url(provider)
        return {"redirect_url": redirect_url}
    except ValueError:
        raise HTTPException(status_code=400, detail="Unsupported provider")


@router.post("/login/{provider}/callback", response_model=TokenResponse)
def provider_callback(provider: str,
                      code: str,
                      request: Request,
                      db: Session = Depends(get_db)):
    """
    Handle the callback from a social login provider.

    Args:
        provider (str): The name of the social login provider.
        code (str): The authorization code returned by the provider.
        request (Request): The HTTP request object, used to retrieve client IP.
        db (Session): The database session dependency.

    Returns:
        TokenResponse: The access token and refresh token for the authenticated user.
    """
    ip = request.client.host
    return login_with_provider(db, provider, code, ip)


@router.put("/me/password", response_model=dict)
def change_password(data: ChangePasswordRequest,
                    user: UserContext = Depends(get_user_context),
                    db: Session = Depends(get_db)):
    """
    Change the password for the currently authenticated user.

    Args:
        data (ChangePasswordRequest): The request data containing the current and new passwords.
        user (UserContext): The context of the currently authenticated user.
        db (Session): The database session dependency.

    Returns:
        dict: A response indicating the success of the password change.

    Raises:
        HTTPException: If the user is not registered or an error occurs during the password change.
    """
    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Only registered users can change their password")
    return change_user_password(db, int(user.user_id), data.current_password,
                                data.new_password)
