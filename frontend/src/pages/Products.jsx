import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((response) => setProducts(response.data))
      .catch(() => setError("We could not load the collection right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell storefront-page">
      <Navbar />
      <main className="storefront">
        <section className="store-hero">
          <div>
            <p className="eyebrow">Technuvex / collection 01</p>
            <h1>
              Useful objects.
              <br />
              <em>Beautifully chosen.</em>
            </h1>
            <p className="hero-copy">
              A calm edit of well-made things for the spaces and rituals that
              make up your day.
            </p>
          </div>
          <div className="hero-stamp">
            <span>EST.</span>
            <strong>2026</strong>
            <span>CURATED DAILY</span>
          </div>
        </section>
        <section className="collection-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Currently in the edit</h2>
          </div>
          <span>
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </span>
        </section>
        {loading && (
          <div className="empty-state">
            <span className="loader" />
            Loading the collection...
          </div>
        )}
        {error && <div className="empty-state form-error">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="empty-state">No products yet. Check back soon.</div>
        )}
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <footer className="store-footer">
          <span>Technuvex</span>
          <span>Small batch. Good design. Less noise.</span>
          <Link to="/">Sign in</Link>
        </footer>
      </main>
    </div>
  );
}
