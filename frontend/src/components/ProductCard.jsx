export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />

      <div className="product-card-body">
        <h2 className="product-title">{product.name}</h2>

        <p className="product-description">{product.description}</p>

        <div className="product-meta">
          <span className="product-price">₹{product.price}</span>

          <span className="product-badge">In stock</span>
        </div>
      </div>
    </article>
  );
}
