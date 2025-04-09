# backend/api/v1/endpoints.py
# Módulo de endpoints de la API v1.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.settings_service import get_setting
from middleware.credits_middleware import require_credits
from dependencies.auth import UserContext, get_user_context
from services.credits_service import reset_credits
from core.database import get_db
from core.logging import configure_logging

router = APIRouter()
logger = configure_logging()


@router.get("/consultar")
@require_credits
async def consultar(user: UserContext = Depends(get_user_context)):
    """
    Perform a consultation using the user's credits.

    This endpoint allows a user to perform a consultation. It requires the user to have
    sufficient credits, which are decremented upon successful execution.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.

    Returns:
        dict: A dictionary containing a success message and the remaining credits.

    Raises:
        HTTPException: If the user does not have sufficient credits.
    """
    return {
        "message":
        f"Consulta realizada por {user.user_type} con ID {user.user_id}",
        "creditos_restantes": user.credits - 1
    }


@router.post("/reset-credits")
def reset_all_credits(user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):
    """
    Reset credits for all users.

    This endpoint allows a registered user to reset the credits for all users in the system.
    Only users with the "registered" user type are authorized to perform this action.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing a success message.

    Raises:
        HTTPException: If the user is not authorized or if an unexpected error occurs.
    """
    try:
        if user.user_type != "registered":
            logger.warning(
                f"Intento de resetear créditos por usuario no registrado ID {user.user_id}"
            )
            raise HTTPException(status_code=403,
                                detail="Solo usuarios registrados")
        reset_credits(db, int(user.user_id))
        return {"message": "Créditos reiniciados para todos los usuarios"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(
            f"Error inesperado en reset-credits por ID {user.user_id}: {str(e)}"
        )
        raise HTTPException(status_code=500,
                            detail="Error al reiniciar créditos")


@router.get("/example", dependencies=[Depends(require_credits)])
async def example_endpoint(user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    """
    Example endpoint protected by credit consumption.

    This endpoint demonstrates how to protect an endpoint using the credit consumption middleware.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing a success message and the remaining credits.
    """
    return {
        "message": "Ejemplo de endpoint protegido por créditos",
        "credits_remaining": user.credits
    }


@router.get("/test-credit-consumption")
@require_credits
async def test_credit_consumption(
        user: UserContext = Depends(get_user_context),
        db: Session = Depends(get_db)):
    """
    Test endpoint for credit consumption.

    This endpoint allows testing of the credit consumption mechanism. It requires the user
    to have sufficient credits, which are decremented upon successful execution.

    Args:
        user (UserContext): The context of the authenticated user, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing a success message.

    Raises:
        HTTPException: If the user does not have sufficient credits.
    """
    return {"message": "Crédito consumido exitosamente"}
