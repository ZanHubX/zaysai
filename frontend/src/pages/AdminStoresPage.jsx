import { useEffect, useState } from "react";
import {
    Store,
    Package,
    ShoppingCart,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";

function AdminStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/stores");

            setStores(response.data.stores || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load stores."
            );
        } finally {
            setLoading(false);
        }
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

                <p>Loading stores...</p>
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
                    <h1>Stores</h1>

                    <p>
                        Manage stores across the ZaySai platform
                    </p>
                </div>

                <div className="admin-page-count">
                    <Store size={17} />

                    <span>
                        {stores.length} Stores
                    </span>
                </div>
            </div>

            {/* Stores Table */}
            <div className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>All Stores</h2>

                        <p>
                            Store information and platform activity
                        </p>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Owner</th>
                                <th>Products</th>
                                <th>Orders</th>
                                <th>Created</th>
                            </tr>
                        </thead>

                        <tbody>

                            {stores.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="admin-empty"
                                    >
                                        No stores found.
                                    </td>
                                </tr>
                            ) : (
                                stores.map((store) => (
                                    <tr key={store.id}>

                                        {/* Store */}
                                        <td>
                                            <div className="admin-store-cell">

                                                <div className="admin-store-avatar">
                                                    <Store
                                                        size={18}
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {store.name}
                                                    </strong>

                                                    <span>
                                                        /{store.slug}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Owner */}
                                        <td>
                                            {store.owner ? (
                                                <div className="admin-owner-cell">

                                                    <strong>
                                                        {
                                                            store
                                                                .owner
                                                                .name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            store
                                                                .owner
                                                                .email
                                                        }
                                                    </span>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        {/* Products */}
                                        <td>
                                            <div className="admin-number-cell">

                                                <Package
                                                    size={16}
                                                />

                                                <strong>
                                                    {
                                                        store.products_count
                                                    }
                                                </strong>

                                            </div>
                                        </td>

                                        {/* Orders */}
                                        <td>
                                            <div className="admin-number-cell">

                                                <ShoppingCart
                                                    size={16}
                                                />

                                                <strong>
                                                    {
                                                        store.orders_count
                                                    }
                                                </strong>

                                            </div>
                                        </td>

                                        {/* Created */}
                                        <td>
                                            {formatDate(
                                                store.created_at
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

export default AdminStoresPage;