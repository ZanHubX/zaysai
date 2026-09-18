import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Clipboard,
    CreditCard,
    ExternalLink,
    Image as ImageIcon,
    Mail,
    MessageCircle,
    Phone,
    User,
} from "lucide-react";
import api from "../services/api";
import "./SellerOrderDetailPage.css";

function SellerOrderDetailPage() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [copied, setCopied] = useState(false);
    const [paymentUpdating, setPaymentUpdating] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [paymentProofUrl, setPaymentProofUrl] = useState("");
    const [paymentProofLoading, setPaymentProofLoading] = useState(true);
    const [paymentProofError, setPaymentProofError] = useState("");

    const [fulfillmentUpdating, setFulfillmentUpdating] = useState(false);
    const [fulfillmentSaving, setFulfillmentSaving] = useState(false);
    const [fulfillmentMessage, setFulfillmentMessage] = useState("");
    const [fulfillmentError, setFulfillmentError] = useState("");
    const [voucher, setVoucher] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [purchaseProofFile, setPurchaseProofFile] = useState(null);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const response = await api.get(
                    `/seller/orders/${id}`
                );

                const loadedOrder = response.data.order;
                setOrder(loadedOrder);
                setVoucher(loadedOrder.voucher || "");
                setAdminNotes(loadedOrder.admin_notes || "");
            } catch (err) {
                console.error(err);
                setError("Order not found.");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    useEffect(() => {
        let objectUrl = null;

        const loadPaymentProof = async () => {
            setPaymentProofLoading(true);
            setPaymentProofError("");

            try {
                const response = await api.get(
                    `/seller/orders/${id}/payment-proof`,
                    { responseType: "blob" }
                );

                objectUrl = URL.createObjectURL(response.data);
                setPaymentProofUrl(objectUrl);
            } catch (err) {
                if (err.response?.status === 404) {
                    setPaymentProofError("No payment proof uploaded.");
                } else {
                    console.error(err);
                    setPaymentProofError("Unable to load payment proof.");
                }
            } finally {
                setPaymentProofLoading(false);
            }
        };

        loadPaymentProof();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [id]);

    const handleCopy = async () => {
        const accountNumber =
            order?.payment_method?.account_number;

        if (!accountNumber) return;

        try {
            await navigator.clipboard.writeText(
                accountNumber
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleOrderStatusChange = async (event) => {
        const newStatus = event.target.value;

        if (!order || !newStatus || newStatus === order.status) return;

        setStatusUpdating(true);
        setStatusMessage("");

        try {
            const response = await api.patch(
                `/seller/orders/${id}/status`,
                {
                    status: newStatus,
                }
            );

            setOrder(response.data.order);

            setStatusMessage(
                "Order status updated successfully."
            );

            setTimeout(() => {
                setStatusMessage("");
            }, 2500);
        } catch (err) {
            console.error(err);

            setStatusMessage(
                err.response?.data?.message ||
                "Failed to update order status."
            );
        } finally {
            setStatusUpdating(false);
        }
    };

    const handlePaymentStatusChange = async (event) => {
        const newStatus = event.target.value;

        if (!order || !newStatus) return;

        setPaymentUpdating(true);
        setPaymentMessage("");

        try {
            const response = await api.patch(
                `/seller/orders/${id}/payment-status`,
                {
                    payment_status: newStatus,
                }
            );

            setOrder(response.data.order);

            setPaymentMessage(
                "Payment status updated successfully."
            );

            setTimeout(() => {
                setPaymentMessage("");
            }, 2500);
        } catch (err) {
            console.error(err);

            setPaymentMessage(
                err.response?.data?.message ||
                "Failed to update payment status."
            );
        } finally {
            setPaymentUpdating(false);
        }
    };

    const handleFulfillmentStatusChange = async (newStatus) => {
        if (!order || !newStatus || newStatus === order.fulfillment_status) {
            return;
        }

        setFulfillmentUpdating(true);
        setFulfillmentMessage("");
        setFulfillmentError("");

        try {
            const response = await api.patch(
                `/seller/orders/${id}/fulfillment-status`,
                {
                    fulfillment_status: newStatus,
                }
            );

            setOrder(response.data.order);
            setFulfillmentMessage(
                "Fulfillment status updated successfully."
            );

            setTimeout(() => {
                setFulfillmentMessage("");
            }, 2500);
        } catch (err) {
            console.error(err);
            setFulfillmentError(
                err.response?.data?.message ||
                "Failed to update fulfillment status."
            );
        } finally {
            setFulfillmentUpdating(false);
        }
    };

    const handleFulfillmentSave = async (event) => {
        event.preventDefault();

        setFulfillmentSaving(true);
        setFulfillmentMessage("");
        setFulfillmentError("");

        try {
            const formData = new FormData();

            formData.append("voucher", voucher);
            formData.append("admin_notes", adminNotes);

            if (purchaseProofFile) {
                formData.append("purchase_proof", purchaseProofFile);
            }

            const response = await api.post(
                `/seller/orders/${id}/fulfillment`,
                formData
            );

            setOrder(response.data.order);
            setPurchaseProofFile(null);

            setFulfillmentMessage(
                "Fulfillment details saved successfully."
            );

            setTimeout(() => {
                setFulfillmentMessage("");
            }, 2500);
        } catch (err) {
            console.error(err);
            setFulfillmentError(
                err.response?.data?.message ||
                "Failed to save fulfillment details."
            );
        } finally {
            setFulfillmentSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="order-detail-state">
                <p>Loading order...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-detail-state">
                <p>
                    {error || "Order not found."}
                </p>

                <Link
                    to="/seller/orders"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to Orders
                </Link>
            </div>
        );
    }

    const paymentMethod = order.payment_method;

    return (
        <div className="order-detail-page">

            {/* Back */}
            <Link
                to="/seller/orders"
                className="back-link"
            >
                <ArrowLeft size={17} />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="order-detail-header">

                <div>
                    <div className="order-detail-eyebrow">
                        ORDER DETAILS
                    </div>

                    <h1>
                        {order.order_number}
                    </h1>

                    <p>
                        {new Date(
                            order.created_at
                        ).toLocaleString()}
                    </p>
                </div>

                <span
                    className={`detail-status ${order.status}`}
                >
                    {order.status}
                </span>

            </div>

            {/* Customer + Order Information */}
            <div className="order-detail-grid">

                {/* Customer */}
                <div className="detail-card">

                    <div className="detail-card-header">

                        <div className="detail-card-icon">
                            <User size={20} />
                        </div>

                        <div>
                            <h2>Customer</h2>

                            <span>
                                Customer information
                            </span>
                        </div>

                    </div>

                    <div className="customer-details">

                        <div className="customer-row">

                            <User size={17} />

                            <div>
                                <small>Name</small>

                                <strong>
                                    {order.customer_name}
                                </strong>
                            </div>

                        </div>

                        <div className="customer-row">

                            <Phone size={17} />

                            <div>
                                <small>Phone</small>

                                <strong>
                                    {order.customer_phone}
                                </strong>
                            </div>

                        </div>

                        <div className="customer-row">

                            <Mail size={17} />

                            <div>
                                <small>Email</small>

                                <strong>
                                    {order.customer_email ||
                                        "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="customer-row notes-row">

                            <div>
                                <small>Notes</small>

                                <strong>
                                    {order.notes || "—"}
                                </strong>
                            </div>

                        </div>

                        {/* Contact Account */}
                        <div className="customer-contact-section">

                            <div className="customer-contact-heading">
                                <MessageCircle size={16} />
                                <span>Contact Account</span>
                            </div>

                            <div className="contact-account-details">

                                <div className="contact-account-item">
                                    <small>Platform</small>
                                    <strong>
                                        {order.contact_platform
                                            ? order.contact_platform
                                                .replaceAll("_", " ")
                                                .replace(/\b\w/g, (letter) => letter.toUpperCase())
                                            : "—"}
                                    </strong>
                                </div>

                                <div className="contact-account-item">
                                    <small>Username / Account ID</small>
                                    <strong>
                                        {order.contact_username || "—"}
                                    </strong>
                                </div>

                                <div className="contact-account-item full-width">
                                    <small>Account Name</small>
                                    <strong>
                                        {order.contact_name || "—"}
                                    </strong>
                                </div>

                                {order.contact_link && (
                                    <div className="contact-account-item full-width">
                                        <small>Profile / Account Link</small>
                                        <a
                                            href={order.contact_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="contact-account-link"
                                        >
                                            {order.contact_link}
                                        </a>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </div>

                {/* Order Information */}
                <div className="detail-card">

                    <div className="detail-card-header">

                        <div className="detail-card-icon blue">
                            <Clipboard size={20} />
                        </div>

                        <div>
                            <h2>Order Information</h2>

                            <span>
                                Payment and order status
                            </span>
                        </div>

                    </div>

                    <div className="order-info-list">

                        {/* Order Status */}
                        <div className="info-row order-status-row">

                            <div className="order-status-label">
                                <span>
                                    Order Status
                                </span>

                                {statusMessage && (
                                    <small
                                        className={
                                            statusMessage.includes(
                                                "successfully"
                                            )
                                                ? "status-success-message"
                                                : "status-error-message"
                                        }
                                    >
                                        {statusMessage}
                                    </small>
                                )}
                            </div>

                            <div className="order-status-actions">
                                {order.status === "pending" && (
                                    <button
                                        type="button"
                                        className="order-status-action processing"
                                        onClick={() =>
                                            handleOrderStatusChange({
                                                target: { value: "processing" },
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating
                                            ? "Updating..."
                                            : "Start Processing"}
                                    </button>
                                )}

                                {order.status === "processing" && (
                                    <button
                                        type="button"
                                        className="order-status-action completed"
                                        onClick={() =>
                                            handleOrderStatusChange({
                                                target: { value: "completed" },
                                            })
                                        }
                                        disabled={statusUpdating}
                                    >
                                        {statusUpdating
                                            ? "Updating..."
                                            : "Complete Order"}
                                    </button>
                                )}

                                {(order.status === "pending" ||
                                    order.status === "processing") && (
                                        <button
                                            type="button"
                                            className="order-status-action cancelled"
                                            onClick={() =>
                                                handleOrderStatusChange({
                                                    target: { value: "cancelled" },
                                                })
                                            }
                                            disabled={statusUpdating}
                                        >
                                            Cancel Order
                                        </button>
                                    )}

                                {order.status === "completed" && (
                                    <span className="order-status-completed-label">
                                        ✓ Completed
                                    </span>
                                )}

                                {order.status === "cancelled" && (
                                    <span className="order-status-cancelled-label">
                                        Cancelled
                                    </span>
                                )}
                            </div>

                        </div>

                        {/* Payment Status */}
                        <div className="info-row payment-status-row">

                            <div>
                                <span>
                                    Payment Status
                                </span>

                                {paymentMessage && (
                                    <small
                                        className={
                                            paymentMessage.includes(
                                                "successfully"
                                            )
                                                ? "payment-success-message"
                                                : "payment-error-message"
                                        }
                                    >
                                        {paymentMessage}
                                    </small>
                                )}
                            </div>

                            <select
                                value={
                                    order.payment_status ||
                                    "unpaid"
                                }
                                onChange={
                                    handlePaymentStatusChange
                                }
                                disabled={
                                    paymentUpdating
                                }
                                className={`payment-status-select ${order.payment_status
                                    }`}
                            >
                                <option value="unpaid">
                                    Unpaid
                                </option>

                                <option value="paid">
                                    Paid
                                </option>
                            </select>

                        </div>

                        {/* Total */}
                        <div className="info-row total-row">

                            <span>
                                Total
                            </span>

                            <strong>
                                {Number(
                                    order.total
                                ).toLocaleString()}{" "}
                                {order.currency}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

            {/* Payment Method */}
            <div className="detail-card payment-detail-card">

                <div className="detail-card-header">

                    <div className="detail-card-icon purple">
                        <CreditCard size={20} />
                    </div>

                    <div>
                        <h2>
                            Payment Method
                        </h2>

                        <span>
                            Payment method selected by customer
                        </span>
                    </div>

                </div>

                {paymentMethod ? (

                    <div className="payment-method-detail">

                        <div className="payment-method-main">

                            <div className="payment-method-type">
                                {paymentMethod.type
                                    ?.toUpperCase()}
                            </div>

                            <div className="payment-method-name">
                                {paymentMethod.account_name}
                            </div>

                        </div>

                        <div className="payment-account-box">

                            <div>
                                <small>
                                    Account Number
                                </small>

                                <strong>
                                    {
                                        paymentMethod.account_number
                                    }
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="copy-payment-btn"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <Check size={17} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Clipboard
                                            size={17}
                                        />
                                        Copy
                                    </>
                                )}
                            </button>

                        </div>

                        {paymentMethod.instructions && (
                            <div className="payment-instructions">

                                <small>
                                    Instructions
                                </small>

                                <p>
                                    {
                                        paymentMethod.instructions
                                    }
                                </p>

                            </div>
                        )}

                    </div>

                ) : (

                    <div className="no-payment-method">

                        <CreditCard size={20} />

                        <div>

                            <strong>
                                No payment method recorded
                            </strong>

                            <span>
                                This order does not have a
                                payment method.
                            </span>

                        </div>

                    </div>
                )}

            </div>

            {/* Payment Proof */}
            <div className="detail-card payment-proof-card">

                <div className="detail-card-header">

                    <div className="detail-card-icon green">
                        <ImageIcon size={20} />
                    </div>

                    <div>
                        <h2>Payment Proof</h2>
                        <span>Payment screenshot uploaded by customer</span>
                    </div>

                </div>

                <div className="payment-proof-content">
                    {paymentProofLoading ? (
                        <div className="payment-proof-state">
                            <ImageIcon size={22} />
                            <p>Loading payment proof...</p>
                        </div>
                    ) : paymentProofUrl ? (
                        <>
                            <div className="payment-proof-image-wrapper">
                                <img
                                    src={paymentProofUrl}
                                    alt="Customer payment proof"
                                    className="payment-proof-image"
                                />
                            </div>

                            <a
                                href={paymentProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="payment-proof-view-btn"
                            >
                                <ExternalLink size={16} />
                                View Full Image
                            </a>
                        </>
                    ) : (
                        <div className={`payment-proof-state ${paymentProofError ? "error" : ""}`}>
                            <ImageIcon size={22} />
                            <p>{paymentProofError || "No payment proof uploaded."}</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Fulfillment */}
            <div className="detail-card fulfillment-card">

                <div className="detail-card-header">
                    <div className="detail-card-icon purple">
                        <Check size={20} />
                    </div>

                    <div>
                        <h2>Fulfillment</h2>
                        <span>
                            Manage delivery details for this order
                        </span>
                    </div>
                </div>

                <form
                    className="fulfillment-content"
                    onSubmit={handleFulfillmentSave}
                >
                    <div className="fulfillment-status-section">
                        <div className="fulfillment-field-header">
                            <div>
                                <strong>Fulfillment Status</strong>
                                <small>
                                    Track the progress of delivering the product.
                                </small>
                            </div>

                            {fulfillmentMessage && (
                                <small className="status-success-message">
                                    {fulfillmentMessage}
                                </small>
                            )}

                            {fulfillmentError && (
                                <small className="status-error-message">
                                    {fulfillmentError}
                                </small>
                            )}
                        </div>

                        <div className="fulfillment-status-actions">
                            {["pending", "processing", "completed"].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`fulfillment-status-btn ${status} ${order.fulfillment_status === status
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        handleFulfillmentStatusChange(status)
                                    }
                                    disabled={fulfillmentUpdating}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="fulfillment-field">
                        <label htmlFor="voucher">
                            Voucher / Delivery Code
                        </label>

                        <textarea
                            id="voucher"
                            value={voucher}
                            onChange={(event) =>
                                setVoucher(event.target.value)
                            }
                            placeholder="Enter voucher, code, key, or delivery information"
                            rows={3}
                        />

                        <small>
                            Example: GAME-ABCD-1234
                        </small>
                    </div>

                    <div className="fulfillment-field">
                        <label htmlFor="purchase-proof">
                            Purchase Proof
                        </label>

                        <input
                            id="purchase-proof"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                                setPurchaseProofFile(
                                    event.target.files?.[0] || null
                                )
                            }
                        />

                        <small>
                            Upload JPG, PNG, or WEBP image. Maximum 5MB.
                        </small>

                        {purchaseProofFile && (
                            <div className="selected-purchase-proof">
                                <ImageIcon size={16} />
                                <span>{purchaseProofFile.name}</span>
                            </div>
                        )}

                        {order.purchase_proof && !purchaseProofFile && (
                            <div className="selected-purchase-proof existing">
                                <Check size={16} />
                                <span>
                                    Purchase proof already uploaded.
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="fulfillment-field">
                        <label htmlFor="admin-notes">
                            Admin Notes
                        </label>

                        <textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(event) =>
                                setAdminNotes(event.target.value)
                            }
                            placeholder="Add internal notes about fulfillment..."
                            rows={4}
                        />

                        <small>
                            These notes are for seller/admin use.
                        </small>
                    </div>

                    <div className="fulfillment-actions">
                        <button
                            type="submit"
                            className="fulfillment-save-btn"
                            disabled={fulfillmentSaving}
                        >
                            {fulfillmentSaving
                                ? "Saving..."
                                : "Save Fulfillment"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Ordered Items */}
            <div className="detail-card items-card">

                <div className="detail-card-header">

                    <div className="detail-card-icon green">
                        <Clipboard size={20} />
                    </div>

                    <div>

                        <h2>
                            Ordered Items
                        </h2>

                        <span>
                            Products included in this order
                        </span>

                    </div>

                </div>

                <div className="order-items-table-wrapper">

                    <table className="order-items-table">

                        <thead>

                            <tr>
                                <th>
                                    Product
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Subtotal
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {order.items.map(
                                (item) => (
                                    <tr
                                        key={item.id}
                                    >

                                        <td>
                                            <strong>
                                                {
                                                    item.product_name
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {Number(
                                                item.price
                                            ).toLocaleString()}{" "}
                                            {
                                                order.currency
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.quantity
                                            }
                                        </td>

                                        <td>
                                            <strong>
                                                {Number(
                                                    item.subtotal
                                                ).toLocaleString()}{" "}
                                                {
                                                    order.currency
                                                }
                                            </strong>
                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                {/* Total */}
                <div className="items-total">

                    <span>
                        Order Total
                    </span>

                    <strong>
                        {Number(
                            order.total
                        ).toLocaleString()}{" "}
                        {order.currency}
                    </strong>

                </div>

            </div>

        </div>
    );
}

export default SellerOrderDetailPage;