import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./StorefrontPage.css";

function StorefrontPage() {
  const { slug } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStorefront = async () => {
      try {
        setLoading(true);

        const [storeResponse, productsResponse] = await Promise.all([
          api.get(`/stores/${slug}`),
          api.get(`/stores/${slug}/products`),
        ]);

        setStore(storeResponse.data.store);
        setProducts(productsResponse.data.products.data);
      } catch (err) {
        console.error(err);
        setError("Store not found.");
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [slug]);

  if (loading) {
    return <div className="store-message">Loading store...</div>;
  }

  if (error) {
    return <div className="store-message">{error}</div>;
  }

  return (
    <div className="storefront">
      <header className="store-header">
        <div>
          <h1>{store.name}</h1>
          <p>{store.description}</p>
        </div>

        <span className="powered">Powered by ZaySai</span>
      </header>

      <section className="products-section">
        <h2>Products</h2>

        {products.length === 0 ? (
          <p>No products available yet.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>

                <div className="product-content">
                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.description || "No description available."}
                  </p>

                  <strong className="product-price">
                    {Number(product.price).toLocaleString()} {product.currency}
                  </strong>

                  <Link
                    to={`/${slug}/products/${product.slug}`}
                    className="product-button"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StorefrontPage;