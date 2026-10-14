from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str = Field(min_length=3)
    description: str | None = None
    price: float = Field(gt=0)
    category: str
    stock: int = Field(ge=0)


class ProductCreate(ProductBase):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
     id: int
     name: str
     description: Optional[str] = None
     price: float
     category: str
     stock: int
     image_url: Optional[str] = None

     class Config:
        from_attributes = True
        
        
class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1)
    
    
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True
        


class CartItemDetail(BaseModel):
    id: int
    product_id: int
    name: str
    price: float
    quantity: int
    subtotal: float
    

class CartResponse(BaseModel):
    items: list[CartItemDetail]
    total: float
    
    
class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)
    
    
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True
        

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse]
