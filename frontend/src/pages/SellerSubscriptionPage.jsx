import { useEffect, useMemo, useRef, useState } from "react";
import {
    Check,
    Upload,
    CreditCard,
    Clock,
    XCircle,
    CheckCircle2,
    RefreshCw,
    Copy,
    QrCode,
} from "lucide-react";

import api from "../services/api";
import "./SellerSubscriptionPage.css";

function SellerSubscriptionPage() {
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [payments, setPayments] = useState([]);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState(null);
    const [paymentMethodQrUrl, setPaymentMethodQrUrl] =
        useState("");

    const [selectedPlan, setSelectedPlan] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState("");

    const [transactionReference, setTransactionReference] =
        useState("");

    const [paymentId, setPaymentId] = useState(null);
    const [proofFile, setProofFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);


    /*
    |--------------------------------------------------------------------------
    | Load Subscription Data
    |--------------------------------------------------------------------------
    */

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                subscriptionResponse,
                plansResponse,
                paymentsResponse,
                paymentMethodsResponse,
            ] = await Promise.all([
                api.get("/seller/products"),
                api.get("/seller/subscription/plans"),
                api.get("/seller/subscription/payments"),
                api.get("/seller/subscription/payment-methods"),
            ]);

            setSubscription(
                subscriptionResponse.data?.subscription ?? null
            );

            setPlans(
                plansResponse.data?.plans ?? []
            );

            setPayments(
                paymentsResponse.data?.payments ?? []
            );

            const methods =
                paymentMethodsResponse.data?.payment_methods ??
                paymentMethodsResponse.data?.methods ??
                paymentMethodsResponse.data?.data ??
                [];

            setPaymentMethods(
                Array.isArray(methods) ? methods : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to load subscription information."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Current Plan
    |--------------------------------------------------------------------------
    */

    const currentPlanId =
        subscription?.plan?.id ?? null;

    const currentPlanName =
        subscription?.plan?.name ?? "No Plan";

    const currentStatus =
        subscription?.status ?? "inactive";


    /*
    |--------------------------------------------------------------------------
    | Pending Payment
    |--------------------------------------------------------------------------
    */

    const pendingPayment = useMemo(() => {
        return payments.find(
            (payment) =>
                payment.status === "pending"
        );
    }, [payments]);


    /*
    |--------------------------------------------------------------------------
    | Payment That Needs Proof
    |--------------------------------------------------------------------------
    */

    const proofPaymentId =
        paymentId ||
        pendingPayment?.id ||
        null;


    /*
    |--------------------------------------------------------------------------
    | Select Plan
    |--------------------------------------------------------------------------
    */

    const handleSelectPlan = (plan) => {
        setError("");
        setSuccess("");

        setSelectedPlan(plan);

        setPaymentMethod("");
        setSelectedPaymentMethod(null);
        setPaymentMethodQrUrl("");

        setTransactionReference("");

        setPaymentId(null);
        setProofFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Select Payment Method
    |--------------------------------------------------------------------------
    */

    const handleSelectPaymentMethod = (event) => {
        const methodId = event.target.value;

        setPaymentMethod(methodId);

        const method =
            paymentMethods.find(
                (item) =>
                    String(item.id) ===
                    String(methodId)
            ) || null;

        setSelectedPaymentMethod(method);

        setError("");
        setSuccess("");
    };


    /*
    |--------------------------------------------------------------------------
    | Load Selected Payment Method QR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let objectUrl = "";

        const loadPaymentMethodQr = async () => {
            setPaymentMethodQrUrl("");

            if (
                !selectedPaymentMethod?.id ||
                !selectedPaymentMethod?.has_qr_image
            ) {
                return;
            }

            try {
                const response = await api.get(
                    `/seller/subscription/payment-methods/${selectedPaymentMethod.id}/qr`,
                    {
                        responseType: "blob",
                    }
                );

                objectUrl = URL.createObjectURL(
                    response.data
                );

                setPaymentMethodQrUrl(objectUrl);
            } catch (error) {
                console.error(
                    "Payment method QR loading error:",
                    error
                );

                setPaymentMethodQrUrl("");
            }
        };

        loadPaymentMethodQr();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [selectedPaymentMethod]);


    /*
    |--------------------------------------------------------------------------
    | Copy Account Number
    |--------------------------------------------------------------------------
    */

    const handleCopyAccountNumber = async () => {
        if (
            !selectedPaymentMethod?.account_number
        ) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                selectedPaymentMethod.account_number
            );

            setSuccess(
                "Account number copied."
            );

            setTimeout(() => {
                setSuccess("");
            }, 2000);
        } catch (error) {
            console.error(error);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Create Payment Request
    |--------------------------------------------------------------------------
    */

    const handleCreatePayment = async (event) => {
        event.preventDefault();

        if (!selectedPlan) {
            setError(
                "Please select a plan."
            );
            return;
        }

        if (!paymentMethod) {
            setError(
                "Please select a payment method."
            );
            return;
        }

        if (!selectedPaymentMethod) {
            setError(
                "Please select a valid payment method."
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response = await api.post(
                "/seller/subscription/payments",
                {
                    plan_id:
                        selectedPlan.id,

                    payment_method:
                        String(
                            selectedPaymentMethod.id
                        ),

                    transaction_reference:
                        transactionReference.trim() ||
                        null,
                }
            );

            const createdPayment =
                response.data?.payment;

            if (createdPayment?.id) {
                setPaymentId(
                    createdPayment.id
                );
            }

            setSuccess(
                "Payment request created. Please upload your payment proof."
            );

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to create payment request."
            );
        } finally {
            setSubmitting(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Upload Payment Proof
    |--------------------------------------------------------------------------
    */

    const handleUploadProof = async (event) => {
        event.preventDefault();

        const currentPaymentId =
            paymentId ||
            pendingPayment?.id ||
            null;

        if (!proofFile) {
            setError(
                "Please select a payment proof image."
            );
            return;
        }

        if (!currentPaymentId) {
            setError(
                "No pending payment found."
            );
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(proofFile.type)) {
            setError(
                "Please upload a JPG, PNG, or WEBP image."
            );
            return;
        }

        if (
            proofFile.size >
            5 * 1024 * 1024
        ) {
            setError(
                "Payment proof must be 5MB or smaller."
            );
            return;
        }

        try {
            setUploadingProof(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "payment_proof",
                proofFile
            );

            const response = await api.post(
                `/seller/subscription/payments/${currentPaymentId}/proof`,
                formData
            );

            setSuccess(
                response.data?.message ||
                "Payment proof uploaded successfully."
            );

            setProofFile(null);

            setPaymentId(
                currentPaymentId
            );

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await loadData();
        } catch (error) {
            console.error(
                "Payment proof upload error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.response?.data?.errors?.payment_proof?.[0] ||
                "Failed to upload payment proof."
            );
        } finally {
            setUploadingProof(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Format Price
    |--------------------------------------------------------------------------
    */

    const formatPrice = (
        price,
        currency
    ) => {
        const number =
            Number(price || 0);

        return `${number.toLocaleString()} ${currency || "MMK"
            }`;
    };


    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Plan Limit Display
    |--------------------------------------------------------------------------
    */

    const formatLimit = (
        value,
        label
    ) => {
        if (
            value === 0 ||
            value === null ||
            value === undefined
        ) {
            return `Unlimited ${label}`;
        }

        return `Up to ${value} ${label}`;
    };


    /*
    |--------------------------------------------------------------------------
    | Current Limit Display
    |--------------------------------------------------------------------------
    */

    const renderCurrentLimit = (
        current,
        max
    ) => {
        if (
            max === 0 ||
            max === null ||
            max === undefined
        ) {
            return `${current ?? 0} / Unlimited`;
        }

        return `${current ?? 0} / ${max}`;
    };


    /*
    |--------------------------------------------------------------------------
    | Status Badge
    |--------------------------------------------------------------------------
    */

    const renderStatus = (
        status
    ) => {
        if (status === "approved") {
            return (
                <span className="subscription-status approved">
                    <CheckCircle2 size={14} />
                    Approved
                </span>
            );
        }

        if (status === "rejected") {
            return (
                <span className="subscription-status rejected">
                    <XCircle size={14} />
                    Rejected
                </span>
            );
        }

        return (
            <span className="subscription-status pending">
                <Clock size={14} />
                Pending
            </span>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Payment Method Name
    |--------------------------------------------------------------------------
    */

    const getPaymentMethodName = (
        payment
    ) => {
        if (!payment?.payment_method) {
            return "-";
        }

        const method =
            paymentMethods.find(
                (item) =>
                    String(item.id) ===
                    String(
                        payment.payment_method
                    )
            );

        return (
            method?.name ||
            payment.payment_method
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="seller-subscription-page">
                <div className="subscription-loading">
                    <RefreshCw
                        size={22}
                        className="spin"
                    />

                    <span>
                        Loading subscription...
                    </span>
                </div>
            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="seller-subscription-page">


            {/* =========================================================
                Header
            ========================================================= */}

            <div className="subscription-page-header">

                <div>

                    <h1>
                        Subscription
                    </h1>

                    <p>
                        Manage your ZaySai subscription
                        and upgrade your plan.
                    </p>

                </div>


                <button
                    type="button"
                    className="subscription-refresh-btn"
                    onClick={loadData}
                >
                    <RefreshCw size={16} />

                    Refresh
                </button>

            </div>



            {/* =========================================================
                Messages
            ========================================================= */}

            {error && (
                <div className="subscription-alert error">

                    <XCircle size={18} />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {success && (
                <div className="subscription-alert success">

                    <CheckCircle2 size={18} />

                    <span>
                        {success}
                    </span>

                </div>
            )}



            {/* =========================================================
                Current Subscription
            ========================================================= */}

            <section className="current-subscription-card">

                <div className="current-subscription-main">

                    <div>

                        <span className="section-eyebrow">
                            CURRENT PLAN
                        </span>

                        <h2>
                            {currentPlanName}
                        </h2>


                        <div className="current-status-row">

                            {currentStatus === "active" ? (

                                <span className="subscription-status approved">

                                    <CheckCircle2 size={14} />

                                    Active

                                </span>

                            ) : currentStatus === "trial" ? (

                                <span className="subscription-status pending">

                                    <Clock size={14} />

                                    Free Trial

                                </span>

                            ) : (

                                <span className="subscription-status rejected">

                                    <XCircle size={14} />

                                    {currentStatus}

                                </span>

                            )}

                        </div>

                    </div>



                    <div className="current-subscription-meta">

                        <div className="subscription-meta-item">

                            <span>
                                Products
                            </span>

                            <strong>
                                {renderCurrentLimit(
                                    subscription?.current_products,
                                    subscription?.plan?.max_products
                                )}
                            </strong>

                        </div>


                        <div className="subscription-meta-item">

                            <span>
                                Orders
                            </span>

                            <strong>
                                {renderCurrentLimit(
                                    subscription?.current_orders,
                                    subscription?.plan?.max_orders
                                )}
                            </strong>

                        </div>


                        <div className="subscription-meta-item">

                            <span>
                                Starts
                            </span>

                            <strong>
                                {formatDate(
                                    subscription?.starts_at
                                )}
                            </strong>

                        </div>


                        <div className="subscription-meta-item">

                            <span>
                                Ends
                            </span>

                            <strong>
                                {formatDate(
                                    subscription?.ends_at
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>



            {/* =========================================================
                Pending Payment
            ========================================================= */}

            {pendingPayment && (
                <section className="pending-payment-card">

                    <div className="pending-payment-icon">

                        <Clock size={22} />

                    </div>


                    <div className="pending-payment-content">

                        <strong>
                            Payment Under Review
                        </strong>

                        <p>
                            You already have a pending
                            subscription payment for{" "}

                            <strong>
                                {pendingPayment.plan?.name ||
                                    "your selected plan"}
                            </strong>.
                        </p>

                        <span>
                            {formatPrice(
                                pendingPayment.amount,
                                pendingPayment.currency
                            )}
                        </span>

                    </div>

                </section>
            )}



            {/* =========================================================
                Available Plans
            ========================================================= */}

            <section className="plans-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Available Plans
                        </h2>

                        <p>
                            Choose the plan that fits
                            your store.
                        </p>

                    </div>

                </div>


                <div className="plans-grid">

                    {plans.map((plan) => {

                        const isCurrent =
                            Number(plan.id) ===
                            Number(currentPlanId);

                        const isSelected =
                            Number(selectedPlan?.id) ===
                            Number(plan.id);

                        const hasPending =
                            Boolean(pendingPayment);

                        return (

                            <div
                                key={plan.id}
                                className={
                                    isSelected
                                        ? "plan-card selected"
                                        : isCurrent
                                            ? "plan-card current"
                                            : "plan-card"
                                }
                            >

                                {isCurrent && (
                                    <div className="current-plan-badge">
                                        Current Plan
                                    </div>
                                )}


                                <div className="plan-card-header">

                                    <h3>
                                        {plan.name}
                                    </h3>


                                    <div className="plan-price">

                                        <strong>
                                            {formatPrice(
                                                plan.price,
                                                plan.currency
                                            )}
                                        </strong>

                                        <span>
                                            /{" "}
                                            {plan.billing_cycle ||
                                                "month"}
                                        </span>

                                    </div>

                                </div>



                                <div className="plan-features">


                                    <div>

                                        <Check size={16} />

                                        <span>
                                            {formatLimit(
                                                plan.max_products,
                                                "products"
                                            )}
                                        </span>

                                    </div>


                                    <div>

                                        <Check size={16} />

                                        <span>
                                            {formatLimit(
                                                plan.max_orders,
                                                "orders"
                                            )}
                                        </span>

                                    </div>


                                    {plan.custom_domain && (

                                        <div>

                                            <Check size={16} />

                                            <span>
                                                Custom domain
                                            </span>

                                        </div>

                                    )}


                                    {plan.remove_branding && (

                                        <div>

                                            <Check size={16} />

                                            <span>
                                                Remove ZaySai
                                                branding
                                            </span>

                                        </div>

                                    )}


                                    {plan.advanced_analytics && (

                                        <div>

                                            <Check size={16} />

                                            <span>
                                                Advanced analytics
                                            </span>

                                        </div>

                                    )}


                                    {plan.priority_support && (

                                        <div>

                                            <Check size={16} />

                                            <span>
                                                Priority support
                                            </span>

                                        </div>

                                    )}

                                </div>



                                <button
                                    type="button"
                                    className={
                                        isCurrent
                                            ? "plan-select-btn disabled"
                                            : "plan-select-btn"
                                    }
                                    disabled={
                                        isCurrent ||
                                        hasPending
                                    }
                                    onClick={() =>
                                        handleSelectPlan(
                                            plan
                                        )
                                    }
                                >

                                    {isCurrent
                                        ? "Current Plan"
                                        : hasPending
                                            ? "Payment Pending"
                                            : isSelected
                                                ? "Selected"
                                                : "Choose Plan"}

                                </button>

                            </div>

                        );
                    })}

                </div>

            </section>



            {/* =========================================================
                Payment Form
            ========================================================= */}

            {selectedPlan && !pendingPayment && (

                <section className="subscription-payment-section">


                    <div className="payment-section-header">

                        <div>

                            <span className="section-eyebrow">
                                UPGRADE
                            </span>

                            <h2>
                                Subscribe to{" "}
                                {selectedPlan.name}
                            </h2>

                            <p>
                                Complete your payment
                                details below.
                            </p>

                        </div>


                        <div className="selected-plan-price">

                            {formatPrice(
                                selectedPlan.price,
                                selectedPlan.currency
                            )}

                        </div>

                    </div>



                    {/* =====================================================
                        Payment Details
                    ===================================================== */}

                    <form
                        className="subscription-payment-form"
                        onSubmit={
                            handleCreatePayment
                        }
                    >

                        <div className="form-grid">


                            {/* =================================================
                                Payment Method
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Payment Method
                                </label>


                                <div className="input-with-icon">

                                    <CreditCard
                                        size={17}
                                    />


                                    <select
                                        value={
                                            paymentMethod
                                        }
                                        onChange={
                                            handleSelectPaymentMethod
                                        }
                                    >

                                        <option value="">
                                            Select payment method
                                        </option>


                                        {paymentMethods.map(
                                            (method) => (

                                                <option
                                                    key={
                                                        method.id
                                                    }
                                                    value={
                                                        method.id
                                                    }
                                                >
                                                    {method.name}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {paymentMethods.length === 0 && (

                                    <small className="form-help-text">
                                        No payment methods are currently
                                        available. Please contact ZaySai support.
                                    </small>

                                )}

                            </div>



                            {/* =================================================
                                Transaction Reference
                            ================================================= */}

                            <div className="form-group">

                                <label>

                                    Transaction Reference

                                    <span>
                                        Optional
                                    </span>

                                </label>


                                <input
                                    type="text"
                                    placeholder="Transaction ID / Reference"
                                    value={
                                        transactionReference
                                    }
                                    onChange={(event) =>
                                        setTransactionReference(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>



                        {/* =====================================================
                            Selected Payment Method Details
                        ===================================================== */}

                        {selectedPaymentMethod && (

                            <div className="payment-method-details-card">

                                <div className="payment-method-details-header">

                                    <div>

                                        <span className="section-eyebrow">
                                            PAYMENT ACCOUNT
                                        </span>

                                        <h3>
                                            {
                                                selectedPaymentMethod.name
                                            }
                                        </h3>

                                    </div>

                                    <CreditCard
                                        size={22}
                                    />

                                </div>



                                <div className="payment-account-grid">


                                    {/* Account Name */}

                                    {selectedPaymentMethod.account_name && (

                                        <div className="payment-account-item">

                                            <span>
                                                Account Name
                                            </span>

                                            <strong>
                                                {
                                                    selectedPaymentMethod.account_name
                                                }
                                            </strong>

                                        </div>

                                    )}



                                    {/* Account Number */}

                                    {selectedPaymentMethod.account_number && (

                                        <div className="payment-account-item">

                                            <span>
                                                Account Number
                                            </span>


                                            <div className="payment-account-number">

                                                <strong>
                                                    {
                                                        selectedPaymentMethod.account_number
                                                    }
                                                </strong>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCopyAccountNumber
                                                    }
                                                    title="Copy account number"
                                                >
                                                    <Copy
                                                        size={15}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>



                                {/* Instructions */}

                                {selectedPaymentMethod.instructions && (

                                    <div className="payment-method-instructions">

                                        <strong>
                                            Payment Instructions
                                        </strong>

                                        <p>
                                            {
                                                selectedPaymentMethod.instructions
                                            }
                                        </p>

                                    </div>

                                )}



                                {/* =================================================
                                    QR Code
                                ================================================= */}

                                {selectedPaymentMethod.has_qr_image && (

                                    <div className="payment-method-qr-section">

                                        <div className="payment-method-qr-header">

                                            <QrCode
                                                size={18}
                                            />

                                            <strong>
                                                Scan to Pay
                                            </strong>

                                        </div>


                                        <div className="payment-method-qr-wrapper">

                                            {paymentMethodQrUrl ? (
                                                <img
                                                    src={
                                                        paymentMethodQrUrl
                                                    }
                                                    alt={`${selectedPaymentMethod.name} QR Code`}
                                                    className="payment-method-qr-image"
                                                />
                                            ) : (
                                                <div className="payment-method-qr-loading">
                                                    <RefreshCw
                                                        size={18}
                                                        className="spin"
                                                    />
                                                    <span>
                                                        Loading QR code...
                                                    </span>
                                                </div>
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}



                        {/* =====================================================
                            General Payment Instructions
                        ===================================================== */}

                        {!selectedPaymentMethod && (

                            <div className="payment-instruction-box">

                                <strong>
                                    Payment Instructions
                                </strong>

                                <p>
                                    Select a payment method above
                                    to view the account details
                                    and payment instructions.
                                </p>

                            </div>

                        )}



                        {/* =====================================================
                            Create Payment
                        ===================================================== */}

                        <button
                            type="submit"
                            className="create-payment-btn"
                            disabled={
                                submitting ||
                                !selectedPaymentMethod ||
                                paymentMethods.length === 0
                            }
                        >

                            {submitting ? (

                                <>

                                    <RefreshCw
                                        size={17}
                                        className="spin"
                                    />

                                    Creating...

                                </>

                            ) : (

                                <>

                                    <CreditCard
                                        size={17}
                                    />

                                    Create Payment Request

                                </>

                            )}

                        </button>

                    </form>

                </section>

            )}



            {/* =========================================================
                Upload Payment Proof
            ========================================================= */}

            {proofPaymentId && (

                <section className="subscription-payment-section">

                    <div className="proof-upload-form">

                        <div className="proof-upload-header">

                            <div>

                                <span className="section-eyebrow">
                                    PAYMENT PROOF
                                </span>

                                <h3>
                                    Upload Payment Proof
                                </h3>

                                <p>
                                    Upload a clear
                                    screenshot of your
                                    payment.
                                </p>

                            </div>


                            <Upload
                                size={22}
                            />

                        </div>



                        <form
                            onSubmit={
                                handleUploadProof
                            }
                        >

                            <label className="file-upload-box">

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(event) => {

                                        const file =
                                            event.target.files?.[0] ||
                                            null;

                                        setProofFile(
                                            file
                                        );

                                        setError("");
                                        setSuccess("");
                                    }}
                                />


                                <Upload
                                    size={24}
                                />


                                <strong>
                                    {proofFile
                                        ? proofFile.name
                                        : "Choose payment screenshot"}
                                </strong>


                                <span>
                                    JPG, PNG, WEBP · Max 5MB
                                </span>

                            </label>



                            <button
                                type="submit"
                                className="upload-proof-btn"
                                disabled={
                                    uploadingProof ||
                                    !proofFile
                                }
                            >

                                {uploadingProof ? (

                                    <>

                                        <RefreshCw
                                            size={17}
                                            className="spin"
                                        />

                                        Uploading...

                                    </>

                                ) : (

                                    <>

                                        <Upload
                                            size={17}
                                        />

                                        Upload Proof

                                    </>

                                )}

                            </button>

                        </form>

                    </div>

                </section>

            )}



            {/* =========================================================
                Payment History
            ========================================================= */}

            <section className="payment-history-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Payment History
                        </h2>

                        <p>
                            Your subscription payment
                            requests.
                        </p>

                    </div>

                </div>



                {payments.length === 0 ? (

                    <div className="empty-payment-history">

                        <CreditCard
                            size={28}
                        />

                        <strong>
                            No payment history
                        </strong>

                        <span>
                            Your subscription payments
                            will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="payment-table-wrap">

                        <table className="payment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Plan
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Payment Method
                                    </th>

                                    <th>
                                        Reference
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

                                {payments.map(
                                    (payment) => (

                                        <tr
                                            key={
                                                payment.id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        payment
                                                            .plan
                                                            ?.name
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                {formatPrice(
                                                    payment.amount,
                                                    payment.currency
                                                )}

                                            </td>


                                            <td>

                                                {getPaymentMethodName(
                                                    payment
                                                )}

                                            </td>


                                            <td>

                                                {
                                                    payment.transaction_reference ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {renderStatus(
                                                    payment.status
                                                )}

                                            </td>


                                            <td>

                                                {formatDate(
                                                    payment.created_at
                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}

export default SellerSubscriptionPage;