# backend/services/order_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.credit_transaction import CreditTransaction
from models.marketplace import CartItem, Order, OrderItem, Product
from models.user import User
from schemas.marketplace import OrderCreate, OrderResponse
from typing import Optional, List
from models.user import User
from models.guests import GuestsSession

def create_order(db: Session, user_id: int | None, session_id: str | None, order: OrderCreate):
    total_amount = 0
    order_items = []
    has_paid_items = False

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        if not product.is_free and not user_id:
            raise HTTPException(status_code=403, detail="Los usuarios anónimos solo pueden adquirir productos gratuitos")
        if not product.is_free:
            has_paid_items = True
        total_amount += product.price * item.quantity
        order_items.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price,
            product_name=product.name,
            is_digital=product.is_digital,
            file_path=product.file_path
        ))

    if has_paid_items and user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user.credits < total_amount:
            raise HTTPException(status_code=402, detail="Créditos insuficientes")
        user.credits -= total_amount
        db.commit()

    db_order = Order(
        user_id=user_id,
        session_id=session_id,
        total_amount=total_amount,
        status="completed" if has_paid_items else "processed"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order_items:
        item.order_id = db_order.id
        db.add(item)
    db.commit()

    # Limpiar el carrito
    if user_id:
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    elif session_id:
        db.query(CartItem).filter(CartItem.session_id == session_id).delete()
    db.commit()

    return db_order

def get_orders(db: Session, user_id: Optional[int], session_id: Optional[str]) -> List[Order]:
    query = db.query(Order)
    if user_id:
        query = query.filter(Order.user_id == user_id)
    elif session_id:
        query = query.filter(Order.session_id == session_id)
    return query.all()