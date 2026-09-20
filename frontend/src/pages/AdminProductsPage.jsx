import { useEffect, useState } from "react";
import {
    Package,
    Store,
    User,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";

function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/products");

            setProducts(response.data.products || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString()} MMK`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <LoaderCircle
                    size={32}
                    className="admin-loading-icon"
                />

                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-error">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* Header */}
            <div className="admin-dashboard-header">
                <div>
                    <h1>Products</h1>

                    <p>
                        Manage products across the ZaySai platform
                    </p>
                </div>

                <div className="admin-page-count">
                    <Package size={17} />

                    <span>
                        {products.length} Products
                    </span>
                </div>
            </div>

            {/* Products Table */}
            <div className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>All Products</h2>

                        <p>
                            Products from all sellers and stores
                        </p>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Store</th>
                                <th>Seller</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>

                        <tbody>

                            {products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="admin-empty"
                                    >
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>

                                        {/* Product */}
                                        <td>
                                            <div className="admin-product-cell">

                                                <div className="admin-product-avatar">
                                                    <Package
                                                        size={17}
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {product.name}
                                                    </strong>

                                                    <span>
                                                        /{product.slug}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Store */}
                                        <td>
                                            {product.store ? (
                                                <div className="admin-store-cell">

                                                    <Store
                                                        size={16}
                                                    />

                                                    <div>
                                                        <strong>
                                                            {
                                                                product
                                                                    .store
                                                                    .name
                                                            }
                                                        </strong>

                                                        <span>
                                                            /
                                                            {
                                                                product
                                                                    .store
                                                                    .slug
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        {/* Seller */}
                                        <td>
                                            {product.seller ? (
                                                <div className="admin-owner-cell">

                                                    <div className="admin-inline-icon">
                                                        <User
                                                            size={14}
                                                        />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                product
                                                                    .seller
                                                                    .name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                product
                                                                    .seller
                                                                    .email
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td>
                                            <strong>
                                                {formatMoney(
                                                    product.price
                                                )}
                                            </strong>
                                        </td>

                                        {/* Stock */}
                                        <td>
                                            {product.stock ?? "-"}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`admin-product-status ${product.status ||
                                                    "active"
                                                    }`}
                                            >
                                                {product.status ||
                                                    "active"}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td>
                                            {formatDate(
                                                product.created_at
                                            )}
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>
                </div>
            </div>

        </div>
    );
}

export default AdminProductsPage;