import "./Checkout.css";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/* ─── Payment sub-form (rendered inside Stripe Elements) ─── */
function PaymentForm({ token, order, clientSecret, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handlePayment(event) {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please try again.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (result.error) throw new Error(result.error.message);

      const paymentIntent = result.paymentIntent;
      if (!paymentIntent) {
        throw new Error(
          "Payment status is not available. Check your Stripe Dashboard."
        );
      }

      if (paymentIntent.status !== "succeeded") {
        setMessage(`Payment status: ${paymentIntent.status}.`);
        return;
      }

      const verificationResponse = await fetch(
        `http://127.0.0.1:8000/orders/${order.id}/verify-payment?payment_intent_id=${encodeURIComponent(paymentIntent.id)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const verificationData = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(
          typeof verificationData.detail === "string"
            ? verificationData.detail
            : "Payment verification failed."
        );
      }

      if (verificationData.status === "paid") {
        setMessage("Payment successful! Your order is confirmed.");
        onPaid();
      } else {
        setMessage(verificationData.message || "Payment is not completed.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePayment} className="payment-form-wrapper">
      <div>
        <h3 className="payment-form-heading">
          <span className="payment-lock-icon">🔒</span>
          Secure Payment
        </h3>
        <p className="payment-secure-note">
          Your payment details are encrypted and never stored.
        </p>
      </div>

      <div className="payment-stripe-element">
        <PaymentElement />
      </div>

      {error && <p className="payment-error">{error}</p>}
      {message && <p className="payment-status-msg">{message}</p>}

      <button
        type="submit"
        className="payment-submit-btn"
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}

/* ─── Main Checkout component ─────────────────────── */
function Checkout({ token, onCartUpdated }) {
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    setError("");
    setOrder(null);
    setClientSecret("");
    setPaid(false);

    try {
      // Step 1 — create order from cart
      const orderResponse = await fetch(
        "http://127.0.0.1:8000/orders/checkout",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          typeof orderData.detail === "string"
            ? orderData.detail
            : "Unable to create order."
        );
      }

      setOrder(orderData);
      onCartUpdated();

      // Step 2 — create Stripe PaymentIntent
      const paymentResponse = await fetch(
        `http://127.0.0.1:8000/orders/${orderData.id}/payment`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          typeof paymentData.detail === "string"
            ? paymentData.detail
            : "Unable to start payment."
        );
      }

      if (!paymentData.client_secret) {
        throw new Error("Stripe did not return a client secret.");
      }

      setClientSecret(paymentData.client_secret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePaid() {
    setPaid(true);
    onCartUpdated();
  }

  return (
    <section className="checkout-container">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <p>Review your order and complete your payment securely.</p>
      </div>

      {!token && (
        <div className="checkout-message">
          Please log in to continue with checkout.
        </div>
      )}

      {error && (
        <div className="checkout-error" role="alert">
          {error}
        </div>
      )}

      {/* Pre-order CTA */}
      {!order && (
        <div className="checkout-place-card">
          <h3>Ready to place your order?</h3>
          <p>
            Your order will be created using the items currently in your cart.
            You'll be taken to a secure payment form right after.
          </p>

          <button
            className="checkout-button"
            type="button"
            onClick={handleCheckout}
            disabled={loading || !token}
          >
            {loading ? "Creating order…" : "Place Order →"}
          </button>
        </div>
      )}

      {/* Order Summary */}
      {order && (
        <div className="checkout-summary-card">
          {/* Card header */}
          <div className="checkout-order-header">
            <div className="checkout-order-id-block">
              <h3>Order Summary</h3>
              <p>Order #{order.id}</p>
            </div>

            <span
              className={`checkout-status${paid ? " checkout-status-paid" : ""}`}
            >
              {paid ? "✓ Paid" : order.status || "Pending"}
            </span>
          </div>

          {/* Item rows */}
          {order.items?.length > 0 && (
            <div className="checkout-items">
              <p className="checkout-items-label">Items</p>
              {order.items.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-left">
                    <strong>{item.product_name}</strong>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <span className="checkout-item-price">
                    ₹{Number(item.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="checkout-total">
            <span className="checkout-total-label">Total Amount</span>
            <span className="checkout-total-value">
              ₹{Number(order.total_amount || 0).toFixed(2)}
            </span>
          </div>

          {/* Payment form */}
          {!paid && clientSecret && (
            <div className="checkout-payment">
              {stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    token={token}
                    order={order}
                    clientSecret={clientSecret}
                    onPaid={handlePaid}
                  />
                </Elements>
              ) : (
                <p className="stripe-missing-warning">
                  ⚠ Stripe publishable key is missing. Check{" "}
                  <code>frontend/.env</code> and restart Vite.
                </p>
              )}
            </div>
          )}

          {/* Success state */}
          {paid && (
            <div className="checkout-success">
              <span className="checkout-success-icon">🎉</span>
              <strong>Payment Successful!</strong>
              <span>Your order has been confirmed and payment verified.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Checkout;
