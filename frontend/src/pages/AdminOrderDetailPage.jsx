import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingCart,
    User,
    Store,
    CreditCard,
    Package,
    FileImage,
    Clipboard,
    CheckCircle2,
    LoaderCircle,
    AlertCircle,
    ExternalLink,
    Calendar,
} from "lucide-react";
import api from "../services/api";

function AdminOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openingProof, setOpeningProof] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/admin/orders/${id}`
            );

            setOrder(response.data.order || null);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to load order."
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

        return new Date(date).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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

    /*
    |--------------------------------------------------------------------------
    | Open Private Proof
    |--------------------------------------------------------------------------
    */

    const openProof = async (type) => {
        if (!order?.id) {
            return;
        }

        try {
            setOpeningProof(type);

            const response = await api.get(
                `/admin/orders/${order.id}/${type}`,
                {
                    responseType: "blob",
                }
            );

            const contentType =
                response.headers["content-type"] ||
                "image/png";

            const blob = new Blob(
                [response.data],
                {
                    type: contentType,
                }
            );

            const blobUrl =
                URL.createObjectURL(blob);

            window.open(
                blobUrl,
                "_blank"
            );

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 60000);
        } catch (err) {
            console.error(
                "Proof opening error:",
                err
            );

            let message =
                "Failed to open proof.";

            if (err.response?.data instanceof Blob) {
                try {
                    const text =
                        await err.response.data.text();

                    const data =
                        JSON.parse(text);

                    message =
                        data.message || message;
                } catch {
                    // Keep default error message
                }
            } else {
                message =
                    err.response?.data?.message ||
                    message;
            }

            alert(message);
        } finally {
            setOpeningProof("");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <LoaderCircle
                    size={32}
                    className="admin-loading-icon"
                />

                <p>
                    Loading order...
                </p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !order) {
        return (
            <div className="admin-dashboard">
                <button
                    type="button"
                    className="admin-back-button"
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                >
                    <ArrowLeft size={17} />

                    Back to Orders
                </button>

                <div className="admin-dashboard-error">
                    <AlertCircle size={20} />

                    <span>
                        {error ||
                            "Order not found."}
                    </span>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Total Items
    |--------------------------------------------------------------------------
    */

    const totalItems =
        order.items?.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        ) || 0;

    return (
        <div className="admin-dashboard">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="admin-order-detail-header">

                <div>

                    <button
                        type="button"
                        className="admin-back-button"
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >
                        <ArrowLeft size={17} />

                        Back to Orders
                    </button>

                    <div className="admin-order-title-row">

                        <div className="admin-order-detail-icon">
                            <ShoppingCart size={22} />
                        </div>

                        <div>

                            <h1>
                                {order.order_number}
                            </h1>

                            <p>
                                Order #{order.id}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="admin-order-detail-statuses">

                    <span
                        className={`admin-order-status ${getStatusClass(
                            order.status
                        )}`}
                    >
                        {order.status || "-"}
                    </span>

                    <span
                        className={`admin-payment-status ${getPaymentClass(
                            order.payment_status
                        )}`}
                    >
                        <CreditCard size={13} />

                        {order.payment_status ||
                            "-"}
                    </span>

                </div>

            </div>


            {/* =====================================================
                MAIN GRID
            ===================================================== */}

            <div className="admin-order-detail-grid">

                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="admin-order-detail-main">


                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <User size={18} />
                            </div>

                            <div>
                                <h2>
                                    Customer Information
                                </h2>

                                <p>
                                    Customer details for this order
                                </p>
                            </div>

                        </div>

                        <div className="admin-detail-info-grid">

                            <div className="admin-detail-info-item">
                                <span>Name</span>

                                <strong>
                                    {order.customer?.name ||
                                        "-"}
                                </strong>
                            </div>

                            <div className="admin-detail-info-item">
                                <span>Phone</span>

                                <strong>
                                    {order.customer?.phone ||
                                        "-"}
                                </strong>
                            </div>

                            <div className="admin-detail-info-item">
                                <span>Email</span>

                                <strong>
                                    {order.customer?.email ||
                                        "-"}
                                </strong>
                            </div>

                            <div className="admin-detail-info-item">
                                <span>
                                    Contact Platform
                                </span>

                                <strong>
                                    {order.customer
                                        ?.contact_platform ||
                                        "-"}
                                </strong>
                            </div>

                            <div className="admin-detail-info-item">
                                <span>
                                    Contact Name
                                </span>

                                <strong>
                                    {order.customer
                                        ?.contact_name ||
                                        "-"}
                                </strong>
                            </div>

                            <div className="admin-detail-info-item">
                                <span>
                                    Username
                                </span>

                                <strong>
                                    {order.customer
                                        ?.contact_username ||
                                        "-"}
                                </strong>
                            </div>

                        </div>

                        {order.customer?.contact_link && (
                            <div className="admin-detail-link-row">

                                <a
                                    href={
                                        order.customer
                                            .contact_link
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-detail-contact-button"
                                >
                                    <ExternalLink
                                        size={16}
                                    />

                                    Contact Customer
                                </a>

                            </div>
                        )}

                    </div>


                    {/* =================================================
                        STORE
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <Store size={18} />
                            </div>

                            <div>
                                <h2>
                                    Store Information
                                </h2>

                                <p>
                                    Seller store associated
                                    with this order
                                </p>
                            </div>

                        </div>

                        {order.store ? (
                            <div className="admin-detail-store">

                                <div className="admin-detail-store-icon">
                                    <Store size={22} />
                                </div>

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
                            <div className="admin-empty">
                                Store information unavailable.
                            </div>
                        )}

                    </div>


                    {/* =================================================
                        ORDER ITEMS
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <Package size={18} />
                            </div>

                            <div>
                                <h2>
                                    Order Items
                                </h2>

                                <p>
                                    Products included in this order
                                </p>
                            </div>

                        </div>

                        <div className="admin-order-items">

                            {order.items?.length > 0 ? (
                                order.items.map((item) => (
                                    <div
                                        className="admin-order-item"
                                        key={item.id}
                                    >

                                        <div className="admin-order-item-icon">
                                            <Package
                                                size={17}
                                            />
                                        </div>

                                        <div className="admin-order-item-info">

                                            <strong>
                                                {item.product_name ||
                                                    item.name ||
                                                    "Product"}
                                            </strong>

                                            <span>
                                                Quantity:{" "}
                                                {item.quantity ??
                                                    0}
                                            </span>

                                        </div>

                                        <div className="admin-order-item-price">

                                            <strong>
                                                {formatMoney(
                                                    item.subtotal,
                                                    order.currency
                                                )}
                                            </strong>

                                        </div>

                                    </div>
                                ))
                            ) : (
                                <div className="admin-empty">
                                    No order items found.
                                </div>
                            )}

                        </div>

                        <div className="admin-order-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatMoney(
                                    order.total,
                                    order.currency
                                )}
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        PAYMENT
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <CreditCard size={18} />
                            </div>

                            <div>
                                <h2>
                                    Payment Information
                                </h2>

                                <p>
                                    Payment details for this order
                                </p>
                            </div>

                        </div>


                        <div className="admin-detail-info-grid">

                            <div className="admin-detail-info-item">

                                <span>
                                    Payment Method
                                </span>

                                <strong>
                                    {order.payment_method
                                        ?.name ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="admin-detail-info-item">

                                <span>
                                    Payment Status
                                </span>

                                <span
                                    className={`admin-payment-status ${getPaymentClass(
                                        order.payment_status
                                    )}`}
                                >
                                    <CreditCard
                                        size={13}
                                    />

                                    {order.payment_status ||
                                        "-"}
                                </span>

                            </div>


                            <div className="admin-detail-info-item">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatMoney(
                                        order.total,
                                        order.currency
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* Payment Proof */}

                        {order.payment_proof && (
                            <div className="admin-proof-section">

                                <div className="admin-proof-header">

                                    <FileImage
                                        size={17}
                                    />

                                    <strong>
                                        Payment Proof
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="admin-proof-link"
                                    disabled={
                                        openingProof ===
                                        "payment-proof"
                                    }
                                    onClick={() =>
                                        openProof(
                                            "payment-proof"
                                        )
                                    }
                                >

                                    {openingProof ===
                                    "payment-proof" ? (
                                        <>
                                            <LoaderCircle
                                                size={15}
                                                className="admin-loading-icon"
                                            />

                                            Opening...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink
                                                size={15}
                                            />

                                            View Payment Proof
                                        </>
                                    )}

                                </button>

                            </div>
                        )}

                    </div>


                    {/* =================================================
                        FULFILLMENT
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <CheckCircle2
                                    size={18}
                                />
                            </div>

                            <div>
                                <h2>
                                    Fulfillment
                                </h2>

                                <p>
                                    Order fulfillment information
                                </p>
                            </div>

                        </div>


                        <div className="admin-detail-info-grid">

                            <div className="admin-detail-info-item">

                                <span>
                                    Fulfillment Type
                                </span>

                                <strong>
                                    {order.fulfillment_type ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="admin-detail-info-item">

                                <span>
                                    Fulfillment Status
                                </span>

                                <span
                                    className={`admin-order-status ${getStatusClass(
                                        order.fulfillment_status
                                    )}`}
                                >
                                    {order.fulfillment_status ||
                                        "-"}
                                </span>

                            </div>


                            <div className="admin-detail-info-item">

                                <span>
                                    Voucher
                                </span>

                                <strong>
                                    {order.voucher ||
                                        "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Purchase Proof */}

                        {order.purchase_proof && (
                            <div className="admin-proof-section">

                                <div className="admin-proof-header">

                                    <FileImage
                                        size={17}
                                    />

                                    <strong>
                                        Purchase Proof
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="admin-proof-link"
                                    disabled={
                                        openingProof ===
                                        "purchase-proof"
                                    }
                                    onClick={() =>
                                        openProof(
                                            "purchase-proof"
                                        )
                                    }
                                >

                                    {openingProof ===
                                    "purchase-proof" ? (
                                        <>
                                            <LoaderCircle
                                                size={15}
                                                className="admin-loading-icon"
                                            />

                                            Opening...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink
                                                size={15}
                                            />

                                            View Purchase Proof
                                        </>
                                    )}

                                </button>

                            </div>
                        )}

                    </div>

                </div>


                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <div className="admin-order-detail-sidebar">


                    {/* =================================================
                        ORDER SUMMARY
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <Clipboard size={18} />
                            </div>

                            <div>
                                <h2>
                                    Order Summary
                                </h2>

                                <p>
                                    Quick order information
                                </p>
                            </div>

                        </div>


                        <div className="admin-summary-list">

                            <div>

                                <span>
                                    Order Number
                                </span>

                                <strong>
                                    {order.order_number}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Order Status
                                </span>

                                <span
                                    className={`admin-order-status ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                    {order.status ||
                                        "-"}
                                </span>

                            </div>


                            <div>

                                <span>
                                    Payment
                                </span>

                                <span
                                    className={`admin-payment-status ${getPaymentClass(
                                        order.payment_status
                                    )}`}
                                >
                                    {order.payment_status ||
                                        "-"}
                                </span>

                            </div>


                            <div>

                                <span>
                                    Items
                                </span>

                                <strong>
                                    {totalItems}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatMoney(
                                        order.total,
                                        order.currency
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        TIMELINE
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <Calendar size={18} />
                            </div>

                            <div>
                                <h2>
                                    Timeline
                                </h2>

                                <p>
                                    Order dates
                                </p>
                            </div>

                        </div>


                        <div className="admin-summary-list">

                            <div>

                                <span>
                                    Created
                                </span>

                                <strong>
                                    {formatDate(
                                        order.created_at
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Last Updated
                                </span>

                                <strong>
                                    {formatDate(
                                        order.updated_at
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        NOTES
                    ================================================= */}

                    <div className="admin-detail-card">

                        <div className="admin-detail-card-header">

                            <div className="admin-detail-card-icon">
                                <Clipboard size={18} />
                            </div>

                            <div>
                                <h2>
                                    Notes
                                </h2>

                                <p>
                                    Additional order information
                                </p>
                            </div>

                        </div>


                        <div className="admin-notes-content">

                            {order.notes ? (
                                <p>
                                    {order.notes}
                                </p>
                            ) : (
                                <span>
                                    No customer notes.
                                </span>
                            )}

                        </div>


                        {order.admin_notes && (
                            <div className="admin-admin-notes">

                                <strong>
                                    Admin Notes
                                </strong>

                                <p>
                                    {order.admin_notes}
                                </p>

                            </div>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminOrderDetailPage;