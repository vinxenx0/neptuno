# backend/services/payment_service.py
# Servicio para pagos y métodos de pago de usuarios
from sqlalchemy.orm import Session
from schemas.payment import PaymentMethodResponse
from models.payment_method import PaymentMethod
from models.user import User
from core.logging import configure_logging
from models.credit_transaction import CreditTransaction
from fastapi import HTTPException, status

logger = configure_logging()

class StripeSimulator:
    @staticmethod
    def create_payment_intent(amount: float, currency: str = "usd"):
        return {"id": "pi_simulated", "status": "succeeded"}

stripe = StripeSimulator()

def purchase_credits(db: Session, user_id: int, credits: int, payment_amount: float, payment_method: str = "stripe"):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        transaction = CreditTransaction(
            user_type="registered",  # ¡Añadimos esto explícitamente!
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
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al procesar compra de créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar compra")

def add_payment_method(db: Session, user_id: int, payment_type: str, details: str, is_default: bool = False):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        if is_default:
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
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al añadir método de pago para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al añadir método de pago")

def get_payment_methods(db: Session, user_id: int):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).all()
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al listar métodos de pago para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al listar métodos de pago")

def set_default_payment_method(db: Session, user_id: int, payment_method_id: int):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id, PaymentMethod.user_id == user_id).first()
        if not payment_method:
            raise HTTPException(status_code=404, detail="Método de pago no encontrado")
        
        db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).update({"is_default": False})
        payment_method.is_default = True
        db.commit()
        logger.info(f"Método de pago ID {payment_method_id} establecido como predeterminado para usuario ID {user_id}")
        return payment_method
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al establecer método de pago predeterminado para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al establecer método de pago")

def get_credit_transactions(db: Session, user_id: int):
    try:
        return db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id).all()
    except Exception as e:
        logger.error(f"Error al obtener transacciones de créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al obtener transacciones")
    
    
def update_payment_method(db: Session, user_id: int, method_id: int, payment_type: str, details: str) -> PaymentMethodResponse:
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id, PaymentMethod.user_id == user_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    method.payment_type = payment_type
    method.details = details
    db.commit()
    db.refresh(method)
    return PaymentMethodResponse.from_orm(method)

def delete_payment_method(db: Session, user_id: int, method_id: int):
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id, PaymentMethod.user_id == user_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    if method.is_default:
        raise HTTPException(status_code=400, detail="No se puede eliminar el método de pago predeterminado")
    db.delete(method)
    db.commit()