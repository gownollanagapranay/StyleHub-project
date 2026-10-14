from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
from datetime import *


class User(Base):
    __tablename__ = "users"   

    id = Column(Integer,primary_key=True,index=True)
    email = Column(String,unique=True,index=True,nullable=False)
    password_hash = Column(String,nullable=False)
    

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    stock = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,nullable=False)
    product_id = Column(Integer,nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)    
    status = Column(String,nullable=False,default="pending")
    created_at = Column(DateTime, default=datetime.now(timezone.utc),nullable=False) 
    payment_intent_id = Column(String, nullable=True, unique=True)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True,index=True)
    order_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    subtotal = Column(Float, nullable=False)

    