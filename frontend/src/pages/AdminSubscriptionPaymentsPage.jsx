import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    CheckCircle2,
    Clock3,
    Eye,
    Image as ImageIcon,
    ImageOff,
    RefreshCw,
    XCircle,
    AlertCircle,
    CreditCard,
    User,
    Mail,
    Calendar,
    Hash,
    Wallet,
    X,
} from "lucide-react";

import api from "../services/api";

import "./AdminSubscriptionPaymentsPage.css";


function AdminSubscriptionPaymentsPage() {

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [payments, setPayments] =
        useState([]);

    const [stats, setStats] =
        useState({
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Selected payment
    |--------------------------------------------------------------------------
    */

    const [selectedPayment, setSelectedPayment] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Proof
    |--------------------------------------------------------------------------
    */

    const [proofUrl, setProofUrl] =
        useState(null);

    const [loadingProof, setLoadingProof] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Action loading
    |--------------------------------------------------------------------------
    */

    const [actionLoading, setActionLoading] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Reject modal
    |--------------------------------------------------------------------------
    */

    const [showRejectModal, setShowRejectModal] =
        useState(false);

    const [rejectionReason, setRejectionReason] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Payments
    |--------------------------------------------------------------------------
    */

    const loadPayments = useCallback(
        async (showRefresh = false) => {

            try {

                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await api.get(
                    "/admin/subscription-payments"
                );

                const data =
                    response.data || {};

                setPayments(
                    data.payments || []
                );

                setStats({
                    pending:
                        data.stats?.pending ??
                        data.payments?.filter(
                            (item) =>
                                item.status ===
                                "pending"
                        ).length ??
                        0,

                    approved:
                        data.stats?.approved ??
                        data.payments?.filter(
                            (item) =>
                                item.status ===
                                "approved"
                        ).length ??
                        0,

                    rejected:
                        data.stats?.rejected ??
                        data.payments?.filter(
                            (item) =>
                                item.status ===
                                "rejected"
                        ).length ??
                        0,

                    total:
                        data.stats?.total ??
                        data.total ??
                        data.payments?.length ??
                        0,
                });

            } catch (error) {

                console.error(
                    "Failed to load subscription payments:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    "Failed to load subscription payments."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );


    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadPayments();

    }, [loadPayments]);


    /*
    |--------------------------------------------------------------------------
    | Cleanup proof URL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        return () => {

            if (proofUrl) {
                URL.revokeObjectURL(
                    proofUrl
                );
            }

        };

    }, [proofUrl]);


    /*
    |--------------------------------------------------------------------------
    | Format Money
    |--------------------------------------------------------------------------
    */

    const formatMoney = (
        amount,
        currency = "MMK"
    ) => {

        if (
            amount === null ||
            amount === undefined
        ) {
            return "-";
        }

        return `${Number(amount).toLocaleString()} ${currency}`;
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

        try {

            return new Date(
                date
            ).toLocaleString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }
            );

        } catch {
            return date;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Seller Name
    |--------------------------------------------------------------------------
    */

    const getSellerName = (
        payment
    ) => {

        return (
            payment?.seller?.name ||
            "Unknown Seller"
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Open Payment
    |--------------------------------------------------------------------------
    */

    const handleViewPayment = async (
        payment
    ) => {

        /*
        |--------------------------------------------------------------------------
        | Clean old blob URL
        |--------------------------------------------------------------------------
        */

        if (proofUrl) {

            URL.revokeObjectURL(
                proofUrl
            );

            setProofUrl(null);
        }

        setSelectedPayment(
            payment
        );

        setError("");

        /*
        |--------------------------------------------------------------------------
        | No proof
        |--------------------------------------------------------------------------
        */

        if (!payment?.has_proof) {
            return;
        }

        try {

            setLoadingProof(true);

            const response =
                await api.get(
                    `/admin/subscription-payments/${payment.id}/proof`,
                    {
                        responseType: "blob",
                    }
                );

            const blobUrl =
                URL.createObjectURL(
                    response.data
                );

            setProofUrl(
                blobUrl
            );

        } catch (error) {

            console.error(
                "Failed to load payment proof:",
                error
            );

            setProofUrl(null);

            setError(
                error?.response?.data?.message ||
                "Failed to load payment proof."
            );

        } finally {

            setLoadingProof(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Close Details Modal
    |--------------------------------------------------------------------------
    */

    const handleCloseDetails = () => {

        if (proofUrl) {

            URL.revokeObjectURL(
                proofUrl
            );

            setProofUrl(null);
        }

        setSelectedPayment(null);

        setLoadingProof(false);

        setError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Approve
    |--------------------------------------------------------------------------
    */

    const handleApprove = async (
        payment
    ) => {

        /*
        |--------------------------------------------------------------------------
        | Frontend proof check
        |--------------------------------------------------------------------------
        */

        if (!payment?.has_proof) {

            setError(
                "Payment proof is required before approval."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Approve ${payment.plan?.name || "subscription"} payment for ${getSellerName(payment)}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                payment.id
            );

            setError("");
            setSuccess("");

            await api.post(
                `/admin/subscription-payments/${payment.id}/approve`
            );

            setSuccess(
                "Subscription payment approved successfully."
            );

            /*
            |--------------------------------------------------------------------------
            | Close modal
            |--------------------------------------------------------------------------
            */

            handleCloseDetails();

            /*
            |--------------------------------------------------------------------------
            | Reload
            |--------------------------------------------------------------------------
            */

            await loadPayments();

        } catch (error) {

            console.error(
                "Approve payment error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Failed to approve subscription payment."
            );

        } finally {

            setActionLoading(
                null
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Open Reject Modal
    |--------------------------------------------------------------------------
    */

    const handleOpenReject = (
        payment
    ) => {

        setSelectedPayment(
            payment
        );

        setRejectionReason("");

        setShowRejectModal(
            true
        );

        setError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Close Reject Modal
    |--------------------------------------------------------------------------
    */

    const handleCloseReject = () => {

        setShowRejectModal(
            false
        );

        setRejectionReason("");
    };


    /*
    |--------------------------------------------------------------------------
    | Reject Payment
    |--------------------------------------------------------------------------
    */

    const handleReject = async () => {

        if (!selectedPayment) {
            return;
        }

        if (
            !rejectionReason.trim()
        ) {

            setError(
                "Please enter a rejection reason."
            );

            return;
        }

        try {

            setActionLoading(
                selectedPayment.id
            );

            setError("");
            setSuccess("");

            await api.post(
                `/admin/subscription-payments/${selectedPayment.id}/reject`,
                {
                    rejection_reason:
                        rejectionReason.trim(),
                }
            );

            setSuccess(
                "Subscription payment rejected successfully."
            );

            /*
            |--------------------------------------------------------------------------
            | Close modals
            |--------------------------------------------------------------------------
            */

            handleCloseReject();
            handleCloseDetails();

            /*
            |--------------------------------------------------------------------------
            | Reload
            |--------------------------------------------------------------------------
            */

            await loadPayments();

        } catch (error) {

            console.error(
                "Reject payment error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.response?.data?.errors
                    ?.rejection_reason?.[0] ||
                "Failed to reject subscription payment."
            );

        } finally {

            setActionLoading(
                null
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Status Badge
    |--------------------------------------------------------------------------
    */

    const renderStatus = (
        status
    ) => {

        if (status === "pending") {

            return (
                <span className="admin-payment-status pending">
                    <Clock3 size={14} />
                    Pending
                </span>
            );
        }

        if (status === "approved") {

            return (
                <span className="admin-payment-status approved">
                    <CheckCircle2 size={14} />
                    Approved
                </span>
            );
        }

        if (status === "rejected") {

            return (
                <span className="admin-payment-status rejected">
                    <XCircle size={14} />
                    Rejected
                </span>
            );
        }

        return (
            <span className="admin-payment-status">
                {status}
            </span>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Proof Badge
    |--------------------------------------------------------------------------
    */

    const renderProofStatus = (
        payment
    ) => {

        if (payment?.has_proof) {

            return (
                <span className="admin-proof-status uploaded">
                    <CheckCircle2 size={14} />
                    Uploaded
                </span>
            );
        }

        return (
            <span className="admin-proof-status missing">
                <ImageOff size={14} />
                No Proof
            </span>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-subscription-loading">

                <RefreshCw
                    size={28}
                    className="spin"
                />

                <span>
                    Loading subscription payments...
                </span>

            </div>
        );
    }


    return (
        <div className="admin-subscription-payments-page">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="admin-page-header">

                <div>

                    <h1>
                        Subscription Payments
                    </h1>

                    <p>
                        Review seller subscription
                        payment requests and payment
                        proofs.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-refresh-btn"
                    onClick={() =>
                        loadPayments(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =====================================================
                SUCCESS
            ====================================================== */}

            {success && (

                <div className="admin-alert success">

                    <CheckCircle2 size={18} />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (

                <div className="admin-alert error">

                    <AlertCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =====================================================
                STATS
            ====================================================== */}

            <div className="admin-payment-stats">

                {/* Pending */}

                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon pending">
                        <Clock3 size={21} />
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {stats.pending}
                        </strong>

                    </div>

                </div>


                {/* Approved */}

                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon approved">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <strong>
                            {stats.approved}
                        </strong>

                    </div>

                </div>


                {/* Rejected */}

                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon rejected">
                        <XCircle size={21} />
                    </div>

                    <div>

                        <span>
                            Rejected
                        </span>

                        <strong>
                            {stats.rejected}
                        </strong>

                    </div>

                </div>


                {/* Total */}

                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon total">
                        <CreditCard size={21} />
                    </div>

                    <div>

                        <span>
                            Total Requests
                        </span>

                        <strong>
                            {stats.total}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =====================================================
                TABLE
            ====================================================== */}

            <div className="admin-payment-table-card">

                <div className="admin-payment-table-header">

                    <div>

                        <h2>
                            Payment Requests
                        </h2>

                        <p>
                            Review payments before
                            activating subscriptions.
                        </p>

                    </div>

                </div>


                {payments.length === 0 ? (

                    <div className="admin-payment-empty">

                        <CreditCard
                            size={42}
                        />

                        <h3>
                            No subscription payments
                        </h3>

                        <p>
                            No subscription payment
                            requests have been submitted yet.
                        </p>

                    </div>

                ) : (

                    <div className="admin-payment-table-wrapper">

                        <table className="admin-payment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Seller
                                    </th>

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
                                        Proof
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Action
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

                                            {/* Seller */}

                                            <td>

                                                <div className="admin-payment-seller">

                                                    <div className="admin-payment-avatar">
                                                        <User
                                                            size={16}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                getSellerName(
                                                                    payment
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                payment
                                                                    .seller
                                                                    ?.email ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Plan */}

                                            <td>

                                                <div className="admin-payment-plan">

                                                    <strong>
                                                        {
                                                            payment
                                                                .plan
                                                                ?.name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            payment
                                                                .plan
                                                                ?.billing_cycle ||
                                                            ""
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Amount */}

                                            <td>

                                                <strong>
                                                    {formatMoney(
                                                        payment.amount,
                                                        payment.currency
                                                    )}
                                                </strong>

                                            </td>


                                            {/* Payment Method */}

                                            <td>

                                                <div className="admin-payment-method">

                                                    <Wallet
                                                        size={15}
                                                    />

                                                    <span>
                                                        {
                                                            payment.payment_method ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Reference */}

                                            <td>

                                                <span className="admin-payment-reference">

                                                    {
                                                        payment.transaction_reference ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* Proof */}

                                            <td>

                                                {renderProofStatus(
                                                    payment
                                                )}

                                            </td>


                                            {/* Status */}

                                            <td>

                                                {renderStatus(
                                                    payment.status
                                                )}

                                            </td>


                                            {/* Date */}

                                            <td>

                                                <span className="admin-payment-date">

                                                    {formatDate(
                                                        payment.created_at
                                                    )}

                                                </span>

                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="admin-payment-view-btn"
                                                    onClick={() =>
                                                        handleViewPayment(
                                                            payment
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={15}
                                                    />

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                PAYMENT DETAILS MODAL
            ====================================================== */}

            {selectedPayment &&
                !showRejectModal && (

                    <div
                        className="admin-modal-overlay"
                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                handleCloseDetails();
                            }

                        }}
                    >

                        <div className="admin-payment-modal">

                            {/* Header */}

                            <div className="admin-payment-modal-header">

                                <div>

                                    <h2>
                                        Payment Details
                                    </h2>

                                    <p>
                                        Review payment
                                        information and
                                        verify proof.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="admin-modal-close"
                                    onClick={
                                        handleCloseDetails
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>


                            {/* Body */}

                            <div className="admin-payment-modal-body">

                                {/* =================================================
                                    Seller
                                ================================================== */}

                                <div className="admin-payment-detail-section">

                                    <div className="admin-payment-detail-section-title">

                                        <User size={17} />

                                        <span>
                                            Seller
                                        </span>

                                    </div>


                                    <div className="admin-payment-detail-grid">

                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Name
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .seller
                                                        ?.name ||
                                                    "Unknown Seller"
                                                }
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .seller
                                                        ?.email ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    Plan
                                ================================================== */}

                                <div className="admin-payment-detail-section">

                                    <div className="admin-payment-detail-section-title">

                                        <CreditCard size={17} />

                                        <span>
                                            Subscription
                                        </span>

                                    </div>


                                    <div className="admin-payment-detail-grid">

                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Plan
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .plan
                                                        ?.name ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Amount
                                            </span>

                                            <strong>
                                                {formatMoney(
                                                    selectedPayment.amount,
                                                    selectedPayment.currency
                                                )}
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Billing Cycle
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .plan
                                                        ?.billing_cycle ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Status
                                            </span>

                                            <div>
                                                {renderStatus(
                                                    selectedPayment.status
                                                )}
                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    Payment
                                ================================================== */}

                                <div className="admin-payment-detail-section">

                                    <div className="admin-payment-detail-section-title">

                                        <Wallet size={17} />

                                        <span>
                                            Payment Information
                                        </span>

                                    </div>


                                    <div className="admin-payment-detail-grid">

                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Payment Method
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .payment_method ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Transaction Reference
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayment
                                                        .transaction_reference ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        <div className="admin-payment-detail-item">

                                            <span>
                                                Submitted
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedPayment.created_at
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    PAYMENT PROOF
                                ================================================== */}

                                <div className="admin-payment-proof-section">

                                    <div className="admin-payment-proof-header">

                                        <div>

                                            <div className="admin-payment-detail-section-title">

                                                <ImageIcon
                                                    size={17}
                                                />

                                                <span>
                                                    Payment Proof
                                                </span>

                                            </div>

                                            <p>
                                                Review the
                                                seller's payment
                                                screenshot before
                                                approving.
                                            </p>

                                        </div>


                                        {selectedPayment.has_proof && (

                                            <span className="admin-proof-status uploaded">

                                                <CheckCircle2
                                                    size={14}
                                                />

                                                Uploaded

                                            </span>

                                        )}

                                    </div>


                                    {/* No proof */}

                                    {!selectedPayment.has_proof ? (

                                        <div className="admin-payment-proof-empty">

                                            <ImageOff
                                                size={38}
                                            />

                                            <strong>
                                                No payment proof uploaded.
                                            </strong>

                                            <span>
                                                The seller must
                                                upload a payment
                                                screenshot before
                                                this payment can
                                                be approved.
                                            </span>

                                        </div>

                                    ) : loadingProof ? (

                                        <div className="admin-payment-proof-loading">

                                            <RefreshCw
                                                size={25}
                                                className="spin"
                                            />

                                            <span>
                                                Loading payment proof...
                                            </span>

                                        </div>

                                    ) : proofUrl ? (

                                        <div className="admin-payment-proof-preview">

                                            <img
                                                src={
                                                    proofUrl
                                                }
                                                alt="Payment proof"
                                            />

                                        </div>

                                    ) : (

                                        <div className="admin-payment-proof-empty">

                                            <ImageOff
                                                size={38}
                                            />

                                            <strong>
                                                Unable to load payment proof.
                                            </strong>

                                            <span>
                                                Please refresh
                                                and try again.
                                            </span>

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    Rejection Reason
                                ================================================== */}

                                {selectedPayment.status ===
                                    "rejected" &&
                                    selectedPayment.rejection_reason && (

                                        <div className="admin-rejection-box">

                                            <strong>
                                                Rejection Reason
                                            </strong>

                                            <p>
                                                {
                                                    selectedPayment.rejection_reason
                                                }
                                            </p>

                                        </div>

                                    )}

                            </div>


                            {/* =================================================
                                FOOTER ACTIONS
                            ================================================== */}

                            <div className="admin-payment-modal-footer">

                                {selectedPayment.status ===
                                    "pending" ? (

                                    <>

                                        <button
                                            type="button"
                                            className="admin-reject-payment-btn"
                                            disabled={
                                                actionLoading ===
                                                selectedPayment.id
                                            }
                                            onClick={() =>
                                                handleOpenReject(
                                                    selectedPayment
                                                )
                                            }
                                        >

                                            <XCircle
                                                size={17}
                                            />

                                            Reject

                                        </button>


                                        <button
                                            type="button"
                                            className="admin-approve-payment-btn"
                                            disabled={
                                                !selectedPayment.has_proof ||
                                                actionLoading ===
                                                selectedPayment.id
                                            }
                                            onClick={() =>
                                                handleApprove(
                                                    selectedPayment
                                                )
                                            }
                                        >

                                            {actionLoading ===
                                                selectedPayment.id ? (

                                                <>

                                                    <RefreshCw
                                                        size={17}
                                                        className="spin"
                                                    />

                                                    Processing...

                                                </>

                                            ) : selectedPayment.has_proof ? (

                                                <>

                                                    <CheckCircle2
                                                        size={17}
                                                    />

                                                    Approve Payment

                                                </>

                                            ) : (

                                                <>

                                                    <ImageOff
                                                        size={17}
                                                    />

                                                    Upload Proof Required

                                                </>

                                            )}

                                        </button>

                                    </>

                                ) : (

                                    <button
                                        type="button"
                                        className="admin-close-payment-btn"
                                        onClick={
                                            handleCloseDetails
                                        }
                                    >
                                        Close
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}


            {/* =====================================================
                REJECT MODAL
            ====================================================== */}

            {showRejectModal &&
                selectedPayment && (

                    <div
                        className="admin-modal-overlay"
                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                handleCloseReject();
                            }

                        }}
                    >

                        <div className="admin-reject-modal">

                            <div className="admin-payment-modal-header">

                                <div>

                                    <h2>
                                        Reject Payment
                                    </h2>

                                    <p>
                                        Tell the seller why
                                        this payment was
                                        rejected.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="admin-modal-close"
                                    onClick={
                                        handleCloseReject
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>


                            <div className="admin-reject-modal-body">

                                <div className="admin-reject-payment-summary">

                                    <strong>
                                        {
                                            selectedPayment
                                                .plan
                                                ?.name ||
                                            "Subscription"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            getSellerName(
                                                selectedPayment
                                            )
                                        }
                                    </span>

                                    <span>
                                        {formatMoney(
                                            selectedPayment.amount,
                                            selectedPayment.currency
                                        )}
                                    </span>

                                </div>


                                <label>

                                    <span>
                                        Rejection Reason
                                    </span>

                                    <textarea
                                        value={
                                            rejectionReason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setRejectionReason(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: Payment amount does not match the selected plan."
                                        rows={5}
                                        maxLength={1000}
                                    />

                                    <small>
                                        {
                                            rejectionReason.length
                                        }
                                        /1000
                                    </small>

                                </label>

                            </div>


                            <div className="admin-payment-modal-footer">

                                <button
                                    type="button"
                                    className="admin-close-payment-btn"
                                    onClick={
                                        handleCloseReject
                                    }
                                    disabled={
                                        actionLoading ===
                                        selectedPayment.id
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="admin-reject-payment-btn"
                                    disabled={
                                        !rejectionReason.trim() ||
                                        actionLoading ===
                                        selectedPayment.id
                                    }
                                    onClick={
                                        handleReject
                                    }
                                >

                                    {actionLoading ===
                                        selectedPayment.id ? (

                                        <>

                                            <RefreshCw
                                                size={17}
                                                className="spin"
                                            />

                                            Rejecting...

                                        </>

                                    ) : (

                                        <>

                                            <XCircle
                                                size={17}
                                            />

                                            Reject Payment

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default AdminSubscriptionPaymentsPage;