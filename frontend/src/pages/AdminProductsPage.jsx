import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Search,
    RefreshCw,
    Eye,
    LoaderCircle,
} from "lucide-react";
import api from "../services/api";

function AdminProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchProducts = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/admin/products");

            setProducts(response.data.products || []);
        } catch (err) {
            console.error("Admin products error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return true;
        }

        return (
            product.name?.toLowerCase().includes(keyword) ||
            product.slug?.toLowerCase().includes(keyword) ||
            product.store?.name?.toLowerCase().includes(keyword) ||
            product.seller?.name?.toLowerCase().includes(keyword) ||
            product.seller?.email?.toLowerCase().includes(keyword)
        );
    });

    const formatPrice = (price, currency = "MMK") => {
        const number = Number(price || 0);

        return `${number.toLocaleString()} ${currency}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "admin-status-badge active";

            case "inactive":
                return "admin-status-badge inactive";

            case "out_of_stock":
                return "admin-status-badge warning";

            default:
                return "admin-status-badge";
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/admin/products/${productId}`);
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Products</h1>
                    <p>
                        Manage and monitor all products across ZaySai
                        stores.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => fetchProducts(true)}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <LoaderCircle
                            size={17}
                            className="admin-loading-icon"
                        />
                    ) : (
                        <RefreshCw size={17} />
                    )}

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Stats */}
            <div className="admin-stat-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-card-icon">
                        <Package size={20} />
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>{products.length}</strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-card-icon">
                        <Package size={20} />
                    </div>

                    <div>
                        <span>Active Products</span>
                        <strong>
                            {
                                products.filter(
                                    (product) =>
                                        product.status === "active"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-card-icon">
                        <Package size={20} />
                    </div>

                    <div>
                        <span>Inactive Products</span>
                        <strong>
                            {
                                products.filter(
                                    (product) =>
                                        product.status !== "active"
                                ).length
                            }
                        </strong>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div>
                        <h2>All Products</h2>
                        <p>
                            {filteredProducts.length} product
                            {filteredProducts.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="admin-product-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search product, store, seller..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="admin-page-loading">
                        <LoaderCircle
                            size={24}
                            className="admin-loading-icon"
                        />
                        <span>Loading products...</span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="admin-error-card">
                        {error}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="admin-empty-state">
                            <Package size={34} />

                            <h3>
                                {search
                                    ? "No products found"
                                    : "No products yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search keyword."
                                    : "There are no products available yet."}
                            </p>
                        </div>
                    )}

                {/* Table */}
                {!loading &&
                    !error &&
                    filteredProducts.length > 0 && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Store</th>
                                        <th>Seller</th>
                                        <th>Price</th>
                                        
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map(
                                        (product) => (
                                            <tr
                                                key={product.id}
                                                className="admin-product-row-clickable"
                                                onClick={() =>
                                                    handleProductClick(
                                                        product.id
                                                    )
                                                }
                                            >
                                                <td>
                                                    <div className="admin-product-name">
                                                        <div className="admin-product-icon">
                                                            <Package
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    product.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                /
                                                                {
                                                                    product.slug
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-product-store">
                                                        <strong>
                                                            {product
                                                                .store
                                                                ?.name ||
                                                                "-"}
                                                        </strong>

                                                        <span>
                                                            {product
                                                                .store
                                                                ?.slug ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-product-seller">
                                                        <strong>
                                                            {product
                                                                .seller
                                                                ?.name ||
                                                                "-"}
                                                        </strong>

                                                        <span>
                                                            {product
                                                                .seller
                                                                ?.email ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatPrice(
                                                            product.price
                                                        )}
                                                    </strong>
                                                </td>

                                                

                                                <td>
                                                    <span
                                                        className={getStatusClass(
                                                            product.status
                                                        )}
                                                    >
                                                        {product.status ||
                                                            "Unknown"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        product.created_at
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="admin-product-view-icon">
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default AdminProductsPage;