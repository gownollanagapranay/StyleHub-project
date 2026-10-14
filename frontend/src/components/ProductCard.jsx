
import React from "react";

export default function ProductCard({ product, onAddToCart }) {
  const image =
    product.image_url ||
    product.image ||
    "https://placehold.co/600x750/f3f0eb/555555?text=StyleHub";

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={image}
          alt={product.name}
          loading="lazy"
        />

        <span className="product-tag">
          {product.category || "ESSENTIALS"}
        </span>

        <button
          className="quick-add"
          onClick={() => onAddToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          title="Add to cart"
        >
          +
        </button>
      </div>

      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category || "StyleHub Collection"}</p>
        </div>

        <strong>
          ₹{Number(product.price || 0).toLocaleString("en-IN")}
        </strong>
      </div>

      <button
        className="mobile-add-button"
        onClick={() => onAddToCart(product)}
      >
        Add to cart
      </button>
    </article>
  );
}
