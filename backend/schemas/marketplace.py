# backend/schemas/marketplace.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    is_digital: bool = False
    file_path: Optional[str] = None
    subscription_duration: Optional[int] = None
    is_free: bool = False  # Añadido

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    class Config:
        orm_mode = True

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product_name: str
    is_digital: bool
    file_path: Optional[str] = None
    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    items: List[OrderItemBase]

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]
    class Config:
        orm_mode = True