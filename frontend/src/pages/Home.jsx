
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";

const categories = ["All", "Men", "Women", "Accessories", "Clothing"];

export default function Home({
  products = [],
  loading = false,
  cartCount = 0,
  searchTerm = "",
  onSearchChange = () => {},
  selectedCategory = "All",
  onCategoryChange = () => {},
  onAddToCart = () => {},
  onCartClick = () => {},
  onLoginClick = () => {},
  onHomeClick = () => {},
}) {
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="storefront">
      <div className="announcement">
        YOUR STYLE, YOUR RULES &nbsp;·&nbsp; DISCOVER THE LATEST COLLECTION
      </div>

      <Navbar
        cartCount={cartCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onCartClick={onCartClick}
        onLoginClick={onLoginClick}
        onHomeClick={onHomeClick}
      />

      <main>
        <Hero
          onShopClick={() =>
            document.getElementById("trending")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        />

        <section className="category-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR LOOK</p>
              <h2>Shop by category</h2>
            </div>
            <span className="muted-text">Made for every day.</span>
          </div>

          <div className="category-pills">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "category-pill active"
                    : "category-pill"
                }
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="products-section" id="trending">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURATED FOR YOU</p>
              <h2>Trending now<span className="heading-period">.</span></h2>
            </div>
            <span className="muted-text">
              {filteredProducts.length} products
            </span>
          </div>

          {loading ? (
            <p className="empty-state">Loading your collection...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="empty-state">
              No products found. Try another search or category.
            </p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        <section className="bottom-banner">
          <p className="eyebrow">LESS BUT BETTER</p>
          <h2>Good style never tries too hard.</h2>
          <p>Find pieces you will want to wear again and again.</p>
        </section>
      </main>

      <footer className="site-footer">
        <span className="brand">style<span>hub.</span></span>
        <p>Find your fit. Own your style.</p>
        <span>© {new Date().getFullYear()} StyleHub</span>
      </footer>
    </div>
  );
}
