import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  Search,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Package,
} from "lucide-react";

import api from "../services/api";

import "./StoreFrontPage.css";

function StoreFrontPage() {
  const { slug } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStorefront = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          storeResponse,
          productsResponse,
        ] = await Promise.all([
          api.get(`/stores/${slug}`),
          api.get(`/stores/${slug}/products`),
        ]);

        setStore(storeResponse.data.store);

        setProducts(
          productsResponse.data.products.data
        );
      } catch (err) {
        console.error(err);

        setError("Store not found.");
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [slug]);

  /*
  |--------------------------------------------------------------------------
  | Store Logo
  |--------------------------------------------------------------------------
  | Add a cache-busting version based on updated_at.
  | This makes sure the browser loads the latest uploaded logo.
  |--------------------------------------------------------------------------
  */

  const logoUrl = store?.logo
    ? `${store.logo}${store.logo.includes("?") ? "&" : "?"
    }v=${encodeURIComponent(
      store.updated_at || ""
    )}`
    : "";

  const filteredProducts = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.description,
        product.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [products, search]);

  if (loading) {
    return (
      <div className="storefront-loading">
        Loading store...
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="storefront-error">
        <Store size={36} />

        <h2>Store not found</h2>

        <p>
          This store may be unavailable or
          inactive.
        </p>
      </div>
    );
  }

  const publicStoreUrl = `/${slug}`;

  return (
    <div className="public-storefront">

      {/* =====================================================
                        TOP NAVBAR
                ===================================================== */}

      <nav className="storefront-nav">

        {/* Store Brand */}

        <Link
          to={`/${slug}`}
          className="store-brand"
        >
          <div className="store-brand-avatar">

            {logoUrl ? (
              <img
                src={logoUrl}
                alt={store.name}
              />
            ) : (
              <Store size={21} />
            )}

          </div>

          <div>
            <strong>
              {store.name}
            </strong>

            <span>
              Online Store
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}

        <div className="storefront-nav-actions">

          <Link
            to={`/${slug}`}
            className="storefront-nav-link"
          >
            <Store size={16} />

            <span>
              Store
            </span>
          </Link>

          <Link
            to="/track-order"
            state={{
              storeSlug: slug,
              storeName: store.name,
            }}
            className="storefront-track-link"
          >
            <Package size={16} />

            <span>
              Track Order
            </span>
          </Link>

        </div>

        {/* Powered By */}

        <div className="powered-brand">

          <span>
            Powered by
          </span>

          <img
            src="/zaysai-logo.png"
            alt="ZaySai"
          />

          <strong>
            ZaySai
          </strong>

        </div>

      </nav>

      {/* =====================================================
                        HERO
                ===================================================== */}

      <section className="storefront-hero">

        <div className="storefront-glow"></div>

        <div className="storefront-hero-content">

          <span className="storefront-kicker">
            WELCOME TO
          </span>

          <h1>
            {store.name}
          </h1>

          <p>
            {store.description ||
              "Browse products and order directly from this store."}
          </p>

          <div className="storefront-meta">

            <span>
              <Package size={15} />

              {products.length} Products
            </span>

            <span>
              <ShoppingBag size={15} />

              Direct Orders
            </span>

          </div>

          {/* Track Order Button */}

          <div className="storefront-hero-actions">

            <Link
              to="/track-order"
              state={{
                storeSlug: slug,
                storeName: store.name,
              }}
              className="storefront-hero-track-button"
            >
              <Package size={17} />

              Track My Order
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
                        MAIN
                ===================================================== */}

      <main className="storefront-content">

        <div className="storefront-section-header">

          <div>

            <span className="section-kicker">
              CATALOG
            </span>

            <h2>
              Explore Products
            </h2>

            <p>
              Find what you need from{" "}
              {store.name}.
            </p>

          </div>

          {/* Search */}

          <div className="storefront-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =================================================
                            EMPTY PRODUCTS
                    ================================================= */}

        {filteredProducts.length === 0 ? (

          <div className="storefront-empty">

            <Package size={36} />

            <h3>
              {search
                ? "No matching products"
                : "No products yet"}
            </h3>

            <p>
              {search
                ? "Try another search."
                : "This seller hasn't added products yet."}
            </p>

          </div>

        ) : (

          /* =============================================
             PRODUCT GRID
          ============================================= */

          <div className="storefront-product-grid">

            {filteredProducts.map(
              (product) => (

                <Link
                  key={product.id}
                  to={`/${slug}/products/${product.slug}`}
                  className="storefront-product-card"
                >

                  {/* Product Image */}

                  <div className="storefront-product-image">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                      />

                    ) : (

                      <div className="product-image-placeholder">

                        <Package
                          size={34}
                        />

                      </div>

                    )}

                    <span className="product-active-badge">
                      Available
                    </span>

                  </div>

                  {/* Product Body */}

                  <div className="storefront-product-body">

                    <div className="product-card-top">

                      <div>

                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <p>
                          {
                            product.description ||
                            "No description available."
                          }
                        </p>

                      </div>

                    </div>

                    {/* Product Bottom */}

                    <div className="product-card-bottom">

                      <div className="public-product-price">

                        <strong>
                          {Number(
                            product.price
                          ).toLocaleString()}
                        </strong>

                        <span>
                          {
                            product.currency
                          }
                        </span>

                      </div>

                      <div className="product-open-button">

                        <ArrowUpRight
                          size={17}
                        />

                      </div>

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

      </main>

      {/* =====================================================
                        FOOTER
                ===================================================== */}

      <footer className="storefront-footer">

        <div>

          <img
            src="/zaysai-logo.png"
            alt="ZaySai"
          />

          <span>
            Store powered by{" "}
            <strong>
              ZaySai
            </strong>
          </span>

        </div>

        <p>
          ©{" "}
          {new Date().getFullYear()}{" "}
          {store.name}
        </p>

      </footer>

    </div>
  );
}

export default StoreFrontPage;