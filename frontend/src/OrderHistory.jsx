
import { useEffect, useState } from "react";
import "./OrderHistory.css";

const API_URL = "http://127.0.0.1:8000";

/* Map status string → CSS modifier class */
function statusClass(status = "") {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "paid";
  if (s === "cancelled" || s === "failed") return "cancelled";
  if (s === "processing") return "processing";
  return "pending";
}

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [spinning, setSpinning] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    setSpinning(true);

    try {
      const response = await fetch(`${API_URL}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Unable to load orders (${response.status})`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 400);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="order-history">
      <div className="order-history-heading">
        <h2>My Orders</h2>
        <button
          className="orders-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          <span className={`refresh-icon${spinning ? " spin" : ""}`}>↻</span>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="orders-loading">
          <span className="orders-spinner" />
          Loading your orders…
        </div>
      ) : error ? (
        <div className="orders-error-box">
          <p>{error}</p>
          <button className="orders-retry-btn" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <span className="orders-empty-icon">📦</span>
          <strong>No orders yet</strong>
          <p>Once you place an order it will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              {/* Header */}
              <div className="order-card-header">
                <div className="order-card-meta">
                  <h3 className="order-id">Order #{order.id}</h3>
                  <span className="order-date">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Date not available"}
                  </span>
                </div>

                <span
                  className={`order-status-badge ${statusClass(order.status)}`}
                >
                  {order.status || "Pending"}
                </span>
              </div>

              {/* Body — item list */}
              <div className="order-card-body">
                <p className="order-items-label">Items</p>

                {order.items?.length ? (
                  <ul className="order-items-list">
                    {order.items.map((item) => (
                      <li className="order-item-row" key={item.id}>
                        <span className="order-item-name">
                          {item.product_name}
                        </span>
                        <span className="order-item-qty">× {item.quantity}</span>
                        <span className="order-item-price">
                          ₹{Number(item.subtotal).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="order-no-items">No item details available.</p>
                )}
              </div>

              {/* Footer — total */}
              <div className="order-card-footer">
                <span className="order-total-label">Total</span>
                <span className="order-total-value">
                  ₹{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
