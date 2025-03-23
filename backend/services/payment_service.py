# backend/services/payment_service.py
from sqlalchemy.orm import Session
from models.payment_method import PaymentMethod
from models.user import User
from core.logging import configure_logging
from models.credit_transaction import CreditTransaction
from fastapi import HTTPException, status

logger = configure_logging()

# Simulación de Stripe (en producción, usar stripe-python)
class StripeSimulator:
    @staticmethod
    def create_payment_intent(amount: float, currency: str = "usd"):
        return {"id": "pi_simulated", "status": "succeeded"}

stripe = StripeSimulator()  # Reemplazar con `import stripe` y configuración real en producción

def purchase_credits(db: Session, user_id: int, credits: int, payment_amount: float, payment_method: str = "stripe"):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Crear transacción de pago
    transaction = CreditTransaction(
        user_id=user_id,
        amount=credits,
        transaction_type="purchase",
        payment_amount=payment_amount,
        payment_method=payment_method,
        payment_status="pending"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Simular procesamiento de pago (en producción, usar Stripe/Paypal real)
    payment_intent = stripe.create_payment_intent(payment_amount)
    if payment_intent["status"] == "succeeded":
        transaction.payment_status = "completed"
        user.credits += credits
        db.commit()
        logger.info(f"Compra de {credits} créditos completada para usuario {user_id}")
        return {"transaction_id": transaction.id, "credits_added": credits, "new_balance": user.credits}
    else:
        transaction.payment_status = "failed"
        db.commit()
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Error al procesar el pago")
    
def add_payment_method(db: Session, user_id: int, payment_type: str, details: str, is_default: bool = False):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"Usuario ID {user_id} no encontrado para añadir método de pago")
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if is_default:
        # Desmarcar otros métodos como default
        db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).update({"is_default": False})
    
    payment_method = PaymentMethod(
        user_id=user_id,
        payment_type=payment_type,
        details=details,
        is_default=is_default
    )
    db.add(payment_method)
    db.commit()
    logger.info(f"Método de pago añadido para usuario ID {user_id}: {payment_type}")
    return payment_method

def get_payment_methods(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"Usuario ID {user_id} no encontrado para listar métodos de pago")
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).all()

def set_default_payment_method(db: Session, user_id: int, payment_method_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"Usuario ID {user_id} no encontrado para establecer método de pago por defecto")
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id, PaymentMethod.user_id == user_id).first()
    if not payment_method:
        logger.error(f"Método de pago ID {payment_method_id} no encontrado para usuario ID {user_id}")
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    
    db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).update({"is_default": False})
    payment_method.is_default = True
    db.commit()
    logger.info(f"Método de pago ID {payment_method_id} establecido como predeterminado para usuario ID {user_id}")
    return payment_method

def get_credit_transactions(db: Session, user_id: int):
    return db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id).all()