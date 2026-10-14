from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)



# Add item to the cart  
@router.post("/", response_model=schemas.CartItemResponse)
def add_to_cart(
    cart_item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):
    
    # 1. Find the product
    product = db.query(models.Product).filter(
        models.Product.id == cart_item.product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # 2. Validate quantity
    if cart_item.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    # 3. Check stock availability
    if product.stock < cart_item.quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough stock available"
        )

    # 4. Check whether the product is already in the user's cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == cart_item.product_id).first()

    if existing_item:
        new_quantity = existing_item.quantity + cart_item.quantity

        # 5. Validate the combined quantity
        if new_quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail="Not enough stock available"
            )

        existing_item.quantity = new_quantity

        db.commit()
        db.refresh(existing_item)

        return existing_item

    # 6. Create a new cart item
    new_item = models.CartItem(
        user_id=current_user.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item



# get the items from cart and total amount 

@router.get("/", response_model=schemas.CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):
    
    cart_items = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id).all()

    items = []
    total = 0

    for item in cart_items:

        product = db.query(models.Product).filter(
            models.Product.id == item.product_id).first()

        if product is None:
            continue

        subtotal = product.price * item.quantity

        items.append({
            "id": item.id,
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": item.quantity,
            "subtotal": subtotal
        })

        total += subtotal

    return {
        "items": items,
        "total": total
    }
    
    
# update item in the cart  
    
@router.put("/{item_id}", response_model=schemas.CartItemResponse)
def update_cart_item(
    item_id: int,
    cart_update: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Find the cart item belonging to the logged-in user
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    # 2. Find the corresponding product
    product = db.query(models.Product).filter(
        models.Product.id == cart_item.product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # 3. Validate the requested quantity against stock
    if cart_update.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} units are available"
        )

    # 4. Update the cart quantity
    cart_item.quantity = cart_update.quantity

    # 5. Save the changes to the database
    db.commit()
    db.refresh(cart_item)

    return cart_item



# delete item from cart

@router.delete("/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Find the item belonging to the logged-in user
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    # Delete the item and save the 
    db.delete(cart_item)
    db.commit()

    return {"message": "Item removed from cart"}
                                      
                                      
