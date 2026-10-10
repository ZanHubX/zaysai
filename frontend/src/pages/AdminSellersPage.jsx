import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Store,
    LoaderCircle,
    ChevronRight,
} from "lucide-react";
import api from "../services/api";

function AdminSellersPage() {
    const navigate = useNavigate();

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
            console.error("Sellers loading error:", err);

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

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleSellerClick = (sellerId) => {
        navigate(`/admin/sellers/${sellerId}`);
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-loading">
                    <LoaderCircle
                        size={24}
                        className="admin-loading-icon"
                    />
                    Loading sellers...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">

            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Sellers</h1>

                    <p>
                        Manage sellers registered on ZaySai
                    </p>
                </div>

                <div className="admin-page-count">
                    <Users size={17} />
                    {sellers.length} Sellers
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-card">
                    {error}
                </div>
            )}

            {/* Sellers Card */}
            <div className="admin-card admin-sellers-list-card">

                <div className="admin-card-header">
                    <div>
                        <h2>All Sellers</h2>

                        <p>
                            Seller accounts and their stores
                        </p>
                    </div>
                </div>

                {sellers.length === 0 ? (
                    <div className="admin-empty-state">
                        No sellers found.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table admin-sellers-table">

                            <thead>
                                <tr>
                                    <th>Seller</th>
                                    <th>Email</th>
                                    <th>Store</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {sellers.map((seller) => (

                                    <tr
                                        key={seller.id}
                                        className="admin-seller-row-clickable"
                                        onClick={() =>
                                            handleSellerClick(
                                                seller.id
                                            )
                                        }
                                    >

                                        {/* Seller */}
                                        <td>
                                            <div className="admin-seller-table-info">

                                                <div className="admin-seller-table-avatar">
                                                    {seller.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        "S"}
                                                </div>

                                                <div>
                                                    <div className="admin-table-primary">
                                                        {seller.name}
                                                    </div>

                                                    <div className="admin-table-secondary">
                                                        Seller ID #{seller.id}
                                                    </div>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>
                                            <span className="admin-seller-email">
                                                {seller.email}
                                            </span>
                                        </td>

                                        {/* Store */}
                                        <td>
                                            {seller.store ? (
                                                <div className="admin-seller-store-info">

                                                    <Store size={15} />

                                                    <div>
                                                        <div className="admin-table-primary">
                                                            {
                                                                seller
                                                                    .store
                                                                    .name
                                                            }
                                                        </div>

                                                        <div className="admin-table-secondary">
                                                            /
                                                            {
                                                                seller
                                                                    .store
                                                                    .slug
                                                            }
                                                        </div>
                                                    </div>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={
                                                    seller.is_active
                                                        ? "admin-seller-status active"
                                                        : "admin-seller-status inactive"
                                                }
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

                                        {/* Arrow */}
                                        <td>
                                            <div className="admin-seller-view-icon">
                                                <ChevronRight
                                                    size={18}
                                                />
                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>
        </div>
    );
}

export default AdminSellersPage;