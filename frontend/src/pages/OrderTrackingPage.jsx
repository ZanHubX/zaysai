import { useEffect, useState } from "react";

import {
    Link,
    useLocation,
} from "react-router-dom";

import {
    Search,
    Package,
    CheckCircle2,
    Clock3,
    CreditCard,
    Truck,
    ArrowLeft,
    Copy,
    Check,
    AlertCircle,
} from "lucide-react";

import api from "../services/api";

import "./OrderTrackingPage.css";

function OrderTrackingPage() {
    const location = useLocation();

    /*
    |--------------------------------------------------------------------------
    | Navigation State
    |--------------------------------------------------------------------------
    |
    | StoreFrontPage can send:
    |
    | {
    |     storeSlug: "gamehub",
    |     storeName: "GameHub"
    | }
    |
    | Product success page can send:
    |
    | {
    |     orderNumber: "...",
    |     phone: "..."
    | }
    |
    */

    const navigationState = location.state || {};

    const [orderNumber, setOrderNumber] = useState(
        navigationState.orderNumber || ""
    );

    const [phone, setPhone] = useState(
        navigationState.phone || ""
    );

    const [order, setOrder] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [copied, setCopied] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Store Information
    |--------------------------------------------------------------------------
    |
    | If customer came from storefront, use navigation state.
    |
    | If customer came directly to /track-order,
    | we can get store information after successful tracking.
    |
    */

    const storeSlug =
        navigationState.storeSlug ||
        order?.store?.slug ||
        null;

    const storeName =
        navigationState.storeName ||
        order?.store?.name ||
        "Store";

    /*
    |--------------------------------------------------------------------------
    | Auto Track
    |--------------------------------------------------------------------------
    |
    | If ProductDetailPage sends order number + phone,
    | we can automatically show the tracking result.
    |
    | We only do this when BOTH values exist.
    |
    */

    useEffect(() => {
        if (
            navigationState.orderNumber &&
            navigationState.phone
        ) {
            trackOrder(
                navigationState.orderNumber,
                navigationState.phone
            );
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Track Order
    |--------------------------------------------------------------------------
    */

    const trackOrder = async (
        trackingOrderNumber = orderNumber,
        trackingPhone = phone
    ) => {
        const cleanOrderNumber =
            trackingOrderNumber.trim();

        const cleanPhone =
            trackingPhone.trim();

        if (!cleanOrderNumber) {
            setError("Please enter your order number.");
            setOrder(null);
            return;
        }

        if (!cleanPhone) {
            setError("Please enter your phone number.");
            setOrder(null);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setOrder(null);
            setCopied(false);

            const response = await api.get(
                `/orders/${encodeURIComponent(
                    cleanOrderNumber
                )}/track`,
                {
                    params: {
                        phone: cleanPhone,
                    },
                }
            );

            setOrder(response.data.order);

        } catch (err) {
            console.error(err);

            setOrder(null);

            if (
                err.response?.status === 404
            ) {
                setError(
                    "Order not found. Please check your order number and phone number."
                );
            } else if (
                err.response?.data?.message
            ) {
                setError(
                    err.response.data.message
                );
            } else {
                setError(
                    "Unable to track your order right now. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Form Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        await trackOrder();
    };

    /*
    |--------------------------------------------------------------------------
    | Copy Order Number
    |--------------------------------------------------------------------------
    */

    const handleCopyOrderNumber = async () => {
        if (!order?.order_number) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                order.order_number
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error(err);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Status Helpers
    |--------------------------------------------------------------------------
    */

    const getOrderStatusLabel = () => {
        if (!order?.status) {
            return "Pending";
        }

        return capitalizeStatus(order.status);
    };

    const getPaymentStatusLabel = () => {
        if (!order?.payment_status) {
            return "Unpaid";
        }

        return capitalizeStatus(
            order.payment_status
        );
    };

    const getFulfillmentStatusLabel = () => {
        if (!order?.fulfillment_status) {
            return "Pending";
        }

        return capitalizeStatus(
            order.fulfillment_status
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Progress State
    |--------------------------------------------------------------------------
    */

    const getProgressStep = () => {
        if (!order) {
            return 1;
        }

        if (
            order.status === "cancelled"
        ) {
            return 0;
        }

        if (
            order.status === "completed" ||
            order.fulfillment_status ===
            "completed"
        ) {
            return 3;
        }

        if (
            order.status === "processing" ||
            order.fulfillment_status ===
            "processing"
        ) {
            return 2;
        }

        return 1;
    };

    const progressStep =
        getProgressStep();

    return (
        <div className="order-tracking-page">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="tracking-header">

                <div className="tracking-header-inner">

                    <Link
                        to={
                            storeSlug
                                ? `/${storeSlug}`
                                : "/"
                        }
                        className="tracking-brand"
                    >
                        <img
                            src="/zaysai-logo.png"
                            alt="ZaySai"
                        />

                        <div>
                            <strong>
                                ZaySai
                            </strong>

                            <span>
                                Order Tracking
                            </span>
                        </div>
                    </Link>

                    {storeSlug && (
                        <Link
                            to={`/${storeSlug}`}
                            className="tracking-header-store-link"
                        >
                            <ArrowLeft
                                size={16}
                            />

                            Back to{" "}
                            {storeName}
                        </Link>
                    )}

                </div>

            </header>

            {/* =========================================================
                MAIN
            ========================================================= */}

            <main className="order-tracking-main">

                {/* =====================================================
                    TRACKING CARD
                ===================================================== */}

                <section className="tracking-card">

                    {/* Icon */}

                    <div className="tracking-icon">

                        <Search
                            size={28}
                        />

                    </div>

                    {/* Heading */}

                    <span className="tracking-kicker">
                        ORDER TRACKING
                    </span>

                    <h1>
                        Track Your Order
                    </h1>

                    <p className="tracking-description">
                        Enter your order number
                        and phone number to check
                        your order status.
                    </p>

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="tracking-form"
                    >

                        {/* Order Number */}

                        <div className="tracking-field">

                            <label htmlFor="order-number">
                                Order Number
                            </label>

                            <input
                                id="order-number"
                                type="text"
                                placeholder="e.g. ZS-20260917-MRJV2R"
                                value={orderNumber}
                                onChange={(e) =>
                                    setOrderNumber(
                                        e.target.value
                                    )
                                }
                                autoComplete="off"
                            />

                        </div>

                        {/* Phone Number */}

                        <div className="tracking-field">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                placeholder="09xxxxxxxxx"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }
                                autoComplete="tel"
                            />

                        </div>

                        {/* Error */}

                        {error && (
                            <div className="tracking-error">

                                <AlertCircle
                                    size={18}
                                />

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}

                        {/* Button */}

                        <button
                            type="submit"
                            className="tracking-submit-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="tracking-spinner"></span>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Search
                                        size={18}
                                    />

                                    Track Order
                                </>
                            )}

                        </button>

                    </form>

                    {/* =================================================
                        ORDER RESULT
                    ================================================= */}

                    {order && (
                        <div className="tracking-result">

                            {/* =========================================
                                RESULT HEADER
                            ========================================= */}

                            <div className="tracking-result-header">

                                <div>

                                    <span>
                                        ORDER
                                    </span>

                                    <h2>
                                        #
                                        {
                                            order.order_number
                                        }
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    className="copy-order-button"
                                    onClick={
                                        handleCopyOrderNumber
                                    }
                                >

                                    {copied ? (
                                        <>
                                            <Check
                                                size={15}
                                            />

                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy
                                                size={15}
                                            />

                                            Copy
                                        </>
                                    )}

                                </button>

                            </div>

                            {/* =========================================
                                STORE / CUSTOMER / TOTAL
                            ========================================= */}

                            <div className="tracking-summary-grid">

                                <div className="tracking-summary-item">

                                    <span>
                                        Store
                                    </span>

                                    <strong>
                                        {
                                            order.store
                                                ?.name ||
                                            storeName
                                        }
                                    </strong>

                                </div>

                                <div className="tracking-summary-item">

                                    <span>
                                        Customer
                                    </span>

                                    <strong>
                                        {
                                            order.customer_name
                                        }
                                    </strong>

                                </div>

                                <div className="tracking-summary-item">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {Number(
                                            order.total
                                        ).toLocaleString()}{" "}
                                        {
                                            order.currency
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* =========================================
                                STATUS GRID
                            ========================================= */}

                            <div className="tracking-status-grid">

                                <div className="tracking-status-box">

                                    <div className="tracking-status-icon order-status-icon">
                                        <Package
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Order Status
                                        </span>

                                        <strong>
                                            {
                                                getOrderStatusLabel()
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="tracking-status-box">

                                    <div className="tracking-status-icon payment-status-icon">
                                        <CreditCard
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Payment Status
                                        </span>

                                        <strong>
                                            {
                                                getPaymentStatusLabel()
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="tracking-status-box">

                                    <div className="tracking-status-icon fulfillment-status-icon">
                                        <Truck
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Fulfillment
                                        </span>

                                        <strong>
                                            {
                                                getFulfillmentStatusLabel()
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* =========================================
                                PROGRESS
                            ========================================= */}

                            {order.status !==
                                "cancelled" && (
                                    <div className="tracking-progress-section">

                                        <div className="tracking-progress-line">

                                            <div
                                                className={`tracking-progress-step ${progressStep >=
                                                        1
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            >

                                                <div className="progress-circle">
                                                    {progressStep >=
                                                        1 ? (
                                                        <CheckCircle2
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <Clock3
                                                            size={20}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    Order Received
                                                </span>

                                            </div>

                                            <div
                                                className={`tracking-progress-connector ${progressStep >=
                                                        2
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            ></div>

                                            <div
                                                className={`tracking-progress-step ${progressStep >=
                                                        2
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            >

                                                <div className="progress-circle">
                                                    {progressStep >=
                                                        2 ? (
                                                        <CheckCircle2
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <Clock3
                                                            size={20}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    Processing
                                                </span>

                                            </div>

                                            <div
                                                className={`tracking-progress-connector ${progressStep >=
                                                        3
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            ></div>

                                            <div
                                                className={`tracking-progress-step ${progressStep >=
                                                        3
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            >

                                                <div className="progress-circle">
                                                    {progressStep >=
                                                        3 ? (
                                                        <CheckCircle2
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <Clock3
                                                            size={20}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    Completed
                                                </span>

                                            </div>

                                        </div>

                                    </div>
                                )}

                            {/* =========================================
                                CANCELLED
                            ========================================= */}

                            {order.status ===
                                "cancelled" && (
                                    <div className="tracking-cancelled">

                                        <AlertCircle
                                            size={20}
                                        />

                                        <div>

                                            <strong>
                                                Order Cancelled
                                            </strong>

                                            <p>
                                                This order has
                                                been cancelled.
                                            </p>

                                        </div>

                                    </div>
                                )}

                            {/* =========================================
                                VOUCHER
                            ========================================= */}

                            {order.voucher && (
                                <div className="tracking-voucher">

                                    <div className="tracking-voucher-header">

                                        <span>
                                            VOUCHER /
                                            DELIVERY CODE
                                        </span>

                                    </div>

                                    <div className="tracking-voucher-value">
                                        {order.voucher}
                                    </div>

                                </div>
                            )}

                            {/* =========================================
                                PURCHASE PROOF
                            ========================================= */}

                            {order.has_purchase_proof && (
                                <div className="tracking-proof">

                                    <CheckCircle2
                                        size={19}
                                    />

                                    <div>

                                        <strong>
                                            Purchase Proof
                                            Available
                                        </strong>

                                        <p>
                                            Your payment
                                            proof has been
                                            received.
                                        </p>

                                    </div>

                                </div>
                            )}

                            {/* =========================================
                                ORDER ITEMS
                            ========================================= */}

                            {order.items &&
                                order.items.length >
                                0 && (
                                    <div className="tracking-items">

                                        <div className="tracking-section-title">
                                            Order Items
                                        </div>

                                        {order.items.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="tracking-item"
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.product_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                    </div>

                                                    <strong>
                                                        {Number(
                                                            item.subtotal
                                                        ).toLocaleString()}{" "}
                                                        {
                                                            order.currency
                                                        }
                                                    </strong>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            {/* =========================================
                                BACK TO STORE
                            ========================================= */}

                            {storeSlug && (
                                <Link
                                    to={`/${storeSlug}`}
                                    className="tracking-back-store-button"
                                >

                                    <ArrowLeft
                                        size={17}
                                    />

                                    Back to{" "}
                                    {storeName}

                                </Link>
                            )}

                        </div>
                    )}

                </section>

            </main>

            {/* =========================================================
                FOOTER
            ========================================================= */}

            <footer className="tracking-footer">

                <div className="tracking-footer-brand">

                    <img
                        src="/zaysai-logo.png"
                        alt="ZaySai"
                    />

                    <span>
                        Powered by{" "}
                        <strong>
                            ZaySai
                        </strong>
                    </span>

                </div>

            </footer>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Capitalize Status
|--------------------------------------------------------------------------
*/

function capitalizeStatus(status) {
    if (!status) {
        return "";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default OrderTrackingPage;