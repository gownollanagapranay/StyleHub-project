
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ProductList({ token, onCartUpdated }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);

        const query = params.toString();
        const url = query
          ? `${API_URL}/products/?${query}`
          : `${API_URL}/products/`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load products.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [search, category]);

  async function addToCart(productId) {
    setMessage("");
    setError("");

    if (!token) {
      setError("Please log in to add products to your cart.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to add product."
        );
      }

      setMessage("Product added to your cart.");

      if (onCartUpdated) {
        onCartUpdated();
      }
    } catch (err) {
      setError(err.message || "Unable to add product.");
    }
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setMessage("");
    setError("");
  }

  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort();


  const productImages = {
  "Black T-Shirt": "/products/Black T-shirt.jpg",
  "Jeans": "/products/jeans.jpg",
  "Red Shirt": "/products/Red Shirt.jpg",
};

  return (
    <section className="products-section">
      <div className="products-heading">
        <div>
          <h2>Our Products</h2>
          <p>Find something you love.</p>
        </div>
        {!loading && !error && (
          <span className="product-count">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        )}
      </div>

      <div className="product-filters">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="clear-filter-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {error && <p className="product-alert error-message">{error}</p>}
      {message && (
        <p className="product-alert success-message">{message}</p>
      )}

      {loading ? (
        <p className="product-status">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <h3>No products found</h3>
          <p>Try a different search or clear your filters.</p>
          <button type="button" onClick={clearFilters}>
            Show All Products
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              
            <div className="product-image-container">
              <img
               src={productImages[product.name]}
               alt={product.name}
               className="product-image"
               onError={(event) => {
              event.currentTarget.style.display = "none";
              }}
             />
           </div>

              <div className="product-card-top">
                <span className="product-category">
                  {product.category || "General"}
                </span>

                <span
                  className={`product-stock ${
                    product.stock > 0 ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {product.stock > 0 ? "In stock" : "Sold out"}
                </span>
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-description">
                  {product.description || "A great addition to your style."}
                </p>

                <p className="product-stock-count">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Currently unavailable"}
                </p>
              </div>

              <div className="product-card-bottom">
                <span className="product-price">
                  ₹{Number(product.price).toFixed(2)}
                </span>

                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock < 1}
                >
                  {product.stock < 1 ? "Unavailable" : "Add to Cart"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
