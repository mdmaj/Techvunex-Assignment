import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const initialForm = { name: "", description: "", price: "", image: "" };

export default function Admin() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setNotice("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    setError("");

    try {
      await api.post("/products", { ...form, price: Number(form.price) });
      setForm(initialForm);
      setNotice("Product added to the storefront.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <Link className="brand" to="/products">
          <span className="brand-mark">T</span>
          <span>Technuvex</span>
        </Link>
        <Link className="button button-dark" to="/products">
          View storefront
        </Link>
      </header>
      <main className="admin-main">
        <div className="admin-heading">
          <p className="eyebrow">Admin studio / inventory</p>
          <h1>Add a new product</h1>
          <p className="muted">
            Publish a product directly to the live Technuvex storefront.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <label className="field">
            Product name *
            <input
              className="field-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ceramic pour-over set"
              required
            />
          </label>
          <label className="field">
            Price *
            <span className="price-field">
              <span>₹</span>
              <input
                className="field-input"
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="1999"
                required
              />
            </span>
          </label>
          <label className="field">
            Description
            <textarea
              className="field-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="What makes this product special?"
            />
          </label>
          <label className="field">
            Product image URL *
            <input
              className="field-input"
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://images.example.com/product.jpg"
              required
            />
          </label>
          {form.image && (
            <div className="image-preview">
              <img
                className="preview-image"
                src={form.image}
                alt="Product preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          {notice && <p className="form-success">{notice}</p>}
          <button className="button button-dark button-wide" disabled={loading}>
            {loading ? "Publishing..." : "Publish product"}
          </button>
        </form>
      </main>
    </div>
  );
}
