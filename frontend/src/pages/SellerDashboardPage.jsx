import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Package,
    ShoppingBag,
    Store,
    Wallet,
} from "lucide-react";

import api from "../services/api";
import "./SellerDashboardPage.css";

function SellerDashboardPage() {
    const [seller, setSeller] = useState(null);
    const [store, setStore] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/seller/dashboard"
                );

                setStore(response.data.store);
                setStats(response.data.stats || {});
                setRecentOrders(
                    response.data.recent_orders || []
                );

                // Seller information
                try {
                    const meResponse = await api.get("/me");

                    setSeller(
                        meResponse.data.user || null
                    );
                } catch (meError) {
                    console.error(
                        "Seller information error:",
                        meError
                    );
                }
            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading your workspace...
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load dashboard</h2>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try Again
                </button>
            </div>
        );
    }

    const revenue = Number(
        stats?.revenue || 0
    ).toLocaleString();

    return (
        <div className="overview-page">

            {/* =================================================
                TOP
            ================================================= */}

            <div className="overview-top">

                <div>

                    <span className="overview-label">
                        SELLER WORKSPACE
                    </span>

                    <h1>
                        Welcome back
                        {seller?.name
                            ? `, ${seller.name}`
                            : ""}
                    </h1>

                    <p>
                        Here's what's happening with
                        your store today.
                    </p>

                </div>

                <a
                    href={`/${store?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="open-store-button"
                >
                    View Store
                    <ExternalLinkIcon />
                </a>

            </div>


            {/* =================================================
                STORE HERO
            ================================================= */}

            <div className="store-hero">

                <div className="hero-glow"></div>

                <div className="hero-content">

                    <div className="store-icon">
                        {store?.logo ? (
                            <img
                                src={store.logo}
                                alt={store.name}
                            />
                        ) : (
                            <Store size={25} />
                        )}
                    </div>

                    <div>

                        <span className="hero-small">
                            YOUR STOREFRONT
                        </span>

                        <h2>
                            {store?.name || "Your Store"}
                        </h2>

                        <p>
                            /{store?.slug || ""}
                        </p>

                    </div>

                </div>

                <div
                    className={`store-status ${store?.status === "active"
                            ? "active"
                            : "inactive"
                        }`}
                >
                    <span></span>

                    {store?.status || "inactive"}
                </div>

            </div>


            {/* =================================================
                MAIN STATS
            ================================================= */}

            <div className="overview-stats">

                {/* Revenue */}

                <div className="overview-stat-card">

                    <div className="stat-icon green">
                        <Wallet size={21} />
                    </div>

                    <div>

                        <span>
                            Revenue
                        </span>

                        <strong>
                            {revenue}{" "}
                            <small>
                                MMK
                            </small>
                        </strong>

                    </div>

                </div>


                {/* Total Orders */}

                <div className="overview-stat-card">

                    <div className="stat-icon blue">
                        <ShoppingBag size={21} />
                    </div>

                    <div>

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {stats?.total_orders || 0}
                        </strong>

                    </div>

                    <Link to="/seller/orders">
                        <ArrowUpRight size={18} />
                    </Link>

                </div>


                {/* Products */}

                <div className="overview-stat-card">

                    <div className="stat-icon purple">
                        <Package size={21} />
                    </div>

                    <div>

                        <span>
                            Total Products
                        </span>

                        <strong>
                            {stats?.total_products || 0}
                        </strong>

                    </div>

                    <Link to="/seller/products">
                        <ArrowUpRight size={18} />
                    </Link>

                </div>

            </div>


            {/* =================================================
                ORDER STATUS OVERVIEW
            ================================================= */}

            <div className="dashboard-status-grid">

                <div className="dashboard-mini-stat">

                    <div className="mini-stat-icon warning">
                        <Clock3 size={19} />
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {stats?.pending_orders || 0}
                        </strong>
                    </div>

                </div>


                <div className="dashboard-mini-stat">

                    <div className="mini-stat-icon blue">
                        <ShoppingBag size={19} />
                    </div>

                    <div>
                        <span>
                            Processing
                        </span>

                        <strong>
                            {stats?.processing_orders || 0}
                        </strong>
                    </div>

                </div>


                <div className="dashboard-mini-stat">

                    <div className="mini-stat-icon green">
                        <CheckCircle2 size={19} />
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {stats?.completed_orders || 0}
                        </strong>
                    </div>

                </div>


                <div className="dashboard-mini-stat">

                    <div className="mini-stat-icon purple">
                        <Wallet size={19} />
                    </div>

                    <div>
                        <span>
                            Paid Orders
                        </span>

                        <strong>
                            {stats?.paid_orders || 0}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                PAYMENT OVERVIEW
            ================================================= */}

            <div className="dashboard-payment-overview">

                <div className="payment-overview-title">

                    <div>
                        <h2>
                            Payment Overview
                        </h2>

                        <p>
                            Current payment status across
                            your orders.
                        </p>
                    </div>

                </div>

                <div className="payment-overview-stats">

                    <div>
                        <span>
                            Paid
                        </span>

                        <strong className="paid-number">
                            {stats?.paid_orders || 0}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Unpaid
                        </span>

                        <strong className="unpaid-number">
                            {stats?.unpaid_orders || 0}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT ORDERS
            ================================================= */}

            <div className="recent-orders-card">

                <div className="recent-header">

                    <div>

                        <h2>
                            Recent Orders
                        </h2>

                        <p>
                            Your latest customer activity.
                        </p>

                    </div>

                    <Link
                        to="/seller/orders"
                        className="view-all-link"
                    >
                        View all
                        <ArrowUpRight size={15} />
                    </Link>

                </div>


                {recentOrders.length === 0 ? (

                    <div className="empty-orders">

                        <ShoppingBag size={30} />

                        <h3>
                            No orders yet
                        </h3>

                        <p>
                            Your customer orders will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="recent-table-wrapper">

                        <table className="recent-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {recentOrders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order.id
                                            }
                                        >

                                            <td>

                                                <Link
                                                    to={`/seller/orders/${order.id}`}
                                                    className="dashboard-order-number"
                                                >
                                                    {
                                                        order.order_number
                                                    }
                                                </Link>

                                            </td>

                                            <td>
                                                {
                                                    order.customer_name
                                                }
                                            </td>

                                            <td className="order-total">

                                                {Number(
                                                    order.total
                                                ).toLocaleString()}{" "}
                                                {
                                                    order.currency
                                                }

                                            </td>

                                            <td>

                                                <span
                                                    className={`dashboard-payment ${order.payment_status}`}
                                                >
                                                    {
                                                        order.payment_status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`dashboard-status ${order.status}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>

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


/*
|--------------------------------------------------------------------------
| Small External Link Icon
|--------------------------------------------------------------------------
*/

function ExternalLinkIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
    );
}

export default SellerDashboardPage;