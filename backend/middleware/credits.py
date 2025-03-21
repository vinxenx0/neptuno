# backend/middleware/credits.py
# Módulo de middleware para créditos.
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User, PlanEnum
from models.session import AnonymousSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook

logger = configure_logging()

def require_credits(func):
    @wraps(func)
    async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
        try:
            credit_limit = 100 if user.plan in [None, PlanEnum.FREEMIUM.value] else 1000
            if user.consultas_restantes <= 0:
                logger.warning(f"Usuario {user.user_type} ID {user.user_id} sin créditos suficientes (plan: {user.plan or 'anonymous'})")
                raise HTTPException(status_code=403, detail="No te quedan créditos disponibles.")

            logger.info(f"Usuario {user.user_type} ID {user.user_id} con plan {user.plan or 'anonymous'} realiza consulta")
            response = await func(user=user, db=db, *args, **kwargs)
           
            # Decrementar créditos y registrar transacción
            if user.user_type == "registered":
                user_db = db.query(User).filter(User.id == int(user.user_id)).first()
                if not user_db:
                    raise HTTPException(status_code=404, detail="Usuario no encontrado")
                user_db.consultas_restantes -= 1
                transaction = CreditTransaction(
                    user_id=user_db.id,
                    amount=-1,
                    transaction_type="usage",
                    description="Consulta realizada"
                )
            else:
                session_db = db.query(AnonymousSession).filter(AnonymousSession.id == user.user_id).first()
                if not session_db:
                    raise HTTPException(status_code=404, detail="Sesión no encontrada")
                session_db.consultas_restantes -= 1
                transaction = CreditTransaction(
                    session_id=session_db.id,
                    amount=-1,
                    transaction_type="usage",
                    description="Consulta realizada por anónimo"
                )
            db.add(transaction)
            db.commit()

            trigger_webhook(db, "credit_usage", {
                "user_id": user.user_id,
                "user_type": user.user_type,
                "credits_remaining": user.consultas_restantes - 1
            })
            
            logger.debug(f"Créditos actualizados para {user.user_type} ID {user.user_id}: {user.consultas_restantes - 1}")

            return response
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Error inesperado en middleware de créditos para {user.user_type} ID {user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al procesar los créditos")
    return wrapper