# backend/services/credits_service.py
# Permitir la renovación automática o manual de créditos para usuarios registrados y anónimos.
from sqlalchemy.orm import Session
from models.user import User, PlanEnum
from models.credit_transaction import CreditTransaction
from datetime import datetime, timedelta
from fastapi import HTTPException, status

def reset_credits(db: Session, freemium_credits: int = 100, premium_credits: int = 1000, reset_interval: int = 30):
    """Reinicia créditos para usuarios activos según su plan y el intervalo de renovación."""
    users = db.query(User).filter(User.activo == True).all()
    for user in users:
        if not user.fecha_renovacion or user.fecha_renovacion < datetime.utcnow() - timedelta(days=reset_interval):
            user.consultas_restantes = freemium_credits if user.plan == PlanEnum.FREEMIUM else premium_credits
            user.fecha_renovacion = datetime.utcnow()
            db.add(CreditTransaction(user_id=user.id, amount=user.consultas_restantes, transaction_type="reset"))
    db.commit()

def deduct_credit(db: Session, user_id: int, amount: int = 1):
    """Deduce créditos de un usuario y registra la transacción."""
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if user.consultas_restantes < amount:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No te quedan suficientes créditos")
    user.consultas_restantes -= amount
    db.add(CreditTransaction(user_id=user_id, amount=-amount, transaction_type="usage"))
    db.commit()
    return user.consultas_restantes