# backend/api/v1/endpoints.py
# Módulo de endpoints de la API v1.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.credits import require_credits
from dependencies.auth import UserContext, get_user_context
from services.credits_service import reset_credits
from core.database import get_db
from core.logging import configure_logging

router = APIRouter()
logger = configure_logging()

@router.get("/info")
def get_info():
    return {"message": "Endpoint público sin restricciones"}

@router.get("/consultar")
@require_credits
async def consultar(user: UserContext = Depends(get_user_context)):
    return {
        "message": f"Consulta realizada por {user.user_type} con ID {user.user_id}",
        "creditos_restantes": user.credits - 1
    }

@router.post("/reset-credits")
def reset_all_credits(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    try:
        if user.user_type != "registered":
            logger.warning(f"Intento de resetear créditos por usuario no registrado ID {user.user_id}")
            raise HTTPException(status_code=403, detail="Solo usuarios registrados")
        reset_credits(db, int(user.user_id))
        return {"message": "Créditos reiniciados para todos los usuarios"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en reset-credits por ID {user.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al reiniciar créditos")
    return {"message": "Créditos reiniciados para todos los usuarios"}

@router.get("/example", dependencies=[Depends(require_credits)])
async def example_endpoint(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return {"message": "Ejemplo de endpoint protegido por créditos", "credits_remaining": user.credits}


@router.get("/test-credit-consumption")
@require_credits
async def test_credit_consumption(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    return {"message": "Crédito consumido exitosamente"}