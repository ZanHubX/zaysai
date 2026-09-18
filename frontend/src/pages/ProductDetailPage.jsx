import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Copy,
    CreditCard,
    Landmark,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Store,
    Wallet,
} from "lucide-react";

import api from "../services/api";
import "./ProductDetailPage.css";

// Replace this with your real admin Telegram username (without @).
const ADMIN_TELEGRAM_USERNAME = "GameHubAdmin";

function ProductDetailPage() {
    const { slug, productSlug } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [orderSuccess, setOrderSuccess] = useState(null);

    const [quantity, setQuantity] = useState(1);

    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState("");

    const [copiedPaymentId, setCopiedPaymentId] = useState(null);
    const [copiedOrder, setCopiedOrder] = useState(false);

    const [paymentProof, setPaymentProof] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState("");

    const [form, setForm] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        contact_platform: "",
        contact_name: "",
        contact_username: "",
        contact_link: "",
        notes: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Load Product + Store
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const [productResponse, storeResponse] =
                    await Promise.all([
                        api.get(
                            `/stores/${slug}/products/${productSlug}`
                        ),

                        api.get(`/stores/${slug}`),
                    ]);

                setProduct(productResponse.data.product);
                setStore(storeResponse.data.store);
            } catch (err) {
                console.error(err);

                setError(
                    "This product could not be found or is no longer available."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug, productSlug]);

    /*
    |--------------------------------------------------------------------------
    | Load Payment Methods
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const loadPaymentMethods = async () => {
            try {
                setPaymentLoading(true);

                const response = await api.get(
                    `/stores/${slug}/payment-methods`
                );

                const methods =
                    response.data.payment_methods || [];

                setPaymentMethods(methods);

                if (methods.length > 0) {
                    setSelectedPaymentMethod(
                        String(methods[0].id)
                    );
                }
            } catch (err) {
                console.error(err);
                setPaymentMethods([]);
            } finally {
                setPaymentLoading(false);
            }
        };

        loadPaymentMethods();
    }, [slug]);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Quantity
    |--------------------------------------------------------------------------
    */

    const increaseQuantity = () => {
        setQuantity((current) => current + 1);
    };

    const decreaseQuantity = () => {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Payment Icon
    |--------------------------------------------------------------------------
    */

    const getPaymentIcon = (type) => {
        if (type === "bank") {
            return <Landmark size={23} />;
        }

        if (type === "wavepay") {
            return <Wallet size={23} />;
        }

        return <CreditCard size={23} />;
    };

    /*
    |--------------------------------------------------------------------------
    | Payment Name
    |--------------------------------------------------------------------------
    */

    const getPaymentName = (type) => {
        if (type === "wavepay") {
            return "WavePay";
        }

        if (type === "bank") {
            return "Bank Transfer";
        }

        return "KPay";
    };

    /*
    |--------------------------------------------------------------------------
    | Copy Account Number
    |--------------------------------------------------------------------------
    */

    const handleCopyPaymentNumber = async (
        number,
        paymentId
    ) => {
        try {
            await navigator.clipboard.writeText(number);

            setCopiedPaymentId(paymentId);

            setTimeout(() => {
                setCopiedPaymentId(null);
            }, 2000);
        } catch (err) {
            console.error(err);

            setError(
                "Unable to copy the account number."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Payment Screenshot
    |--------------------------------------------------------------------------
    */

    const handleCopyOrderNumber = async () => {
        try {
            await navigator.clipboard.writeText(orderSuccess.order_number);

            setCopiedOrder(true);
            setError("");

            setTimeout(() => {
                setCopiedOrder(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Unable to copy the order number.");
        }
    };

    const handleTrackOrder = () => {
        if (!orderSuccess) {
            return;
        }

        navigate("/track-order", {
            state: {
                orderNumber: orderSuccess.order_number,
                phone: form.customer_phone,
            },
        });
    };

    const handleContactAdmin = () => {
        if (!orderSuccess) {
            return;
        }

        const orderNumber = orderSuccess.order_number;
        const productName = product?.name || "Product";
        const total = `${Number(orderSuccess.total).toLocaleString()} ${orderSuccess.currency}`;

        const message = `Hello Admin,

I have placed an order.

Order Number: ${orderNumber}
Product: ${productName}
Total: ${total}

Please check my order and payment proof.

Thank you.`;

        const telegramUrl = `https://t.me/${ADMIN_TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

        window.open(telegramUrl, "_blank", "noopener,noreferrer");
    };

    const handlePaymentProofChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setPaymentProof(null);
            setPaymentProofPreview("");
            return;
        }

        setPaymentProof(file);

        const previewUrl = URL.createObjectURL(file);

        setPaymentProofPreview(previewUrl);

        setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Submit Order
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!product) {
            return;
        }

        if (!selectedPaymentMethod) {
            setError(
                "Please select a payment method."
            );

            return;
        }

        if (!paymentProof) {
            setError(
                "Please upload your payment screenshot before placing the order."
            );

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const formData = new FormData();

            formData.append(
                "customer_name",
                form.customer_name
            );

            formData.append(
                "customer_phone",
                form.customer_phone
            );

            if (form.customer_email) {
                formData.append(
                    "customer_email",
                    form.customer_email
                );
            }

            if (form.contact_platform) {
                formData.append(
                    "contact_platform",
                    form.contact_platform
                );
            }

            if (form.contact_name) {
                formData.append(
                    "contact_name",
                    form.contact_name
                );
            }

            if (form.contact_username) {
                formData.append(
                    "contact_username",
                    form.contact_username
                );
            }

            if (form.contact_link) {
                formData.append(
                    "contact_link",
                    form.contact_link
                );
            }

            if (form.notes) {
                formData.append(
                    "notes",
                    form.notes
                );
            }

            formData.append(
                "payment_method_id",
                Number(selectedPaymentMethod)
            );

            formData.append(
                "items[0][product_id]",
                product.id
            );

            formData.append(
                "items[0][quantity]",
                Number(quantity)
            );

            formData.append(
                "payment_proof",
                paymentProof
            );

            const response = await api.post(
                `/stores/${slug}/orders`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            setOrderSuccess(response.data.order);
        } catch (err) {
            console.error(err);

            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(validationErrors)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : "Unable to place your order."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to place your order. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="product-detail-state">
                <Package size={38} />

                <p>Loading product...</p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Product Error
    |--------------------------------------------------------------------------
    */

    if (!product || (error && !store)) {
        return (
            <div className="product-detail-state">
                <Package size={38} />

                <h2>Product unavailable</h2>

                <p>{error}</p>

                <Link
                    to={`/${slug}`}
                    className="detail-back-button"
                >
                    <ArrowLeft size={16} />

                    Back to Store
                </Link>
            </div>
        );
    }

    const displayTotal =
        Number(product.price) * quantity;

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div className="product-detail-page">

            {/* Navbar */}

            <nav className="product-detail-nav">

                <Link
                    to={`/${slug}`}
                    className="detail-store-brand"
                >
                    <div className="detail-store-icon">
                        {store?.logo ? (
                            <img
                                src={store.logo}
                                alt={store.name}
                            />
                        ) : (
                            <Store size={19} />
                        )}
                    </div>

                    <div>
                        <strong>
                            {store?.name || "Store"}
                        </strong>

                        <span>
                            Back to storefront
                        </span>
                    </div>
                </Link>

                <div className="detail-zaysai-brand">
                    <span>Powered by</span>

                    <img
                        src="/zaysai-logo.png"
                        alt="ZaySai"
                    />

                    <strong>ZaySai</strong>
                </div>

            </nav>

            {/* Main */}

            <main className="product-detail-container">

                <Link
                    to={`/${slug}`}
                    className="detail-back-link"
                >
                    <ArrowLeft size={15} />

                    Back to products
                </Link>

                <div className="product-detail-grid">

                    {/* Product */}

                    <section className="product-information">

                        <div className="detail-product-image">

                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                />
                            ) : (
                                <div className="detail-image-placeholder">
                                    <Package size={54} />
                                </div>
                            )}

                            <span className="detail-available">
                                Available
                            </span>

                        </div>

                        <div className="detail-product-copy">

                            <span className="detail-category">
                                DIGITAL PRODUCT
                            </span>

                            <h1>
                                {product.name}
                            </h1>

                            <p className="detail-description">
                                {product.description ||
                                    "No description is available for this product."}
                            </p>

                            <div className="detail-price">

                                <strong>
                                    {Number(
                                        product.price
                                    ).toLocaleString()}
                                </strong>

                                <span>
                                    {product.currency}
                                </span>

                            </div>

                            <div className="detail-trust">

                                <div>
                                    <ShieldCheck size={17} />

                                    <span>
                                        Order handled directly by{" "}
                                        {store?.name}
                                    </span>
                                </div>

                                <div>
                                    <ShoppingBag size={17} />

                                    <span>
                                        Simple direct ordering
                                    </span>
                                </div>

                            </div>

                        </div>

                    </section>

                    {/* Order */}

                    <aside className="order-panel">

                        {orderSuccess ? (

                            <div className="order-success">

                                <div className="order-success-icon">
                                    <CheckCircle2 size={30} />
                                </div>

                                <span className="success-label">
                                    ORDER RECEIVED
                                </span>

                                <h2>
                                    Thank you for your order.
                                </h2>

                                <p>
                                    Your order has been sent to{" "}
                                    {store?.name}.
                                </p>

                                <div className="order-number-box">

                                    <span className="order-number-label">
                                        Order number
                                    </span>

                                    <div className="order-number-row">

                                        <strong>
                                            {orderSuccess.order_number}
                                        </strong>

                                        <button
                                            type="button"
                                            className="copy-order-button"
                                            onClick={handleCopyOrderNumber}
                                        >
                                            {copiedOrder ? (
                                                <>
                                                    <Check size={15} />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={15} />
                                                    Copy
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="contact-admin-button"
                                    onClick={handleTrackOrder}
                                >
                                    Track My Order
                                </button>

                                <button
                                    type="button"
                                    className="contact-admin-button"
                                    onClick={handleContactAdmin}
                                >
                                    Contact Admin
                                </button>

                                <p className="contact-admin-hint">
                                    Please send your order number to the admin to continue your order.
                                    <br />
                                    အော်ဒါကို ဆက်လက်ဆောင်ရွက်ပေးနိုင်ရန် သင့်အော်ဒါနံပါတ်ကို Admin ထံ ပေးပို့ပေးပါ။
                                </p>

                                <div className="success-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {Number(
                                            orderSuccess.total
                                        ).toLocaleString()}{" "}
                                        {
                                            orderSuccess.currency
                                        }
                                    </strong>

                                </div>

                                <Link
                                    to={`/${slug}`}
                                    className="continue-shopping"
                                >
                                    Continue Shopping
                                </Link>

                            </div>

                        ) : (

                            <>
                                <div className="order-panel-header">

                                    <span>
                                        PLACE ORDER
                                    </span>

                                    <h2>
                                        Order this product
                                    </h2>

                                    <p>
                                        Enter your contact details
                                        and choose your payment method.
                                    </p>

                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="public-order-form"
                                >

                                    {/* Quantity */}

                                    <div className="order-field">

                                        <label>
                                            Quantity
                                        </label>

                                        <div className="quantity-control">

                                            <button
                                                type="button"
                                                onClick={
                                                    decreaseQuantity
                                                }
                                                disabled={
                                                    quantity <= 1
                                                }
                                            >
                                                <Minus size={15} />
                                            </button>

                                            <span>
                                                {quantity}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={
                                                    increaseQuantity
                                                }
                                            >
                                                <Plus size={15} />
                                            </button>

                                        </div>

                                    </div>

                                    {/* Name */}

                                    <div className="order-field">

                                        <label>
                                            Full name <span>Required</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="customer_name"
                                            value={
                                                form.customer_name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Your name"
                                            required
                                        />

                                    </div>

                                    {/* Phone */}

                                    <div className="order-field">

                                        <label>
                                            Phone number <span>Required</span>
                                        </label>

                                        <input
                                            type="tel"
                                            name="customer_phone"
                                            value={
                                                form.customer_phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="09xxxxxxxxx"
                                            required
                                        />

                                    </div>

                                    {/* Email */}

                                    <div className="order-field">

                                        <label>
                                            Email{" "}
                                            <span>
                                                Optional
                                            </span>
                                        </label>

                                        <input
                                            type="email"
                                            name="customer_email"
                                            value={
                                                form.customer_email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="you@example.com"
                                        />

                                    </div>

                                    {/* Customer Contact Account */}

                                    <div className="contact-account-section">
                                        <div className="contact-account-header">
                                            <strong>
                                                Contact Account
                                            </strong>
                                            <span>
                                                We may use this account to contact you about your order.
                                                <br />
                                                သင့်အော်ဒါအတွက် လိုအပ်ပါက ဒီအကောင့်ကနေ ဆက်သွယ်ပေးပါမယ်။
                                            </span>
                                        </div>

                                        <div className="contact-account-grid">
                                            <div className="contact-account-field">
                                                <label>
                                                    Platform{" "}
                                                    <span>Optional</span>
                                                </label>

                                                <select
                                                    name="contact_platform"
                                                    value={
                                                        form.contact_platform
                                                    }
                                                    onChange={handleChange}
                                                >
                                                    <option value="">
                                                        Select platform
                                                    </option>
                                                    <option value="telegram">
                                                        Telegram
                                                    </option>
                                                    <option value="facebook">
                                                        Facebook
                                                    </option>
                                                    <option value="discord">
                                                        Discord
                                                    </option>
                                                    <option value="game_account">
                                                        Game Account
                                                    </option>
                                                    <option value="other">
                                                        Other
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="contact-account-field">
                                                <label>
                                                    Username / Account ID{" "}
                                                    <span>Optional</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="contact_username"
                                                    value={
                                                        form.contact_username
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="@username / Game ID"
                                                />
                                            </div>

                                            <div className="contact-account-field full-width">
                                                <label>
                                                    Account Name{" "}
                                                    <span>Optional</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="contact_name"
                                                    value={form.contact_name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. John Gaming"
                                                />

                                                <small className="contact-account-hint">
                                                    Profile link can be added
                                                    later if needed.
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}

                                    <div className="order-field">

                                        <label>
                                            Payment Method
                                        </label>

                                        {paymentLoading ? (

                                            <div className="payment-loading">
                                                Loading payment methods...
                                            </div>

                                        ) : paymentMethods.length ===
                                            0 ? (

                                            <div className="payment-unavailable">
                                                This store has no active
                                                payment methods yet.
                                            </div>

                                        ) : (

                                            <div className="public-payment-methods">

                                                {paymentMethods.map(
                                                    (paymentMethod) => {

                                                        const isSelected =
                                                            selectedPaymentMethod ===
                                                            String(
                                                                paymentMethod.id
                                                            );

                                                        const isCopied =
                                                            copiedPaymentId ===
                                                            paymentMethod.id;

                                                        return (
                                                            <div
                                                                key={
                                                                    paymentMethod.id
                                                                }
                                                                className={
                                                                    isSelected
                                                                        ? "public-payment-card selected"
                                                                        : "public-payment-card"
                                                                }
                                                                onClick={() =>
                                                                    setSelectedPaymentMethod(
                                                                        String(
                                                                            paymentMethod.id
                                                                        )
                                                                    )
                                                                }
                                                            >

                                                                {/* Header */}

                                                                <div className="payment-card-header">

                                                                    <div className="payment-card-title">

                                                                        <div className="public-payment-icon">
                                                                            {getPaymentIcon(
                                                                                paymentMethod.type
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                {getPaymentName(
                                                                                    paymentMethod.type
                                                                                )}
                                                                            </strong>

                                                                            <span>
                                                                                {paymentMethod.account_name}
                                                                            </span>
                                                                        </div>

                                                                    </div>

                                                                    <div
                                                                        className={
                                                                            isSelected
                                                                                ? "payment-check selected"
                                                                                : "payment-check"
                                                                        }
                                                                    >
                                                                        {isSelected && (
                                                                            <Check
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>

                                                                </div>

                                                                {/* Account Number */}

                                                                <div className="payment-number-section">

                                                                    <span className="payment-number-label">
                                                                        Account Number
                                                                    </span>

                                                                    <div className="payment-number-box">

                                                                        <strong>
                                                                            {
                                                                                paymentMethod.account_number
                                                                            }
                                                                        </strong>

                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                isCopied
                                                                                    ? "copy-payment-button copied"
                                                                                    : "copy-payment-button"
                                                                            }
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();

                                                                                handleCopyPaymentNumber(
                                                                                    paymentMethod.account_number,
                                                                                    paymentMethod.id
                                                                                );
                                                                            }}
                                                                        >
                                                                            {isCopied
                                                                                ? "Copied"
                                                                                : "Copy"}
                                                                        </button>

                                                                    </div>

                                                                </div>

                                                                {/* Instructions */}

                                                                {paymentMethod.instructions && (
                                                                    <div className="payment-instructions">
                                                                        {
                                                                            paymentMethod.instructions
                                                                        }
                                                                    </div>
                                                                )}

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        )}

                                    </div>

                                    {/* Payment Screenshot */}

                                    <div className="order-field">

                                        <label>
                                            Payment Screenshot{" "}
                                            <span>
                                                Required
                                            </span>
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handlePaymentProofChange
                                            }
                                            required
                                        />

                                        {paymentProofPreview && (
                                            <div className="payment-proof-preview">

                                                <img
                                                    src={
                                                        paymentProofPreview
                                                    }
                                                    alt="Payment proof preview"
                                                />

                                                <div>
                                                    <strong>
                                                        Screenshot selected
                                                    </strong>

                                                    <span>
                                                        {paymentProof.name}
                                                    </span>
                                                </div>

                                            </div>
                                        )}

                                        {!paymentProof && (
                                            <small>
                                                Upload your payment screenshot
                                                before placing the order.
                                            </small>
                                        )}

                                    </div>

                                    {/* Note */}

                                    <div className="order-field">

                                        <label>
                                            Note{" "}
                                            <span>
                                                Optional
                                            </span>
                                        </label>

                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Add any details for the seller..."
                                        />

                                    </div>

                                    {/* Error */}

                                    {error && (
                                        <div className="public-order-error">
                                            {error}
                                        </div>
                                    )}

                                    {/* Summary */}

                                    <div className="order-summary">

                                        <div>

                                            <span>
                                                {quantity} ×{" "}
                                                {Number(
                                                    product.price
                                                ).toLocaleString()}
                                            </span>

                                            <span>
                                                Total
                                            </span>

                                        </div>

                                        <strong>
                                            {displayTotal.toLocaleString()}{" "}
                                            {product.currency}
                                        </strong>

                                    </div>

                                    {/* Submit */}

                                    <button
                                        type="submit"
                                        className="place-order-button"
                                        disabled={
                                            submitting ||
                                            paymentLoading ||
                                            paymentMethods.length ===
                                            0 ||
                                            !paymentProof
                                        }
                                    >
                                        <ShoppingBag size={17} />

                                        {submitting
                                            ? "Submitting..."
                                            : "Place Order"}
                                    </button>

                                    <p className="backend-price-note">
                                        Final order total is verified
                                        securely by the store.
                                    </p>

                                </form>
                            </>

                        )}

                    </aside>

                </div>

            </main>

            {/* Footer */}

            <footer className="product-detail-footer">

                <div>

                    <img
                        src="/zaysai-logo.png"
                        alt="ZaySai"
                    />

                    <span>
                        Store powered by{" "}
                        <strong>ZaySai</strong>
                    </span>

                </div>

                <p>
                    © {new Date().getFullYear()}{" "}
                    {store?.name}
                </p>

            </footer>

        </div>
    );
}

export default ProductDetailPage;