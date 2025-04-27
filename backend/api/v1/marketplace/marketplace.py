# backend/api/v1/marketplace.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.marketplace_service import (
    create_category, get_categories, update_category, delete_category,
    create_product, get_products, update_product, delete_product
)
from services.cart_service import add_to_cart, get_cart
from services.order_service import create_order, get_orders
from schemas.marketplace import (
    CategoryCreate, CategoryResponse, ProductCreate, ProductResponse,
    CartItemCreate, CartItemResponse, OrderCreate, OrderResponse
)
from dependencies.auth import get_user_context, UserContext
from typing import List

router = APIRouter(tags=["Marketplace"])

# Categorías
@router.post("/categories", response_model=CategoryResponse)
def create_category_route(category: CategoryCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_category(db, category)

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories_route(db: Session = Depends(get_db)):
    return get_categories(db)

@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category_route(category_id: int, category: CategoryCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_category(db, category_id, category)

@router.delete("/categories/{category_id}")
def delete_category_route(category_id: int, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_category(db, category_id)
    return {"message": "Categoría eliminada"}

# Productos
@router.post("/products", response_model=ProductResponse)
def create_product_route(product: ProductCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_product(db, product)

@router.get("/products", response_model=List[ProductResponse])
def get_products_route(db: Session = Depends(get_db)):
    return get_products(db)

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product_route(product_id: int, product: ProductCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_product(db, product_id, product)

@router.delete("/products/{product_id}")
def delete_product_route(product_id: int, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    if user_context.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_product(db, product_id)
    return {"message": "Producto eliminado"}

# Carrito
@router.post("/cart", response_model=CartItemResponse)
def add_to_cart_route(cart_item: CartItemCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    user_id = int(user_context.user_id) if user_context.user_type == "registered" else None
    session_id = user_context.session_id if user_context.user_type == "anonymous" else None
    return add_to_cart(db, user_id, session_id, cart_item)

@router.get("/cart", response_model=List[CartItemResponse])
def get_cart_route(db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    user_id = int(user_context.user_id) if user_context.user_type == "registered" else None
    session_id = user_context.session_id if user_context.user_type == "anonymous" else None
    return get_cart(db, user_id, session_id)

# Órdenes
@router.post("/orders", response_model=OrderResponse)
def create_order_route(order: OrderCreate, db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    user_id = int(user_context.user_id) if user_context.user_type == "registered" else None
    session_id = user_context.session_id if user_context.user_type == "anonymous" else None
    return create_order(db, user_id, session_id, order)

@router.get("/orders", response_model=List[OrderResponse])
def get_orders_route(db: Session = Depends(get_db), user_context: UserContext = Depends(get_user_context)):
    user_id = int(user_context.user_id) if user_context.user_type == "registered" else None
    session_id = user_context.session_id if user_context.user_type == "anonymous" else None
    return get_orders(db, user_id, session_id)