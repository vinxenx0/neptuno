# backend/services/cart_service.py
from sqlalchemy.orm import Session
from models.marketplace import CartItem
from schemas.marketplace import CartItemCreate
from typing import Optional

def add_to_cart(db: Session, user_id: Optional[int], session_id: Optional[str], cart_item: CartItemCreate):
    db_cart_item = CartItem(user_id=user_id, session_id=session_id, **cart_item.dict())
    db.add(db_cart_item)
    db.commit()
    db.refresh(db_cart_item)
    return db_cart_item

def get_cart(db: Session, user_id: Optional[int], session_id: Optional[str]):
    if user_id:
        return db.query(CartItem).filter(CartItem.user_id == user_id).all()
    elif session_id:
        return db.query(CartItem).filter(CartItem.session_id == session_id).all()
    return []