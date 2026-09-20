import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Mail,
    Package,
    Phone,
    User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

import "./SellerCustomerDetailPage.css";

function SellerCustomerDetailPage() {
    const { phone } = useParams();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCustomer();
    }, [phone]);

    const loadCustomer = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/seller/customers/${encodeURIComponent(
                    phone
                )}`
            );

            setCustomer(response.data.customer);
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error(
                "Failed to load customer:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load customer."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="customer-detail-state">
                Loading customer...
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-detail-state customer-detail-error">
                <h2>Unable to load customer</h2>

                <p>{error}</p>

                <Link
                    to="/seller/customers"
                    className="customer-back-button"
                >
                    <ArrowLeft size={17} />
                    Back to Customers
                </Link>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="customer-detail-state">
                <h2>Customer not found</h2>

                <Link
                    to="/seller/customers"
                    className="customer-back-button"
                >
                    <ArrowLeft size={17} />
                    Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div className="seller-customer-detail-page">
            {/* =================================
                Back
            ================================= */}

            <Link
                to="/seller/customers"
                className="customer-detail-back"
            >
                <ArrowLeft size={17} />
                Back to Customers
            </Link>

            {/* =================================
                Customer Header
            ================================= */}

            <div className="customer-detail-header">
                <div className="customer-profile">
                    <div className="customer-avatar">
                        <User size={28} />
                    </div>

                    <div>
                        <h1>
                            {customer.customer_name}
                        </h1>

                        <p>
                            Last order{" "}
                            {customer.last_order_at
                                ? new Date(
                                    customer.last_order_at
                                ).toLocaleDateString()
                                : "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================
                Customer Information
            ================================= */}

            <div className="customer-detail-grid">
                <div className="customer-info-card">
                    <div className="customer-card-title">
                        <User size={18} />
                        <span>
                            Customer Information
                        </span>
                    </div>

                    <div className="customer-info-list">
                        <div className="customer-info-item">
                            <Phone size={17} />

                            <div>
                                <span>Phone</span>
                                <strong>
                                    {
                                        customer.customer_phone
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="customer-info-item">
                            <Mail size={17} />

                            <div>
                                <span>Email</span>
                                <strong>
                                    {customer.customer_email ||
                                        "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="customer-info-item">
                            <User size={17} />

                            <div>
                                <span>
                                    Contact Platform
                                </span>

                                <strong>
                                    {customer.contact_platform ||
                                        "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="customer-info-item">
                            <User size={17} />

                            <div>
                                <span>
                                    Contact Username
                                </span>

                                <strong>
                                    {customer.contact_username ||
                                        "—"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================
                    Customer Stats
                ================================= */}

                <div className="customer-stats-card">
                    <div className="customer-card-title">
                        <Package size={18} />
                        <span>
                            Customer Overview
                        </span>
                    </div>

                    <div className="customer-stats-grid">
                        <div className="customer-stat">
                            <span>
                                Total Orders
                            </span>

                            <strong>
                                {customer.total_orders}
                            </strong>
                        </div>

                        <div className="customer-stat">
                            <span>
                                Total Spent
                            </span>

                            <strong>
                                {Number(
                                    customer.total_spent ||
                                    0
                                ).toLocaleString()}{" "}
                                MMK
                            </strong>
                        </div>

                        <div className="customer-stat">
                            <span>
                                Last Order
                            </span>

                            <strong>
                                {customer.last_order_at
                                    ? new Date(
                                        customer.last_order_at
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================
                Order History
            ================================= */}

            <div className="customer-orders-card">
                <div className="customer-card-title">
                    <Package size={18} />
                    <span>Order History</span>
                </div>

                {orders.length === 0 ? (
                    <div className="customer-orders-empty">
                        No orders found.
                    </div>
                ) : (
                    <div className="customer-orders-table-wrapper">
                        <table className="customer-orders-table">
                            <thead>
                                <tr>
                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Order Status
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Fulfillment
                                    </th>

                                    <th>
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order.id
                                            }
                                        >
                                            <td>
                                                <Link
                                                    to={`/seller/orders/${order.id}`}
                                                    className="customer-order-link"
                                                >
                                                    {
                                                        order.order_number
                                                    }
                                                </Link>
                                            </td>

                                            <td>
                                                {Number(
                                                    order.total ||
                                                    0
                                                ).toLocaleString()}{" "}
                                                {
                                                    order.currency
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={`customer-status customer-status-${order.status}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`customer-status customer-payment-${order.payment_status}`}
                                                >
                                                    {
                                                        order.payment_status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`customer-status customer-fulfillment-${order.fulfillment_status}`}
                                                >
                                                    {
                                                        order.fulfillment_status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {order.created_at
                                                    ? new Date(
                                                        order.created_at
                                                    ).toLocaleDateString()
                                                    : "—"}
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

export default SellerCustomerDetailPage;