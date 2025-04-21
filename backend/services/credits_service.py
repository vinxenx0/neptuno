# backend/services/credits_service.py
# Servicio para gestión y deducción de créditos
# Permitir la renovación automática o manual de créditos para usuarios registrados y anónimos.
from sqlalchemy.orm import Session
from models.user import User, subscriptionEnum
from models.credit_transaction import CreditTransaction
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from core.logging import configure_logging

logger = configure_logging()

def reset_credits(db: Session, freemium_credits: int = 100, premium_credits: int = 1000, reset_interval: int = 30):
    try:
        users = db.query(User).filter(User.activo == True).all()
        for user in users:
            if not user.renewal or user.renewal < datetime.utcnow() - timedelta(days=reset_interval):
                user.credits = freemium_credits if user.subscription == subscriptionEnum.FREEMIUM else premium_credits
                user.renewal = datetime.utcnow()
                db.add(CreditTransaction(
                    user_id=user.id,
                    user_type='registered',  # Corrección clave
                    amount=user.credits,
                    transaction_type="reset"
                ))
        db.commit()
    except Exception as e:
        logger.error(f"Error al reiniciar créditos: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al reiniciar créditos")

def deduct_credit(db: Session, user_id: int, amount: int = 1):
    try:
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        if user.credits < amount:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No te quedan suficientes créditos")
        user.credits -= amount
        db.add(CreditTransaction(
            user_id=user_id,
            user_type='registered',  # Corrección clave
            amount=-amount,
            transaction_type="usage",
            description="Consulta realizada"  # Opcional, para consistencia con los logs
        ))
        db.commit()
        return user.credits
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al deducir créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al deducir créditos")