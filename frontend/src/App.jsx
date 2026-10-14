
import { useCallback, useEffect, useState } from "react";

import "./App.css";
import ProductList from "./ProductList";
import Register from "./Register";
import Login from "./Login";
import Cart from "./Cart";
import Checkout from "./Checkout";
import OrderHistory from "./OrderHistory";

function App() {
  const [page, setPage] = useState("login");

  const [token, setToken] = useState(
    () => localStorage.getItem("access_token") || ""
  );

  const [user, setUser] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [cartRefresh, setCartRefresh] = useState(0);

  const loadProfile = useCallback(async (accessToken) => {
    setCheckingProfile(true);
    setProfileError("");
    setUser(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session is invalid or expired. Please log in again."
            : `Unable to load profile (${response.status}).`
        );
      }

      const data = await response.json();

      setUser(data);
      setToken(accessToken);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setCheckingProfile(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");

    if (savedToken) {
      setToken(savedToken);
      loadProfile(savedToken);
    }
  }, [loadProfile]);

  function handleLoginSuccess(accessToken) {
    setToken(accessToken);
    loadProfile(accessToken);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");

    setToken("");
    setUser(null);
    setProfileError("");
    setCheckingProfile(false);
    setShowOrders(false);
    setPage("login");
    setCartRefresh((value) => value + 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCartUpdated() {
    setCartRefresh((value) => value + 1);
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="app">
      <div className="announcement-bar">
        STYLE THAT FEELS LIKE YOU
        <span>Discover your everyday essentials.</span>
      </div>

      <header className="site-header">
        <button
          className="brand-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          style<span>hub.</span>
        </button>

        <nav className="main-nav">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("products")}>
            Collections
          </button>
        </nav>
           
           
        
        <div className="header-actions">
          {token && user ? (
            <>
              <button
                className="header-action"
                onClick={() => {
                  setShowOrders(true);
                  setTimeout(() => scrollToSection("orders-panel"), 50);
                }}
              >
                <span className="action-icon">📦</span>
                <span>My Orders</span>
              </button>

              <button
                className="header-action"
                onClick={() => scrollToSection("account")}
              >
                <span className="action-icon"></span>
                <span> My Account</span>
              </button>

              <button
                className="header-action"
                onClick={() => scrollToSection("cart")}
              >
                <span className="action-icon"></span>
                <span>My Cart</span>
              </button>
            </>
          ) : (
            <button
              className="header-login"
              onClick={() => scrollToSection("account")}
            >
              Sign in <span>↗</span>
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">THE STYLEHUB COLLECTION</p>

            <h1>
              Everyday style.
              <br />
              <em>Extraordinary</em>
              <br />
              you.
            </h1>

            <p className="hero-description">
              Discover pieces that feel good, look effortless,
              and make every day a little more stylish.
            </p>

            <button
              className="primary-button"
              onClick={() => scrollToSection("products")}
            >
              Explore the collection <span>↗</span>
            </button>

            <div className="hero-footnote">
              <span className="footnote-dot" />
              Find something that feels like you.
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
              alt="Fashion collection inspiration"
            />

            <div className="hero-image-caption">
              <span>YOUR NEXT FAVOURITE LOOK</span>
              <strong>Wear your confidence.</strong>
            </div>

            <div className="hero-stamp">
              YOUR
              <br />
              STYLE
            </div>
          </div>
        </section>

        <section className="benefits-strip">
          <div>
            <span>✳</span>
            <p>Everyday essentials</p>
          </div>
          <div>
            <span>◇</span>
            <p>Simple, timeless style</p>
          </div>
          <div>
            <span>♡</span>
            <p>Made for your lifestyle</p>
          </div>
        </section>

        <section className="collection-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURATED FOR YOU</p>
              <h2>Find your next favourite<span>.</span></h2>
            </div>

            <p className="section-description">
              A little inspiration for your everyday wardrobe.
            </p>
          </div>

          <div className="product-list-container">
            <ProductList
              token={token}
              onCartUpdated={handleCartUpdated}
            />
          </div>
        </section>


        <section className="customer-section" id="account">
          <div className="section-heading customer-heading">
            <div>
              <p className="eyebrow">YOUR STYLEHUB</p>
              <h2>{token ? "Your account" : "Welcome to StyleHub"}</h2>
            </div>

            <p className="section-description">
              {token
                ? "Manage your account and shopping."
                : "Sign in or create an account to get started."}
            </p>
          </div>

          {!token ? (
            <div className="auth-layout">
              <div className="auth-intro">
                <p className="eyebrow">A BETTER WAY TO SHOP</p>
                <h3>Your style journey starts here.</h3>
                <p>
                  Sign in to access your cart, place orders, and
                  keep track of your purchases.
                </p>
              </div>

              <div className="auth-card">
                <div className="auth-switch">
                  <button
                    type="button"
                    className={page === "login" ? "active" : ""}
                    onClick={() => setPage("login")}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    className={page === "register" ? "active" : ""}
                    onClick={() => setPage("register")}
                  >
                    Register
                  </button>
                </div>

                {page === "login" ? (
                  <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                  <Register />
                )}
              </div>
            </div>
          ) : (
            <div className="account-card">
              {checkingProfile && (
                <p>Loading your profile...</p>
              )}

              {profileError && (
                <div className="error-message">
                  <p>{profileError}</p>
                  <button
                    className="outline-button"
                    onClick={handleLogout}
                  >
                    Return to login
                  </button>
                </div>
              )}

              {user && (
                <div className="account-details">
                  <div className="account-avatar">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="account-copy">
                    <p className="eyebrow">SIGNED IN AS</p>
                    <h3>{user.email}</h3>
                    <p>Customer ID: {user.id}</p>
                  </div>

                  <button
                    className="outline-button logout-button"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {token && user && (
          <section className="shopping-section" id="cart">
            <div className="section-heading">
            </div>

            {showOrders && (
              <div className="shopping-panel orders-panel" id="orders-panel">
                <OrderHistory token={token} />
              </div>
            )}

            <div className="shopping-cart-checkout-grid">
              <div className="shopping-panel cart-panel" id="cart-panel">
                <Cart token={token} refreshKey={cartRefresh} />
              </div>

              <div className="shopping-panel checkout-panel">
                <Checkout token={token} onCartUpdated={handleCartUpdated} />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <button
          className="brand-logo footer-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          style<span>hub.</span>
        </button>

        <p>Find your fit. Own your style.</p>

        <span>© {new Date().getFullYear()} StyleHub</span>
      </footer>
    </div>
  );
}

export default App;
