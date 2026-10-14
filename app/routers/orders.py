from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from ..services.stripe_service import create_payment_intent, retrieve_payment_intent

import stripe
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# checkout endpoint

@router.post("/checkout", response_model=schemas.OrderResponse)
def checkout(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # 1. Get the logged-in user's cart
        cart_items = db.query(models.CartItem).filter(
            models.CartItem.user_id == current_user.id
        ).all()

        if not cart_items:
            raise HTTPException(
                status_code=400,
                detail="Cart is empty"
            )

        total_amount = 0
        order_items_data = []

        # 2. Validate every product before changing stock
        for cart_item in cart_items:
            product = db.query(models.Product).filter(
                models.Product.id == cart_item.product_id
            ).first()

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product not found for cart item {cart_item.id}"
                )

            if cart_item.quantity < 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cart quantity must be at least 1"
                )

            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for {product.name}"
                )

            # Calculate the amount using the database price
            subtotal = product.price * cart_item.quantity
            total_amount += subtotal

            order_items_data.append({
                "product": product,
                "product_id": product.id,
                "product_name": product.name,
                "price": product.price,
                "quantity": cart_item.quantity,
                "subtotal": subtotal
            })

        # 3. Create the order, but do not commit yet
        order = models.Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="pending"
        )

        db.add(order)
        db.flush()  # Assigns order.id without committing

        # 4. Create order items and update stock
        for item in order_items_data:
            order_item = models.OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                product_name=item["product_name"],
                price=item["price"],
                quantity=item["quantity"],
                subtotal=item["subtotal"]
            )

            db.add(order_item)

            # Reduce stock within the same transaction
            item["product"].stock -= item["quantity"]

        # 5. Clear the user's cart
        for cart_item in cart_items:
            db.delete(cart_item)

        # 6. Save everything together
        db.commit()
        db.refresh(order)

        # 7. Fetch the saved order items
        order_items = db.query(models.OrderItem).filter(
            models.OrderItem.order_id == order.id
        ).all()

        return {
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": order_items
        }

    except Exception:
        # Undo all uncommitted changes if anything fails
        db.rollback()
        raise

    
# displaying user's order details      
@router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):
    
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id).all()

    result = []

    for order in orders:

        order_items = db.query(
            models.OrderItem
        ).filter(
            models.OrderItem.order_id == order.id).all()

        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": order_items
        })

    return result


# displaying order details by ID      

@router.get("/{order_id}",response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):

    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order_items = db.query(
        models.OrderItem
    ).filter(
        models.OrderItem.order_id == order.id).all()

    return {
        "id": order.id,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": order_items
    }
    

# payment endpoint

@router.post("/{order_id}/payment")

@router.post("/{order_id}/payment")
def create_order_payment(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Order is already paid"
        )

    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Order is not eligible for payment"
        )

    amount_in_paise = int(round(order.total_amount * 100))

    if amount_in_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid order amount"
        )

    try:
        # Reuse the PaymentIntent saved for this order
        if order.payment_intent_id:
            payment_intent = retrieve_payment_intent(
                order.payment_intent_id
            )

            # Do not attempt to pay using a canceled intent
            if payment_intent.status == "canceled":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "This payment attempt was canceled. "
                        "Please create a new order."
                    )
                )

        else:
            # Create a new PaymentIntent only when needed
            payment_intent = create_payment_intent(
                amount=amount_in_paise,
                order_id=order.id
            )

            # Associate the PaymentIntent with this order
            order.payment_intent_id = payment_intent.id

            db.commit()
            db.refresh(order)

        # Validate the retrieved or newly created intent
        metadata = (
         payment_intent.metadata.to_dict()
        if payment_intent.metadata
        else {}
        )

        stripe_order_id = metadata.get("order_id")

        if stripe_order_id != str(order.id):
          raise HTTPException(
          status_code=400,
          detail="Payment does not match this order."
        )



        if payment_intent.currency.lower() != "inr":
            raise HTTPException(
                status_code=400,
                detail="Invalid payment currency"
            )

        if payment_intent.amount != amount_in_paise:
            raise HTTPException(
                status_code=400,
                detail="Payment amount does not match order amount"
            )

        return {
            "order_id": order.id,
            "amount": payment_intent.amount,
            "currency": payment_intent.currency,
            "payment_intent_id": payment_intent.id,
            "client_secret": payment_intent.client_secret
        }

    except HTTPException:
        raise

    except stripe.StripeError:
        raise HTTPException(
            status_code=502,
            detail="Payment service is temporarily unavailable"
        )

    except Exception:
      db.rollback()
      logger.exception("Payment creation failed")
      raise HTTPException(
        status_code=500,
        detail="Unable to create or retrieve payment details. Check backend terminal."
    )


# Verifying payment information


@router.post("/{order_id}/verify-payment")
def verify_order_payment(
    order_id: int,
    payment_intent_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status == "paid":
        return {
            "message": "Order is already paid",
            "order_id": order.id,
            "status": order.status
        }

    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Order is not eligible for payment verification"
        )

    # Require a PaymentIntent saved against this order
    if not order.payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="No payment has been initiated for this order"
        )

    # Compare the submitted ID with the stored ID
    if payment_intent_id != order.payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="PaymentIntent does not match this order"
        )

    # Retrieve the authoritative payment status from Stripe
    try:
        payment_intent = retrieve_payment_intent(
            order.payment_intent_id
        )
    except stripe.StripeError:
        raise HTTPException(
            status_code=502,
            detail="Unable to verify payment with Stripe"
        )

    # Check order association
   
    metadata = (
    payment_intent.metadata.to_dict()
    if payment_intent.metadata
    else {}
    )

    stripe_order_id = metadata.get("order_id")

    if stripe_order_id != str(order.id):
        raise HTTPException(
        status_code=400,
        detail="Payment does not match this order."
    )

    # Check currency
    if payment_intent.currency.lower() != "inr":
        raise HTTPException(
            status_code=400,
            detail="Invalid payment currency"
        )

    # Check amount
    expected_amount = int(round(order.total_amount * 100))

    if payment_intent.amount != expected_amount:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match order amount"
        )

    # Never mark an incomplete payment as paid
    if payment_intent.status != "succeeded":
        return {
            "message": "Payment not completed",
            "payment_status": payment_intent.status,
            "order_id": order.id,
            "status": order.status
        }

    # Persist the successful payment status
    try:
        order.status = "paid"
        db.commit()
        db.refresh(order)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update order payment status"
        )

    return {
        "message": "Payment successful",
        "order_id": order.id,
        "status": order.status
    }
