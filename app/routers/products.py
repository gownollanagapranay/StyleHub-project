
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas import ProductCreate, ProductResponse
from ..models import Product


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# Get products with optional search and category filtering
@router.get("/", response_model=list[ProductResponse])
def get_products(
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)

    # Search by product name
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%")
        )

    # Filter by category
    if category:
        query = query.filter(
            models.Product.category.ilike(category)
        )

    products = query.all()

    return products


# Get a single product
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# Create a product
@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        stock=product.stock,
        image_url=product.image_url
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product



# Update a product
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    product.name = product_data.name
    product.description = product_data.description
    product.price = product_data.price
    product.category = product_data.category
    product.stock = product_data.stock
    product.image_url = product_data.image_url

    db.commit()
    db.refresh(product)

    return product



#Delete Product
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}