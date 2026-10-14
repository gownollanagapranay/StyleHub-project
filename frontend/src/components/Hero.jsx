
import React from "react";

export default function Hero({ onShopClick = () => {} }) {
  return (
    <section className="hero" id="collections">
      <div className="hero-content">
        <p className="eyebrow">THE NEW SEASON IS HERE</p>

        <h1>
          Style that
          <br />
          speaks <em>you.</em>
        </h1>

        <p className="hero-description">
          Discover everyday essentials and timeless pieces
          made for your own kind of style.
        </p>

        <button className="primary-button" onClick={onShopClick}>
          Explore collection <span>↗</span>
        </button>

        <div className="hero-note">
          <span className="hero-dot" />
          New arrivals are waiting for you
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85"
          alt="Fashion collection"
        />
        <div className="image-label">
          <span>STYLE EDIT / 01</span>
          <strong>Everyday, elevated.</strong>
        </div>
        <div className="floating-label">
          NEW
          <br />
          SEASON
        </div>
      </div>
    </section>
  );
}
