
import { useCallback, useEffect, useState } from "react";
import "./cart.css";

const API_URL = "http://127.0.0.1:8000";

function Cart({ token, refreshKey, onCartCountChange }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [], total: 0 });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load cart.");
      }

      setCart(data);
      onCartCountChange?.(data.items?.length || 0);
    } catch (err) {
      setError(err.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, [token, onCartCountChange]);

  useEffect(() => {
    loadCart();
  }, [loadCart, refreshKey]);

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    setError("");

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update quantity.");
      }

      await loadCart();
    } catch (err) {
      setError(err.message || "Failed to update quantity.");
    }
  }

  async function removeItem(itemId) {
    setError("");

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to remove item.");
      }

      await loadCart();
    } catch (err) {
      setError(err.message || "Failed to remove item.");
    }
  }

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

  if (!token) {
    return (
      <section className="cart-container">
        <div className="cart-heading">
          <h2>Shopping Cart</h2>
        </div>
        <div className="cart-empty">
          <span className="cart-empty-icon">🛍️</span>
          <p>Please log in to view your cart.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-container">
      <div className="cart-heading">
        <h2>Shopping Cart</h2>
        {cart.items.length > 0 && (
          <span className="cart-count-badge">{cart.items.length}</span>
        )}
      </div>

      {error && <p className="cart-error">{error}</p>}

      {loading ? (
        <div className="cart-loading">
          <span className="cart-spinner" />
          Loading your cart…
        </div>
      ) : cart.items.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <strong>Your cart is empty</strong>
          <p>Add some items from the collection above.</p>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.items.map((item) => (
              <div className="cart-row" key={item.id}>
                {/* Icon */}
                <div className="cart-item-icon">👕</div>

                {/* Info */}
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">Unit: {formatPrice(item.price)}</p>
                  <p className="cart-item-subtotal">{formatPrice(item.subtotal)}</p>
                </div>

                {/* Controls */}
                <div className="cart-item-actions">
                  <div className="qty-wrapper">
                    <button
                      className="qty-btn"
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>

                    <input
                      id={`quantity-${item.id}`}
                      className="qty-input"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (Number.isInteger(val) && val >= 1) {
                          updateQuantity(item.id, val);
                        }
                      }}
                    />

                    <button
                      className="qty-btn"
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <span className="cart-total-label">Order Total</span>
            <span className="cart-total-value">{formatPrice(cart.total)}</span>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
