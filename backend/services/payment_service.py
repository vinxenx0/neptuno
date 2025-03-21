from sqlalchemy.orm import Session
from models.payment_method import PaymentMethod
from models.user import User
from core.logging import configure_logging
from fastapi import HTTPException

logger = configure_logging()

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