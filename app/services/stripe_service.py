
import stripe

from ..stripe_config import STRIPE_SECRET_KEY

stripe.api_key = STRIPE_SECRET_KEY


def create_payment_intent(amount: int, order_id: int):
    return stripe.PaymentIntent.create(
        amount=amount,
        currency="inr",
        automatic_payment_methods={"enabled": True},
        metadata={"order_id": str(order_id)},
        idempotency_key=f"stylehub-order-{order_id}"
    )


def retrieve_payment_intent(payment_intent_id: str):
    return stripe.PaymentIntent.retrieve(payment_intent_id)
