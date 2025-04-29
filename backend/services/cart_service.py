# backend/services/cart_service.py
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException
from models.marketplace import CartItem, Product
from schemas.marketplace import CartItemCreate, CartItemResponse

def add_to_cart(db: Session, user_id: int | None, session_id: str | None, cart_item: CartItemCreate):
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if not product.is_free and not user_id:  # Restringir productos de pago a anónimos
        raise HTTPException(status_code=403, detail="Los usuarios anónimos solo pueden añadir productos gratuitos")
    
    db_item = CartItem(
        user_id=user_id,
        session_id=session_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_cart(db: Session, user_id: int | None, session_id: str | None):
    query = db.query(CartItem)
    if user_id:
        query = query.filter(CartItem.user_id == user_id)
    elif session_id:
        query = query.filter(CartItem.session_id == session_id)
    return query.all()