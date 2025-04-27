# backend/api/v1/health/test.py
# Endpoints de prueba y consumo de créditos para la API
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.credits import check_credits
from models.credit_transaction import CreditTransaction
from models.gamification import EventType
from models.guests import GuestsSession
from models.user import User
from schemas.gamification import GamificationEventCreate, GamificationEventResponse
from services.gamification_service import register_event
from services.integration_service import trigger_webhook
from services.settings_service import get_setting
from middleware.credits_middleware import require_credits
from dependencies.auth import UserContext, get_user_context
from services.credits_service import reset_credits
from core.database import get_db
from core.logging import configure_logging

router = APIRouter(tags=["test"])
logger = configure_logging()


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


@router.get("/no-login/")
async def no_login_test(user: UserContext = Depends(check_credits), db: Session = Depends(get_db)):
    """
    Endpoint para probar la API sin necesidad de login.
    Consume créditos si están activos.
    """
    # Preparar la respuesta
    response = {"message": "Consulta realizada sin necesidad de login", "user_type": user.user_type}
    if user.user_type == "anonymous":
        response["session_id"] = user.user_id  # Incluir session_id en la respuesta

    # Consumir créditos si no están desactivados
    disable_credits = get_setting(db, "disable_credits")
    if (disable_credits != "true"):
        try:
            if user.user_type == "registered":
                user_db = db.query(User).filter(User.id == int(user.user_id)).first()
                user_db.credits -= 1
                transaction = CreditTransaction(
                    user_id=user_db.id,
                    user_type="registered",  # Especificar explícitamente
                    amount=-1,
                    transaction_type="usage",
                    description="Consulta realizada"
                )
                credits_remaining = user_db.credits
            else:
                session_db = db.query(GuestsSession).filter(GuestsSession.id == user.user_id).first()
                session_db.credits -= 1
                transaction = CreditTransaction(
                    session_id=session_db.id,
                    user_type="anonymous",  # Especificar explícitamente para claridad
                    amount=-1,
                    transaction_type="usage",
                    description="Consulta realizada por anónimo"
                )
                credits_remaining = session_db.credits
            
            db.add(transaction)
            db.commit()

            trigger_webhook(db, "credit_usage", {
                "user_id": user.user_id,
                "user_type": user.user_type,
                "credits_remaining": credits_remaining
            })
            logger.debug(f"Créditos actualizados para {user.user_type} ID {user.user_id}: {credits_remaining}")
        except Exception as e:
            logger.error(f"Error al consumir créditos para {user.user_type} ID {user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al procesar los créditos")

    return response

@router.get("/restricted")
async def restricted_test(user: UserContext = Depends(check_credits), db: Session = Depends(get_db)):
    """
    Endpoint restringido que requiere login.
    Consume créditos si están activos.
    """
    if user.user_type != "registered":
        raise HTTPException(status_code=401, detail="Se requiere autenticación")

    # Preparar la respuesta
    response = {"message": "Consulta realizada con login", "user_type": user.user_type}

    # Consumir créditos si no están desactivados
    disable_credits = get_setting(db, "disable_credits")
    if disable_credits != "true":
        try:
            user_db = db.query(User).filter(User.id == int(user.user_id)).first()
            user_db.credits -= 1
            transaction = CreditTransaction(
                user_id=user_db.id,
                user_type="registered",  # Especificar explícitamente
                amount=-1,
                transaction_type="usage",
                description="Consulta realizada"
            )
            db.add(transaction)
            db.commit()

            trigger_webhook(db, "credit_usage", {
                "user_id": user.user_id,
                "user_type": user.user_type,
                "credits_remaining": user_db.credits
            })
            logger.debug(f"Créditos actualizados para {user.user_type} ID {user.user_id}: {user_db.credits}")
        except Exception as e:
            logger.error(f"Error al consumir créditos para {user.user_type} ID {user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al procesar los créditos")

    return response

@router.post("/test-event", response_model=GamificationEventResponse)
def test_gamification_event(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    event_type = db.query(EventType).filter(EventType.name == "test_api").first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type 'test_api' not found")
    event = GamificationEventCreate(event_type_id=event_type.id)
    return register_event(db, event, user)