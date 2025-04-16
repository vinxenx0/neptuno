# backend/dependencies/credits.py
from fastapi import Depends, HTTPException
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

async def check_credits(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    disable_credits = get_setting(db, "disable_credits")
    
    if disable_credits != "true":  # Solo procesar créditos si no están desactivados
        try:
            if user.user_type == "registered":
                user_db = db.query(User).filter(User.id == int(user.user_id)).first()
                if not user_db:
                    raise HTTPException(status_code=404, detail="Usuario no encontrado")
                credits = user_db.credits
            else:
                session_db = db.query(GuestsSession).filter(GuestsSession.id == user.user_id).first()
                if not session_db:
                    raise HTTPException(status_code=404, detail="Sesión no encontrada")
                credits = session_db.credits

            if credits <= 0:
                logger.warning(f"Usuario {user.user_type} ID {user.user_id} sin créditos suficientes")
                raise HTTPException(status_code=403, detail="No te quedan créditos disponibles.")
            
            return user  # Retorna el usuario para usarlo en el endpoint
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Error inesperado en check_credits para {user.user_type} ID {user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al procesar los créditos")
    return user  # Si los créditos están desactivados, simplemente retorna el usuario