import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Plus,
    Search,
    RefreshCw,
    Pencil,
    Trash2,
    Copy,
    Check,
    X,
    Upload,
    QrCode,
    Power,
    Eye,
    EyeOff,
    WalletCards,
    Landmark,
    Smartphone,
    MoreVertical,
} from "lucide-react";

import api from "../services/api";

import "./AdminSubscriptionPaymentMethodsPage.css";


const EMPTY_FORM = {
    name: "",
    type: "mobile_payment",
    account_name: "",
    account_number: "",
    instructions: "",
    is_active: true,
    sort_order: 0,
};


const PAYMENT_TYPES = [
    {
        value: "mobile_payment",
        label: "Mobile Payment",
    },
    {
        value: "bank_transfer",
        label: "Bank Transfer",
    },
    {
        value: "KPay",
        label: "KPay",
    },
    {
        value: "other",
        label: "Other",
    },
];


const AdminSubscriptionPaymentMethodsPage = () => {

    const [methods, setMethods] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showQrModal, setShowQrModal] = useState(false);

    const [editingMethod, setEditingMethod] = useState(null);

    const [selectedMethod, setSelectedMethod] = useState(null);

    const [qrPreviewUrl, setQrPreviewUrl] = useState("");

    const [qrLoading, setQrLoading] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);

    const [qrFile, setQrFile] = useState(null);

    const [copiedId, setCopiedId] = useState(null);

    const fileInputRef = useRef(null);


    /* =========================================================
       LOAD PAYMENT METHODS
    ========================================================= */

    const loadMethods = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/admin/subscription-payment-methods"
            );

            const data = response?.data;

            const receivedMethods =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.payment_methods)
                        ? data.payment_methods
                        : Array.isArray(data?.methods)
                            ? data.methods
                            : Array.isArray(data?.data)
                                ? data.data
                                : [];

            setMethods(receivedMethods);

        } catch (err) {

            console.error(
                "Load subscription payment methods error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load subscription payment methods."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };


    useEffect(() => {

        loadMethods();

    }, []);


    /* =========================================================
       FILTER
    ========================================================= */

    const filteredMethods = useMemo(() => {

        const keyword =
            search
                .trim()
                .toLowerCase();

        if (!keyword) {
            return methods;
        }

        return methods.filter((method) => {

            return (
                String(method?.name || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(method?.type || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(method?.account_name || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(method?.account_number || "")
                    .toLowerCase()
                    .includes(keyword)
            );

        });

    }, [methods, search]);


    /* =========================================================
       STATS
    ========================================================= */

    const activeCount = methods.filter(
        (method) => Boolean(method?.is_active)
    ).length;

    const inactiveCount =
        methods.length - activeCount;


    /* =========================================================
       FORM
    ========================================================= */

    const resetForm = () => {

        setForm({
            ...EMPTY_FORM,
            sort_order: methods.length,
        });

        setQrFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const openCreateModal = () => {

        setEditingMethod(null);

        setError("");

        setSuccess("");

        resetForm();

        setShowModal(true);
    };


    const openEditModal = (method) => {

        setEditingMethod(method);

        setError("");

        setSuccess("");

        setForm({
            name: method?.name || "",
            type: method?.type || "mobile_payment",
            account_name: method?.account_name || "",
            account_number: method?.account_number || "",
            instructions: method?.instructions || "",
            is_active:
                method?.is_active !== false,
            sort_order:
                Number(method?.sort_order || 0),
        });

        setQrFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setShowModal(true);
    };


    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingMethod(null);

        setQrFile(null);

        resetForm();
    };


    const handleInputChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    /* =========================================================
       QR FILE
    ========================================================= */

    const handleQrFileChange = (event) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            setQrFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;
        }

        setError("");

        setQrFile(file);
    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!form.name.trim()) {

            setError(
                "Payment method name is required."
            );

            return;
        }

        if (!form.account_name.trim()) {

            setError(
                "Account name is required."
            );

            return;
        }

        if (!form.account_number.trim()) {

            setError(
                "Account number is required."
            );

            return;
        }

        try {

            setSaving(true);

            setError("");

            setSuccess("");

            const formData = new FormData();

            formData.append(
                "name",
                form.name.trim()
            );

            formData.append(
                "type",
                form.type
            );

            formData.append(
                "account_name",
                form.account_name.trim()
            );

            formData.append(
                "account_number",
                form.account_number.trim()
            );

            formData.append(
                "instructions",
                form.instructions.trim()
            );

            formData.append(
                "is_active",
                form.is_active ? "1" : "0"
            );

            formData.append(
                "sort_order",
                String(
                    Number(form.sort_order || 0)
                )
            );


            if (qrFile) {

                formData.append(
                    "qr_image",
                    qrFile
                );
            }


            let response;


            /* =================================================
               CREATE
            ================================================= */

            if (!editingMethod) {

                response = await api.post(
                    "/admin/subscription-payment-methods",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setSuccess(
                    response?.data?.message ||
                    "Payment method created successfully."
                );

            }

            /* =================================================
               UPDATE
            ================================================= */

            else {

                /*
                 * Backend currently uses POST for update.
                 */

                response = await api.post(
                    `/admin/subscription-payment-methods/${editingMethod.id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setSuccess(
                    response?.data?.message ||
                    "Payment method updated successfully."
                );
            }


            setShowModal(false);

            setEditingMethod(null);

            setQrFile(null);

            await loadMethods();

        } catch (err) {

            console.error(
                "Save subscription payment method error:",
                err
            );

            const validationErrors =
                err?.response?.data?.errors;

            let message =
                err?.response?.data?.message ||
                "Failed to save payment method.";

            if (validationErrors) {

                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                if (firstError) {
                    message = firstError;
                }
            }

            setError(message);

        } finally {

            setSaving(false);
        }
    };


    /* =========================================================
       DELETE
    ========================================================= */

    const openDeleteModal = (method) => {

        setSelectedMethod(method);

        setError("");

        setShowDeleteModal(true);
    };


    const closeDeleteModal = () => {

        if (deleting) {
            return;
        }

        setShowDeleteModal(false);

        setSelectedMethod(null);
    };


    const handleDelete = async () => {

        if (!selectedMethod?.id) {
            return;
        }

        try {

            setDeleting(true);

            setError("");

            setSuccess("");

            const response =
                await api.delete(
                    `/admin/subscription-payment-methods/${selectedMethod.id}`
                );

            setSuccess(
                response?.data?.message ||
                "Payment method deleted successfully."
            );

            setShowDeleteModal(false);

            setSelectedMethod(null);

            await loadMethods();

        } catch (err) {

            console.error(
                "Delete payment method error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to delete payment method."
            );

        } finally {

            setDeleting(false);
        }
    };


    /* =========================================================
       TOGGLE ACTIVE STATUS
    ========================================================= */

    const toggleStatus = async (method) => {

        if (!method?.id) {
            return;
        }

        try {

            setError("");

            setSuccess("");

            const formData = new FormData();

            formData.append(
                "name",
                method?.name || ""
            );

            formData.append(
                "type",
                method?.type || "mobile_payment"
            );

            formData.append(
                "account_name",
                method?.account_name || ""
            );

            formData.append(
                "account_number",
                method?.account_number || ""
            );

            formData.append(
                "instructions",
                method?.instructions || ""
            );

            formData.append(
                "is_active",
                method?.is_active ? "0" : "1"
            );

            formData.append(
                "sort_order",
                String(
                    Number(method?.sort_order || 0)
                )
            );


            const response =
                await api.post(
                    `/admin/subscription-payment-methods/${method.id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );


            setSuccess(
                response?.data?.message ||
                (
                    method?.is_active
                        ? "Payment method deactivated."
                        : "Payment method activated."
                )
            );

            await loadMethods();

        } catch (err) {

            console.error(
                "Toggle payment method error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to update payment method status."
            );
        }
    };


    /* =========================================================
       COPY ACCOUNT NUMBER
    ========================================================= */

    const handleCopy = async (
        accountNumber,
        id
    ) => {

        if (!accountNumber) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                String(accountNumber)
            );

            setCopiedId(id);

            setTimeout(() => {

                setCopiedId(null);

            }, 1800);

        } catch (err) {

            console.error(
                "Copy failed:",
                err
            );
        }
    };


    /* =========================================================
       QR
    ========================================================= */

    const openQrModal = async (method) => {

        if (!method?.id) {
            return;
        }

        setSelectedMethod(method);

        setShowQrModal(true);

        setQrLoading(true);

        setQrPreviewUrl("");

        try {

            const response =
                await api.get(
                    `/admin/subscription-payment-methods/${method.id}/qr`,
                    {
                        responseType: "blob",
                    }
                );

            const url =
                URL.createObjectURL(
                    response.data
                );

            setQrPreviewUrl(url);

        } catch (err) {

            console.error(
                "Load QR error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load QR image."
            );

        } finally {

            setQrLoading(false);
        }
    };


    const closeQrModal = () => {

        if (qrPreviewUrl) {

            URL.revokeObjectURL(
                qrPreviewUrl
            );
        }

        setQrPreviewUrl("");

        setShowQrModal(false);

        setSelectedMethod(null);
    };


    useEffect(() => {

        return () => {

            if (qrPreviewUrl) {

                URL.revokeObjectURL(
                    qrPreviewUrl
                );
            }
        };

    }, [qrPreviewUrl]);


    /* =========================================================
       HELPERS
    ========================================================= */

    const getTypeLabel = (type) => {

        const found =
            PAYMENT_TYPES.find(
                (item) =>
                    item.value === type
            );

        if (found) {
            return found.label;
        }

        if (!type) {
            return "Payment";
        }

        return String(type)
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase()
            );
    };


    const getTypeIcon = (type) => {

        if (
            type === "bank_transfer"
        ) {
            return <Landmark size={20} />;
        }

        if (
            type === "mobile_payment"
        ) {
            return <Smartphone size={20} />;
        }

        return <WalletCards size={20} />;
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <div className="admin-payment-methods-loading">

                <RefreshCw
                    size={28}
                    className="spin"
                />

                <span>
                    Loading payment methods...
                </span>

            </div>
        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-payment-methods-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="admin-payment-methods-header">

                <div className="admin-payment-methods-title">

                    <span className="admin-payment-methods-eyebrow">
                        BILLING & SUBSCRIPTIONS
                    </span>

                    <h1>
                        Subscription Payment Methods
                    </h1>

                    <p>
                        Manage the payment accounts
                        sellers can use to pay for
                        ZaySai subscriptions.
                    </p>

                </div>


                <div className="admin-payment-methods-header-actions">

                    <button
                        type="button"
                        className="admin-payment-refresh-btn"
                        onClick={() =>
                            loadMethods(true)
                        }
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="admin-payment-primary-btn"
                        onClick={
                            openCreateModal
                        }
                    >

                        <Plus size={17} />

                        Add Payment Method

                    </button>

                </div>

            </header>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="admin-payment-alert error">

                    <div className="admin-payment-alert-icon">
                        <X size={17} />
                    </div>

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


            {success && (

                <div className="admin-payment-alert success">

                    <div className="admin-payment-alert-icon">
                        <Check size={17} />
                    </div>

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


            {/* =================================================
                STATS
            ================================================= */}

            <section className="admin-payment-method-stats">

                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon">
                        <WalletCards size={19} />
                    </div>

                    <div>
                        <span>
                            Total Methods
                        </span>

                        <strong>
                            {methods.length}
                        </strong>
                    </div>

                </div>


                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon active">
                        <Check size={19} />
                    </div>

                    <div>
                        <span>
                            Active
                        </span>

                        <strong>
                            {activeCount}
                        </strong>
                    </div>

                </div>


                <div className="admin-payment-stat-card">

                    <div className="admin-payment-stat-icon inactive">
                        <EyeOff size={19} />
                    </div>

                    <div>
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveCount}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="admin-payment-methods-toolbar">

                <div className="admin-payment-search">

                    <Search size={17} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search payment methods..."
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <span className="admin-payment-result-count">
                    {filteredMethods.length} method
                    {filteredMethods.length !== 1
                        ? "s"
                        : ""}
                </span>

            </section>


            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredMethods.length === 0 && (

                <div className="admin-payment-empty">

                    <div className="admin-payment-empty-icon">
                        <WalletCards size={28} />
                    </div>

                    <h3>
                        {search
                            ? "No payment methods found"
                            : "No payment methods yet"}
                    </h3>

                    <p>
                        {search
                            ? "Try a different search keyword."
                            : "Add your first subscription payment method to start accepting seller payments."}
                    </p>

                    {!search && (

                        <button
                            type="button"
                            className="admin-payment-primary-btn"
                            onClick={
                                openCreateModal
                            }
                        >

                            <Plus size={17} />

                            Add Payment Method

                        </button>
                    )}

                </div>
            )}


            {/* =================================================
                CARDS
            ================================================= */}

            {filteredMethods.length > 0 && (

                <section className="admin-payment-method-grid">

                    {filteredMethods.map(
                        (method) => (

                            <article
                                className={
                                    `admin-payment-method-card ${method?.is_active
                                        ? ""
                                        : "inactive"
                                    }`
                                }
                                key={method.id}
                            >

                                {/* CARD TOP */}

                                <div className="admin-payment-method-card-top">

                                    <div className="admin-payment-method-brand">

                                        <div className="admin-payment-method-icon">
                                            {getTypeIcon(
                                                method?.type
                                            )}
                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    method?.name ||
                                                    "Payment Method"
                                                }
                                            </h3>

                                            <span>
                                                {getTypeLabel(
                                                    method?.type
                                                )}
                                            </span>

                                        </div>

                                    </div>


                                    <span
                                        className={
                                            `admin-payment-status ${method?.is_active
                                                ? "active"
                                                : "inactive"
                                            }`
                                        }
                                    >

                                        <span className="admin-payment-status-dot" />

                                        {method?.is_active
                                            ? "Active"
                                            : "Inactive"}

                                    </span>

                                </div>


                                {/* ACCOUNT */}

                                <div className="admin-payment-account-box">

                                    <div className="admin-payment-account-row">

                                        <span>
                                            Account Name
                                        </span>

                                        <strong>
                                            {method?.account_name ||
                                                "—"}
                                        </strong>

                                    </div>


                                    <div className="admin-payment-account-row">

                                        <span>
                                            Account Number
                                        </span>

                                        <div className="admin-payment-account-number">

                                            <strong>
                                                {method?.account_number ||
                                                    "—"}
                                            </strong>

                                            {method?.account_number && (

                                                <button
                                                    type="button"
                                                    className="admin-icon-button"
                                                    title="Copy account number"
                                                    onClick={() =>
                                                        handleCopy(
                                                            method.account_number,
                                                            method.id
                                                        )
                                                    }
                                                >

                                                    {copiedId ===
                                                        method.id ? (
                                                        <Check
                                                            size={15}
                                                        />
                                                    ) : (
                                                        <Copy
                                                            size={15}
                                                        />
                                                    )}

                                                </button>
                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* INSTRUCTIONS */}

                                {method?.instructions && (

                                    <div className="admin-payment-instructions">

                                        <span>
                                            Instructions
                                        </span>

                                        <p>
                                            {
                                                method.instructions
                                            }
                                        </p>

                                    </div>
                                )}


                                {/* QR */}

                                <div className="admin-payment-qr-row">

                                    <div className="admin-payment-qr-info">

                                        <QrCode size={17} />

                                        <span>
                                            QR Code
                                        </span>

                                    </div>

                                    {method?.has_qr_image ||
                                        method?.qr_image ? (

                                        <button
                                            type="button"
                                            className="admin-view-qr-btn"
                                            onClick={() =>
                                                openQrModal(
                                                    method
                                                )
                                            }
                                        >

                                            <Eye size={15} />

                                            View QR

                                        </button>

                                    ) : (

                                        <span className="admin-no-qr">
                                            Not uploaded
                                        </span>
                                    )}

                                </div>


                                {/* FOOTER */}

                                <div className="admin-payment-method-card-footer">

                                    <button
                                        type="button"
                                        className="admin-card-action"
                                        onClick={() =>
                                            openEditModal(
                                                method
                                            )
                                        }
                                    >

                                        <Pencil size={15} />

                                        Edit

                                    </button>


                                    <button
                                        type="button"
                                        className="admin-card-action"
                                        onClick={() =>
                                            toggleStatus(
                                                method
                                            )
                                        }
                                    >

                                        <Power size={15} />

                                        {method?.is_active
                                            ? "Deactivate"
                                            : "Activate"}

                                    </button>


                                    <button
                                        type="button"
                                        className="admin-card-action danger"
                                        onClick={() =>
                                            openDeleteModal(
                                                method
                                            )
                                        }
                                    >

                                        <Trash2 size={15} />

                                        Delete

                                    </button>

                                </div>

                            </article>
                        )
                    )}

                </section>
            )}


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="admin-payment-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="admin-payment-modal">

                        <div className="admin-payment-modal-header">

                            <div>

                                <span>
                                    PAYMENT METHOD
                                </span>

                                <h2>
                                    {editingMethod
                                        ? "Edit Payment Method"
                                        : "Add Payment Method"}
                                </h2>

                                <p>
                                    Configure the account
                                    sellers will use for
                                    subscription payments.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            className="admin-payment-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* NAME */}

                            <div className="admin-form-field">

                                <label>
                                    Payment Method Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. KPay"
                                    maxLength={100}
                                    disabled={saving}
                                />

                            </div>


                            {/* TYPE */}

                            <div className="admin-form-field">

                                <label>
                                    Payment Type
                                    <span>*</span>
                                </label>

                                <select
                                    name="type"
                                    value={
                                        form.type
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={saving}
                                >

                                    {PAYMENT_TYPES.map(
                                        (type) => (

                                            <option
                                                key={
                                                    type.value
                                                }
                                                value={
                                                    type.value
                                                }
                                            >
                                                {
                                                    type.label
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="admin-form-grid">

                                {/* ACCOUNT NAME */}

                                <div className="admin-form-field">

                                    <label>
                                        Account Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="account_name"
                                        value={
                                            form.account_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. ZaySai"
                                        maxLength={150}
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                {/* ACCOUNT NUMBER */}

                                <div className="admin-form-field">

                                    <label>
                                        Account Number
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="account_number"
                                        value={
                                            form.account_number
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. 09xxxxxxxxx"
                                        maxLength={100}
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                            </div>


                            {/* INSTRUCTIONS */}

                            <div className="admin-form-field">

                                <label>
                                    Instructions
                                </label>

                                <textarea
                                    name="instructions"
                                    value={
                                        form.instructions
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Tell sellers how to make the payment..."
                                    rows={4}
                                    maxLength={1000}
                                    disabled={
                                        saving
                                    }
                                />

                            </div>


                            {/* QR UPLOAD */}

                            <div className="admin-form-field">

                                <label>
                                    QR Code
                                </label>

                                <div className="admin-qr-upload">

                                    <input
                                        ref={
                                            fileInputRef
                                        }
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleQrFileChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                    <div className="admin-qr-upload-content">

                                        <div className="admin-qr-upload-icon">
                                            <Upload
                                                size={20}
                                            />
                                        </div>

                                        <div>

                                            <strong>
                                                {qrFile
                                                    ? qrFile.name
                                                    : "Upload QR code"}
                                            </strong>

                                            <span>
                                                PNG, JPG or WEBP
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* SETTINGS */}

                            <div className="admin-form-grid">

                                <div className="admin-form-field">

                                    <label>
                                        Sort Order
                                    </label>

                                    <input
                                        type="number"
                                        name="sort_order"
                                        value={
                                            form.sort_order
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        min="0"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <div className="admin-form-field admin-checkbox-field">

                                    <label>
                                        Status
                                    </label>

                                    <label className="admin-toggle">

                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={
                                                form.is_active
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                saving
                                            }
                                        />

                                        <span className="admin-toggle-track">
                                            <span className="admin-toggle-thumb" />
                                        </span>

                                        <span className="admin-toggle-label">
                                            {form.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </label>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="admin-payment-modal-footer">

                                <button
                                    type="button"
                                    className="admin-modal-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-modal-save-btn"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check
                                                size={16}
                                            />

                                            {editingMethod
                                                ? "Save Changes"
                                                : "Create Payment Method"}
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {showDeleteModal && (

                <div
                    className="admin-payment-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeleteModal();
                        }

                    }}
                >

                    <div className="admin-delete-modal">

                        <div className="admin-delete-icon">
                            <Trash2 size={23} />
                        </div>

                        <h2>
                            Delete Payment Method?
                        </h2>

                        <p>
                            You are about to delete
                            <strong>
                                {" "}
                                {selectedMethod?.name}
                            </strong>
                            . This action cannot be
                            undone.
                        </p>

                        <div className="admin-delete-actions">

                            <button
                                type="button"
                                className="admin-modal-cancel-btn"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={
                                    deleting
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-delete-confirm-btn"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                            >

                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="spin"
                                        />

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={16}
                                        />

                                        Delete
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                QR MODAL
            ================================================= */}

            {showQrModal && (

                <div
                    className="admin-payment-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeQrModal();
                        }

                    }}
                >

                    <div className="admin-qr-modal">

                        <div className="admin-payment-modal-header">

                            <div>

                                <span>
                                    QR CODE
                                </span>

                                <h2>
                                    {selectedMethod?.name}
                                </h2>

                                <p>
                                    Subscription payment
                                    QR code.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    closeQrModal
                                }
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <div className="admin-qr-preview">

                            {qrLoading ? (

                                <div className="admin-qr-loading">

                                    <RefreshCw
                                        size={28}
                                        className="spin"
                                    />

                                    <span>
                                        Loading QR...
                                    </span>

                                </div>

                            ) : qrPreviewUrl ? (

                                <img
                                    src={
                                        qrPreviewUrl
                                    }
                                    alt={`${selectedMethod?.name} QR`}
                                />

                            ) : (

                                <div className="admin-qr-not-found">

                                    <QrCode
                                        size={38}
                                    />

                                    <span>
                                        QR code not available.
                                    </span>

                                </div>
                            )}

                        </div>


                        <div className="admin-qr-modal-footer">

                            <button
                                type="button"
                                className="admin-modal-cancel-btn"
                                onClick={
                                    closeQrModal
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};


export default AdminSubscriptionPaymentMethodsPage;