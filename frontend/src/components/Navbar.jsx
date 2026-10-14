
import React from "react";

export default function Navbar({
  cartCount = 0,
  searchTerm = "",
  onSearchChange = () => {},
  onCartClick = () => {},
  onHomeClick = () => {},
  onLoginClick = () => {},
}) {
  return (
    <header className="navbar">
      <button className="brand" onClick={onHomeClick}>
        style<span>hub.</span>
      </button>

      <nav className="nav-links">
        <button onClick={onHomeClick}>Home</button>
        <a href="#collections">Collections</a>
        <a href="#trending">Trending</a>
      </nav>

      <div className="nav-actions">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search styles..."
            aria-label="Search products"
          />
        </label>

        <button className="icon-button" onClick={onLoginClick} title="Account">
          ♙
        </button>

        <button
          className="icon-button cart-button"
          onClick={onCartClick}
          title="Shopping cart"
        >
          ♧
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
