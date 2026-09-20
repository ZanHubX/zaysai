import { useEffect, useState } from "react";
import {
    ShoppingCart,
    Store,
    User,
    Package,
    CreditCard,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/orders");

            setOrders(response.data.orders || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (value, currency = "MMK") => {
        return `${Number(value || 0).toLocaleString()} ${currency}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "pending";

            case "processing":
                return "processing";

            case "completed":
                return "completed";

            case "cancelled":
                return "cancelled";

            default:
                return "default";
        }
    };

    const getPaymentClass = (status) => {
        switch (status) {
            case "paid":
                return "paid";

            case "unpaid":
                return "unpaid";

            default:
                return "default";
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <LoaderCircle
                    size={32}
                    className="admin-loading-icon"
                />

                <p>Loading orders...</p>
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
                    <h1>Orders</h1>

                    <p>
                        Manage orders across the ZaySai platform
                    </p>
                </div>

                <div className="admin-page-count">
                    <ShoppingCart size={17} />

                    <span>
                        {orders.length} Orders
                    </span>
                </div>
            </div>


            {/* Orders */}
            <div className="admin-section">

                <div className="admin-section-header">
                    <div>
                        <h2>All Orders</h2>

                        <p>
                            Orders from all sellers and stores
                        </p>
                    </div>
                </div>


                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Store</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Order Status</th>
                                <th>Fulfillment</th>
                                <th>Created</th>
                            </tr>
                        </thead>


                        <tbody>

                            {orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="admin-empty"
                                    >
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>

                                        {/* Order */}
                                        <td>
                                            <div className="admin-order-cell">

                                                <div className="admin-order-avatar">
                                                    <ShoppingCart size={17} />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {order.order_number}
                                                    </strong>

                                                    <span>
                                                        #{order.id}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>


                                        {/* Customer */}
                                        <td>
                                            {order.customer ? (
                                                <div className="admin-owner-cell">

                                                    <div className="admin-inline-icon">
                                                        <User size={14} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {order.customer.name ||
                                                                "-"}
                                                        </strong>

                                                        <span>
                                                            {order.customer.phone ||
                                                                "-"}
                                                        </span>
                                                    </div>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>


                                        {/* Store */}
                                        <td>
                                            {order.store ? (
                                                <div className="admin-store-cell">

                                                    <Store size={16} />

                                                    <div>
                                                        <strong>
                                                            {order.store.name}
                                                        </strong>

                                                        <span>
                                                            /{order.store.slug}
                                                        </span>
                                                    </div>

                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>


                                        {/* Items */}
                                        <td>
                                            <div className="admin-number-cell">

                                                <Package size={15} />

                                                <strong>
                                                    {order.items_count ?? 0}
                                                </strong>

                                            </div>
                                        </td>


                                        {/* Total */}
                                        <td>
                                            <strong>
                                                {formatMoney(
                                                    order.total,
                                                    order.currency
                                                )}
                                            </strong>
                                        </td>


                                        {/* Payment */}
                                        <td>
                                            <div className="admin-order-payment">

                                                <span
                                                    className={`admin-payment-status ${getPaymentClass(
                                                        order.payment_status
                                                    )}`}
                                                >
                                                    <CreditCard size={13} />

                                                    {order.payment_status ||
                                                        "-"}
                                                </span>

                                                {order.payment_method && (
                                                    <small>
                                                        {
                                                            order
                                                                .payment_method
                                                                .name
                                                        }
                                                    </small>
                                                )}

                                            </div>
                                        </td>


                                        {/* Order Status */}
                                        <td>
                                            <span
                                                className={`admin-order-status ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status || "-"}
                                            </span>
                                        </td>


                                        {/* Fulfillment */}
                                        <td>
                                            <span
                                                className={`admin-fulfillment-status ${getStatusClass(
                                                    order.fulfillment_status
                                                )}`}
                                            >
                                                {order.fulfillment_status ||
                                                    "-"}
                                            </span>
                                        </td>


                                        {/* Created */}
                                        <td>
                                            <div className="admin-date-cell">
                                                <strong>
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </strong>
                                            </div>
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

export default AdminOrdersPage;