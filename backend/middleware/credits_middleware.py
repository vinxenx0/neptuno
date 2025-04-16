# backend/middleware/credits.py
from schemas.gamification import GamificationEventCreate
from services.gamification_service import register_event
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
# from models.guests import GuestsSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting
from dependencies.auth import UserContext

logger = configure_logging()

# backend/middleware/credits.py
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
# from models.guests import GuestsSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting

logger = configure_logging()

def require_credits(func):
    @wraps(func)
    async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
        disable_credits = get_setting(db, "disable_credits")
        if disable_credits != "true":
            user_db = db.query(User).filter(User.id == int(user.user_id)).first()
            if not user_db:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if user_db.credits <= 0:
                logger.warning(f"Usuario ID {user.user_id} sin créditos suficientes")
                raise HTTPException(status_code=403, detail="No te quedan créditos disponibles.")

            logger.info(f"Usuario ID {user.user_id} realiza consulta")
            response = await func(user=user, db=db, *args, **kwargs)

            user_db.credits -= 1
            transaction = CreditTransaction(
                user_id=user_db.id,
                user_type=user.user_type,
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
            logger.debug(f"Créditos actualizados para ID {user.user_id}: {user_db.credits}")
            return response
        return await func(user=user, db=db, *args, **kwargs)
    return wrapper