import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Store,
    Package,
    ShoppingCart,
    CircleDollarSign,
    Clock3,
    CheckCircle2,
    XCircle,
    Mail,
    Phone,
    ExternalLink,
    LoaderCircle,
    Power,
    CreditCard,
    RefreshCw,
} from "lucide-react";

import api from "../services/api";

function AdminSellerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // =========================================================
    // Seller
    // =========================================================

    const [seller, setSeller] = useState(null);
    const [store, setStore] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    // =========================================================
    // Subscription
    // =========================================================

    const [subscription, setSubscription] = useState(null);

    const [subscriptionLoading, setSubscriptionLoading] =
        useState(true);

    const [subscriptionSaving, setSubscriptionSaving] =
        useState(false);

    const [plans, setPlans] = useState([]);

    const [selectedPlanId, setSelectedPlanId] =
        useState("");

    const [selectedStatus, setSelectedStatus] =
        useState("active");

    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [trialEndsAt, setTrialEndsAt] = useState("");

    // =========================================================
    // General
    // =========================================================

    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // Initial Load
    // =========================================================

    useEffect(() => {
        fetchSeller();
        fetchSubscription();
        fetchPlans();
    }, [id]);

    // =========================================================
    // Fetch Seller
    // =========================================================

    const fetchSeller = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/admin/sellers/${id}`
            );

            setSeller(response.data.seller);
            setStore(response.data.store);
            setStats(response.data.stats);

            setRecentOrders(
                response.data.recent_orders || []
            );
        } catch (err) {
            console.error(
                "Seller detail error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load seller details."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // Fetch Subscription
    // =========================================================

    const fetchSubscription = async () => {
        try {
            setSubscriptionLoading(true);

            const response = await api.get(
                `/admin/sellers/${id}/subscription`
            );

            const currentSubscription =
                response.data.subscription;

            setSubscription(currentSubscription);

            if (currentSubscription) {
                setSelectedPlanId(
                    String(
                        currentSubscription.plan?.id || ""
                    )
                );

                setSelectedStatus(
                    currentSubscription.status ||
                    "active"
                );

                setStartsAt(
                    formatDateTimeForInput(
                        currentSubscription.starts_at
                    )
                );

                setEndsAt(
                    formatDateTimeForInput(
                        currentSubscription.ends_at
                    )
                );

                setTrialEndsAt(
                    formatDateTimeForInput(
                        currentSubscription.trial_ends_at
                    )
                );
            }
        } catch (err) {
            console.error(
                "Subscription load error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load subscription."
            );
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // =========================================================
    // Plans
    // =========================================================

    const fetchPlans = async () => {
        try {
            // Current ZaySai plans
            setPlans([
                {
                    id: 1,
                    name: "Starter",
                    price: 20000,
                    currency: "MMK",
                    billing_cycle: "monthly",
                    max_products: 15,
                },
                {
                    id: 2,
                    name: "Growth",
                    price: 35000,
                    currency: "MMK",
                    billing_cycle: "monthly",
                    max_products: 50,
                },
                {
                    id: 3,
                    name: "Pro",
                    price: 60000,
                    currency: "MMK",
                    billing_cycle: "monthly",
                    max_products: 200,
                },
            ]);
        } catch (err) {
            console.error(
                "Plans load error:",
                err
            );
        }
    };

    // =========================================================
    // Save Subscription
    // =========================================================

    const handleSubscriptionSave = async () => {
        if (!selectedPlanId) {
            setError("Please select a plan.");
            return;
        }

        const selectedPlan = plans.find(
            (plan) =>
                String(plan.id) ===
                String(selectedPlanId)
        );

        if (!selectedPlan) {
            setError("Selected plan is invalid.");
            return;
        }

        const confirmed = window.confirm(
            subscription
                ? `Change this seller to ${selectedPlan.name} plan?`
                : `Assign ${selectedPlan.name} plan to this seller?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubscriptionSaving(true);
            setError("");
            setSuccessMessage("");

            const payload = {
                plan_id: Number(selectedPlanId),

                status: selectedStatus,

                starts_at: startsAt
                    ? new Date(
                        startsAt
                    ).toISOString()
                    : null,

                ends_at: endsAt
                    ? new Date(
                        endsAt
                    ).toISOString()
                    : null,

                trial_ends_at: trialEndsAt
                    ? new Date(
                        trialEndsAt
                    ).toISOString()
                    : null,
            };

            let response;

            if (subscription) {
                response = await api.patch(
                    `/admin/sellers/${id}/subscription`,
                    payload
                );
            } else {
                response = await api.post(
                    `/admin/sellers/${id}/subscription`,
                    payload
                );
            }

            setSuccessMessage(
                response.data.message ||
                "Subscription saved successfully."
            );

            await fetchSubscription();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(
                "Subscription save error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save subscription."
            );
        } finally {
            setSubscriptionSaving(false);
        }
    };

    // =========================================================
    // Seller Status
    // =========================================================

    const handleStatusChange = async () => {
        if (!seller) {
            return;
        }

        const nextStatus = !seller.is_active;

        const actionText = nextStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this seller?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setStatusLoading(true);
            setError("");
            setSuccessMessage("");

            const response = await api.patch(
                `/admin/sellers/${seller.id}/status`,
                {
                    is_active: nextStatus,
                }
            );

            setSeller((currentSeller) => ({
                ...currentSeller,
                is_active:
                    response.data.seller.is_active,
            }));

            setSuccessMessage(
                response.data.message ||
                "Seller status updated successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(
                "Seller status update error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update seller status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    // =========================================================
    // Helpers
    // =========================================================

    const formatMoney = (value) => {
        return Number(value || 0).toLocaleString(
            "en-US"
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    const formatDateTimeForInput = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        const year =
            parsedDate.getFullYear();

        const month = String(
            parsedDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            parsedDate.getDate()
        ).padStart(2, "0");

        const hours = String(
            parsedDate.getHours()
        ).padStart(2, "0");

        const minutes = String(
            parsedDate.getMinutes()
        ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "admin-status-badge completed";

            case "processing":
                return "admin-status-badge processing";

            case "pending":
                return "admin-status-badge pending";

            case "cancelled":
                return "admin-status-badge cancelled";

            default:
                return "admin-status-badge";
        }
    };

    // =========================================================
    // Loading
    // =========================================================

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-loading">
                    <LoaderCircle
                        size={24}
                        className="admin-loading-icon"
                    />

                    Loading seller...
                </div>
            </div>
        );
    }

    // =========================================================
    // Error
    // =========================================================

    if (error && !seller) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <div>
                        <button
                            type="button"
                            className="admin-back-button"
                            onClick={() =>
                                navigate(
                                    "/admin/sellers"
                                )
                            }
                        >
                            <ArrowLeft size={18} />
                            Back to Sellers
                        </button>
                    </div>
                </div>

                <div className="admin-error-card">
                    {error}
                </div>
            </div>
        );
    }

    if (!seller || !store || !stats) {
        return null;
    }

    // =========================================================
    // Render
    // =========================================================

    return (
        <div className="admin-page">

            {/* =====================================================
                Header
            ====================================================== */}

            <div className="admin-page-header">
                <div>
                    <button
                        type="button"
                        className="admin-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/sellers"
                            )
                        }
                    >
                        <ArrowLeft size={18} />
                        Back to Sellers
                    </button>

                    <div className="admin-seller-title-row">
                        <div className="admin-seller-avatar">
                            {seller.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                        </div>

                        <div>
                            <h1>
                                {seller.name}
                            </h1>

                            <p>
                                Seller ID #
                                {seller.id} · Joined{" "}
                                {formatDate(
                                    seller.created_at
                                )}
                            </p>
                        </div>

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
                    </div>
                </div>

                <div className="admin-seller-status-actions">
                    <button
                        type="button"
                        className={
                            seller.is_active
                                ? "admin-seller-action-button deactivate"
                                : "admin-seller-action-button activate"
                        }
                        onClick={
                            handleStatusChange
                        }
                        disabled={statusLoading}
                    >
                        {statusLoading ? (
                            <>
                                <LoaderCircle
                                    size={16}
                                    className="admin-loading-icon"
                                />

                                Updating...
                            </>
                        ) : (
                            <>
                                <Power size={16} />

                                {seller.is_active
                                    ? "Deactivate Seller"
                                    : "Activate Seller"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* =====================================================
                Alerts
            ====================================================== */}

            {successMessage && (
                <div className="admin-success-alert">
                    <CheckCircle2 size={17} />

                    <span>
                        {successMessage}
                    </span>
                </div>
            )}

            {error && (
                <div className="admin-error-alert">
                    <XCircle size={17} />

                    <span>
                        {error}
                    </span>
                </div>
            )}

            {/* =====================================================
                Seller + Store
            ====================================================== */}

            <div className="admin-seller-detail-grid">

                {/* Seller Information */}

                <div className="admin-card admin-seller-info-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>
                                Seller Information
                            </h2>

                            <p>
                                Account details
                            </p>
                        </div>
                    </div>

                    <div className="admin-info-list">

                        <div className="admin-info-item">
                            <Mail size={18} />

                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {seller.email}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-info-item">
                            <Store size={18} />

                            <div>
                                <span>
                                    Store
                                </span>

                                <strong>
                                    {store.name}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-info-item">
                            <span className="admin-info-icon-text">
                                #
                            </span>

                            <div>
                                <span>
                                    Store Slug
                                </span>

                                <strong>
                                    {store.slug}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-info-item">
                            <Phone size={18} />

                            <div>
                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {store.phone ||
                                        "-"}
                                </strong>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Store */}

                <div className="admin-card admin-store-card">
                    <div className="admin-card-header">

                        <div>
                            <h2>Store</h2>

                            <p>
                                Seller's storefront
                            </p>
                        </div>

                        <span
                            className={
                                store.status ===
                                    "active"
                                    ? "admin-store-status active"
                                    : "admin-store-status"
                            }
                        >
                            {store.status ||
                                "Unknown"}
                        </span>
                    </div>

                    <div className="admin-store-preview">

                        <div className="admin-store-logo">
                            {store.logo ? (
                                <img
                                    src={store.logo}
                                    alt={store.name}
                                />
                            ) : (
                                <Store size={28} />
                            )}
                        </div>

                        <div>
                            <h3>
                                {store.name}
                            </h3>

                            <p>
                                {store.description ||
                                    "No store description."}
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            {/* =====================================================
                Subscription
            ====================================================== */}

            <div className="admin-card admin-subscription-card">

                <div className="admin-card-header">

                    <div>
                        <div className="admin-subscription-title">

                            <div className="admin-subscription-icon">
                                <CreditCard
                                    size={20}
                                />
                            </div>

                            <div>
                                <h2>
                                    Subscription
                                </h2>

                                <p>
                                    Manage this seller's
                                    ZaySai plan
                                </p>
                            </div>

                        </div>
                    </div>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={
                            fetchSubscription
                        }
                        disabled={
                            subscriptionLoading ||
                            subscriptionSaving
                        }
                    >
                        <RefreshCw
                            size={15}
                        />

                        Refresh
                    </button>

                </div>

                {subscriptionLoading ? (
                    <div className="admin-subscription-loading">

                        <LoaderCircle
                            size={22}
                            className="admin-loading-icon"
                        />

                        Loading subscription...

                    </div>
                ) : (
                    <>
                        {/* Current Subscription */}

                        <div className="admin-subscription-current">

                            <div>
                                <span>
                                    Current Plan
                                </span>

                                <strong>
                                    {subscription
                                        ?.plan
                                        ?.name ||
                                        "No Plan"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Price
                                </span>

                                <strong>
                                    {subscription?.plan
                                        ? `${formatMoney(
                                            subscription
                                                .plan
                                                .price
                                        )} ${subscription
                                            .plan
                                            .currency ||
                                        "MMK"
                                        }`
                                        : "-"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Products
                                </span>

                                <strong>
                                    {subscription?.plan
                                        ?.max_products ??
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Status
                                </span>

                                <strong
                                    className={`admin-subscription-status ${subscription?.status ||
                                        "none"
                                        }`}
                                >
                                    {subscription
                                        ?.status ||
                                        "Not Assigned"}
                                </strong>
                            </div>

                        </div>

                        {/* Dates */}

                        {subscription && (
                            <div className="admin-subscription-dates">

                                <div>
                                    <span>
                                        Started
                                    </span>

                                    <strong>
                                        {formatDate(
                                            subscription.starts_at
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Trial Ends
                                    </span>

                                    <strong>
                                        {formatDate(
                                            subscription.trial_ends_at
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Expires
                                    </span>

                                    <strong>
                                        {formatDate(
                                            subscription.ends_at
                                        )}
                                    </strong>
                                </div>

                            </div>
                        )}

                        {/* Manage */}

                        <div className="admin-subscription-manage">

                            <div className="admin-subscription-form-grid">

                                {/* Plan */}

                                <div className="admin-form-group">
                                    <label>
                                        Plan
                                    </label>

                                    <select
                                        value={
                                            selectedPlanId
                                        }
                                        onChange={(e) =>
                                            setSelectedPlanId(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select plan
                                        </option>

                                        {plans.map(
                                            (plan) => (
                                                <option
                                                    key={
                                                        plan.id
                                                    }
                                                    value={
                                                        plan.id
                                                    }
                                                >
                                                    {
                                                        plan.name
                                                    }{" "}
                                                    —{" "}
                                                    {formatMoney(
                                                        plan.price
                                                    )}{" "}
                                                    {
                                                        plan.currency
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Status */}

                                <div className="admin-form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={
                                            selectedStatus
                                        }
                                        onChange={(e) =>
                                            setSelectedStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="trial">
                                            Trial
                                        </option>

                                        <option value="paused">
                                            Paused
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>

                                        <option value="expired">
                                            Expired
                                        </option>
                                    </select>
                                </div>

                                {/* Starts At */}

                                <div className="admin-form-group">
                                    <label>
                                        Starts At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            startsAt
                                        }
                                        onChange={(e) =>
                                            setStartsAt(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Ends At */}

                                <div className="admin-form-group">
                                    <label>
                                        Ends At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            endsAt
                                        }
                                        onChange={(e) =>
                                            setEndsAt(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Trial Ends At */}

                                <div className="admin-form-group">
                                    <label>
                                        Trial Ends At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            trialEndsAt
                                        }
                                        onChange={(e) =>
                                            setTrialEndsAt(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            <div className="admin-subscription-actions">

                                <button
                                    type="button"
                                    className="admin-subscription-save-button"
                                    onClick={
                                        handleSubscriptionSave
                                    }
                                    disabled={
                                        subscriptionSaving
                                    }
                                >
                                    {subscriptionSaving ? (
                                        <>
                                            <LoaderCircle
                                                size={16}
                                                className="admin-loading-icon"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={16}
                                            />

                                            {subscription
                                                ? "Update Subscription"
                                                : "Assign Subscription"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>
                    </>
                )}

            </div>

            {/* =====================================================
                Stats
            ====================================================== */}

            <div className="admin-stat-grid">

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <Package size={20} />
                    </div>

                    <div>
                        <span>
                            Products
                        </span>

                        <strong>
                            {stats.products}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <ShoppingCart
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {stats.orders}
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <CircleDollarSign
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Revenue
                        </span>

                        <strong>
                            {formatMoney(
                                stats.revenue
                            )}{" "}
                            MMK
                        </strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                        <CheckCircle2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                stats.completed_orders
                            }
                        </strong>
                    </div>
                </div>

            </div>

            {/* =====================================================
                Order Status
            ====================================================== */}

            <div className="admin-card">

                <div className="admin-card-header">

                    <div>
                        <h2>
                            Order Overview
                        </h2>

                        <p>
                            Current order status
                            breakdown
                        </p>
                    </div>

                </div>

                <div className="admin-order-overview-grid">

                    <div>
                        <Clock3 size={18} />

                        <span>
                            Pending
                        </span>

                        <strong>
                            {
                                stats.pending_orders
                            }
                        </strong>
                    </div>

                    <div>
                        <LoaderCircle
                            size={18}
                        />

                        <span>
                            Processing
                        </span>

                        <strong>
                            {
                                stats.processing_orders
                            }
                        </strong>
                    </div>

                    <div>
                        <CheckCircle2
                            size={18}
                        />

                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                stats.completed_orders
                            }
                        </strong>
                    </div>

                    <div>
                        <XCircle size={18} />

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {
                                stats.cancelled_orders
                            }
                        </strong>
                    </div>

                </div>

            </div>

            {/* =====================================================
                Recent Orders
            ====================================================== */}

            <div className="admin-card">

                <div className="admin-card-header">

                    <div>
                        <h2>
                            Recent Orders
                        </h2>

                        <p>
                            Latest orders from this
                            seller
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                            navigate(
                                "/admin/orders"
                            )
                        }
                    >
                        View All Orders

                        <ExternalLink
                            size={15}
                        />
                    </button>

                </div>

                {recentOrders.length === 0 ? (
                    <div className="admin-empty-state">
                        No orders found for this
                        seller.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

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

                                    <th>
                                        Date
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
                                            className="admin-order-row-clickable"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/orders/${order.id}`
                                                )
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        order.order_number
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="admin-table-primary">
                                                    {
                                                        order.customer_name
                                                    }
                                                </div>

                                                <div className="admin-table-secondary">
                                                    {
                                                        order.customer_phone
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatMoney(
                                                        order.total
                                                    )}{" "}
                                                    {
                                                        order.currency
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        order.payment_status ===
                                                            "paid"
                                                            ? "admin-payment-badge paid"
                                                            : "admin-payment-badge unpaid"
                                                    }
                                                >
                                                    {
                                                        order.payment_status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        order.status
                                                    )}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    order.created_at
                                                )}
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

export default AdminSellerDetailPage;