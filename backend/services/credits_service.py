# backend/services/credits_service.py
# Permitir la renovación automática o manual de créditos para usuarios registrados y anónimos.
from sqlalchemy.orm import Session
from models.user import User, subscriptionEnum
from models.credit_transaction import CreditTransaction
from datetime import datetime, timedelta
from fastapi import HTTPException, status

def reset_credits(db: Session, freemium_credits: int = 100, premium_credits: int = 1000, reset_interval: int = 30):
    """Reinicia créditos para usuarios activos según su subscription y el intervalo de renovación."""
    users = db.query(User).filter(User.activo == True).all()
    for user in users:
        if not user.renewal or user.renewal < datetime.utcnow() - timedelta(days=reset_interval):
            user.credits = freemium_credits if user.subscription == subscriptionEnum.FREEMIUM else premium_credits
            user.renewal = datetime.utcnow()
            db.add(CreditTransaction(user_id=user.id, amount=user.credits, transaction_type="reset"))
    db.commit()

def deduct_credit(db: Session, user_id: int, amount: int = 1):
    """Deduce créditos de un usuario y registra la transacción."""
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if user.credits < amount:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No te quedan suficientes créditos")
    user.credits -= amount
    db.add(CreditTransaction(user_id=user_id, amount=-amount, transaction_type="usage"))
    db.commit()
    return user.credits