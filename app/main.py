from fastapi import FastAPI

from .database import engine, Base
from . import models
from .routers import products
from .routers import auth
from .routers import cart
from .routers import orders

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="StyleHub API",
    description="Fashion Mini Store Backend",
    )

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(products.router)

app.include_router(auth.router)

app.include_router(cart.router)

app.include_router(orders.router)


@app.get("/")
def home():
    
    return {"message": "Welcome to StyleHub API"}