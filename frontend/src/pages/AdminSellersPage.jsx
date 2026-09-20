import { useEffect, useState } from "react";
import {
    Users,
    Store,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";

function AdminSellersPage() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/sellers");

            setSellers(response.data.sellers || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load sellers."
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

                <p>Loading sellers...</p>
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
                    <h1>Sellers</h1>

                    <p>
                        Manage sellers registered on ZaySai
                    </p>
                </div>

                <div className="admin-page-count">
                    <Users size={17} />

                    <span>
                        {sellers.length} Sellers
                    </span>
                </div>
            </div>

            {/* Sellers Table */}
            <div className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>All Sellers</h2>

                        <p>
                            Seller accounts and their stores
                        </p>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Seller</th>
                                <th>Email</th>
                                <th>Store</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>

                        <tbody>

                            {sellers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="admin-empty"
                                    >
                                        No sellers found.
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller) => (
                                    <tr key={seller.id}>

                                        {/* Seller */}
                                        <td>
                                            <div className="admin-seller-cell">

                                                <div className="admin-seller-avatar">
                                                    {seller.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "S"}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {seller.name}
                                                    </strong>

                                                    <span>
                                                        ID #{seller.id}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>
                                            {seller.email || "-"}
                                        </td>

                                        {/* Store */}
                                        <td>
                                            {seller.store ? (
                                                <div className="admin-store-cell">

                                                    <Store
                                                        size={16}
                                                    />

                                                    <div>
                                                        <strong>
                                                            {
                                                                seller
                                                                    .store
                                                                    .name
                                                            }
                                                        </strong>

                                                        <span>
                                                            /
                                                            {
                                                                seller
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

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`admin-seller-status ${seller.is_active
                                                        ? "active"
                                                        : "inactive"
                                                    }`}
                                            >
                                                {seller.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td>
                                            {formatDate(
                                                seller.created_at
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

export default AdminSellersPage;