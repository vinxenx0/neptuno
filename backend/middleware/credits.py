# backend/middleware/credits.py
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
from models.session import AnonymousSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting

logger = configure_logging()

# backend/middleware/credits.py
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
from models.session import AnonymousSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting

logger = configure_logging()

def require_credits(func):
    @wraps(func)
    async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
        disable_credits = get_setting(db, "disable_credits")
        
        if disable_credits != "true":  # Solo procesar créditos si no están desactivados
            try:
                if user.user_type == "registered":
                    user_db = db.query(User).filter(User.id == int(user.user_id)).first()
                    if not user_db:
                        raise HTTPException(status_code=404, detail="Usuario no encontrado")
                    credits = user_db.credits
                else:
                    session_db = db.query(AnonymousSession).filter(AnonymousSession.id == user.session_id).first()
                    if not session_db:
                        raise HTTPException(status_code=404, detail="Sesión no encontrada")
                    credits = session_db.credits

                if credits <= 0:
                    logger.warning(f"Usuario {user.user_type} ID {user.user_id} sin créditos suficientes")
                    raise HTTPException(status_code=403, detail="No te quedan créditos disponibles.")

                logger.info(f"Usuario {user.user_type} ID {user.user_id} realiza consulta")
                response = await func(user=user, db=db, *args, **kwargs)

                if user.user_type == "registered":
                    user_db.credits -= 1
                    transaction = CreditTransaction(
                        user_id=user_db.id,
                        user_type="registered",
                        amount=-1,
                        transaction_type="usage",
                        description="Consulta realizada"
                    )
                else:
                    session_db.credits -= 1
                    transaction = CreditTransaction(
                        session_id=session_db.id,
                        user_type="anonymous",
                        amount=-1,
                        transaction_type="usage",
                        description="Consulta realizada por anónimo"
                    )

                # Verificación adicional de user_type
                if transaction.user_type != user.user_type:
                    logger.error(f"Inconsistencia en user_type: transacción={transaction.user_type}, contexto={user.user_type}")
                    raise HTTPException(status_code=500, detail="Inconsistencia en el tipo de usuario")

                # Registro de parámetros de la transacción para depuración
                logger.debug(f"Parámetros de la transacción: {transaction.__dict__}")

                db.add(transaction)
                db.commit()

                trigger_webhook(db, "credit_usage", {
                    "user_id": user.user_id,
                    "user_type": user.user_type,
                    "credits_remaining": credits - 1
                })

                logger.debug(f"Créditos actualizados para {user.user_type} ID {user.user_id}: {credits - 1}")
                return response
            except HTTPException as e:
                raise e
            except Exception as e:
                logger.error(f"Error inesperado en middleware de créditos para {user.user_type} ID {user.user_id}: {str(e)}")
                raise HTTPException(status_code=500, detail="Error al procesar los créditos")
        else:
            return await func(user=user, db=db, *args, **kwargs)
    return wrapper