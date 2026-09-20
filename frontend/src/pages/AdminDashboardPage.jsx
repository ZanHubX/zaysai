import { useEffect, useState } from "react";
import {
    Users,
    Store,
    Package,
    ShoppingCart,
    DollarSign,
    Clock,
    LoaderCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import api from "../services/api";

function AdminDashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/dashboard");

            setDashboard(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <LoaderCircle size={32} className="admin-loading-icon" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-error">
                <XCircle size={22} />
                <span>{error}</span>
            </div>
        );
    }

    const stats = dashboard?.stats || {};
    const recentOrders = dashboard?.recent_orders || [];
    const topProducts = dashboard?.top_products || [];

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

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Overview of your ZaySai platform
                    </p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>Total Sellers</span>
                        <strong>
                            {stats.total_sellers || 0}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <Store size={22} />
                    </div>

                    <div>
                        <span>Total Stores</span>
                        <strong>
                            {stats.total_stores || 0}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <Package size={22} />
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>
                            {stats.total_products || 0}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <ShoppingCart size={22} />
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>
                            {stats.total_orders || 0}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card admin-stat-revenue">
                    <div className="admin-stat-icon">
                        <DollarSign size={22} />
                    </div>

                    <div>
                        <span>Total Revenue</span>
                        <strong>
                            {formatMoney(stats.total_revenue)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Order Status */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2>Order Overview</h2>
                        <p>Current order status across all stores</p>
                    </div>
                </div>

                <div className="admin-order-status-grid">
                    <div className="admin-status-card pending">
                        <Clock size={21} />
                        <span>Pending</span>
                        <strong>
                            {stats.pending_orders || 0}
                        </strong>
                    </div>

                    <div className="admin-status-card processing">
                        <LoaderCircle size={21} />
                        <span>Processing</span>
                        <strong>
                            {stats.processing_orders || 0}
                        </strong>
                    </div>

                    <div className="admin-status-card completed">
                        <CheckCircle size={21} />
                        <span>Completed</span>
                        <strong>
                            {stats.completed_orders || 0}
                        </strong>
                    </div>

                    <div className="admin-status-card cancelled">
                        <XCircle size={21} />
                        <span>Cancelled</span>
                        <strong>
                            {stats.cancelled_orders || 0}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Payment Overview */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2>Payment Overview</h2>
                        <p>Payment status across all orders</p>
                    </div>
                </div>

                <div className="admin-payment-grid">
                    <div className="admin-payment-card">
                        <span>Paid Orders</span>
                        <strong>
                            {stats.paid_orders || 0}
                        </strong>
                    </div>

                    <div className="admin-payment-card">
                        <span>Unpaid Orders</span>
                        <strong>
                            {stats.unpaid_orders || 0}
                        </strong>
                    </div>

                    <div className="admin-payment-card">
                        <span>Revenue</span>
                        <strong>
                            {formatMoney(stats.total_revenue)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2>Recent Orders</h2>
                        <p>Latest orders from all stores</p>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Store</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="admin-empty"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>
                                                {order.order_number}
                                            </strong>
                                        </td>

                                        <td>
                                            {order.store?.name || "-"}
                                        </td>

                                        <td>
                                            {order.customer_name || "-"}
                                        </td>

                                        <td>
                                            {formatMoney(order.total)}
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-order-badge ${order.status}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Products */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2>Top Products</h2>
                        <p>
                            Best performing products across the platform
                        </p>
                    </div>
                </div>

                <div className="admin-top-products">
                    {topProducts.length === 0 ? (
                        <div className="admin-empty-box">
                            No product sales yet.
                        </div>
                    ) : (
                        topProducts.map((product, index) => (
                            <div
                                className="admin-product-row"
                                key={`${product.product_id}-${index}`}
                            >
                                <div className="admin-product-rank">
                                    {index + 1}
                                </div>

                                <div className="admin-product-info">
                                    <strong>
                                        {product.product_name}
                                    </strong>

                                    <span>
                                        {product.total_quantity} sold
                                    </span>
                                </div>

                                <strong className="admin-product-revenue">
                                    {formatMoney(
                                        product.total_revenue
                                    )}
                                </strong>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;