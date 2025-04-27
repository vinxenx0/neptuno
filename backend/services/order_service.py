# backend/services/order_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.marketplace import Order, OrderItem, Product
from models.user import User
from schemas.marketplace import OrderCreate, OrderResponse
from typing import Optional, List

def create_order(db: Session, user_id: Optional[int], session_id: Optional[str], order: OrderCreate) -> Order:
    total_amount = 0
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        total_amount += product.price * item.quantity

    db_order = Order(user_id=user_id, session_id=session_id, total_amount=total_amount)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        db_order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price,
            product_name=product.name,
            is_digital=product.is_digital,
            file_path=product.file_path if product.is_digital else None
        )
        db.add(db_order_item)
    db.commit()

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user.credits < total_amount:
            raise HTTPException(status_code=400, detail="Créditos insuficientes")
        user.credits -= total_amount
        db_order.status = "completed"
        db.commit()

    return db_order

def get_orders(db: Session, user_id: Optional[int], session_id: Optional[str]) -> List[Order]:
    query = db.query(Order)
    if user_id:
        query = query.filter(Order.user_id == user_id)
    elif session_id:
        query = query.filter(Order.session_id == session_id)
    return query.all()