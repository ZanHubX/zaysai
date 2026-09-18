import { useEffect, useState } from "react";
import {
    CreditCard,
    Landmark,
    Pencil,
    Plus,
    Trash2,
    Wallet,
    X,
} from "lucide-react";
import api from "../services/api";
import "./SellerPaymentMethodsPage.css";

function SellerPaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        type: "kpay",
        account_name: "",
        account_number: "",
        qr_image: "",
        instructions: "",
        is_active: true,
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/seller/payment-methods");

            setPaymentMethods(response.data.payment_methods || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load payment methods."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            type: "kpay",
            account_name: "",
            account_number: "",
            qr_image: "",
            instructions: "",
            is_active: true,
        });

        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingId) {
                await api.put(
                    `/seller/payment-methods/${editingId}`,
                    form
                );

                setSuccess("Payment method updated successfully.");
            } else {
                await api.post("/seller/payment-methods", form);

                setSuccess("Payment method added successfully.");
            }

            resetForm();
            await fetchPaymentMethods();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save payment method."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (paymentMethod) => {
        setForm({
            type: paymentMethod.type || "kpay",
            account_name: paymentMethod.account_name || "",
            account_number: paymentMethod.account_number || "",
            qr_image: paymentMethod.qr_image || "",
            instructions: paymentMethod.instructions || "",
            is_active: Boolean(paymentMethod.is_active),
        });

        setEditingId(paymentMethod.id);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this payment method?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(`/seller/payment-methods/${id}`);

            setSuccess("Payment method deleted successfully.");

            await fetchPaymentMethods();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete payment method."
            );
        }
    };

    const getPaymentIcon = (type) => {
        if (type === "bank") {
            return <Landmark size={22} />;
        }

        if (type === "wavepay") {
            return <Wallet size={22} />;
        }

        return <CreditCard size={22} />;
    };

    const getPaymentName = (type) => {
        if (type === "wavepay") {
            return "WavePay";
        }

        if (type === "bank") {
            return "Bank Transfer";
        }

        return "KPay";
    };

    return (
        <div className="payment-page">
            <div className="payment-header">
                <div>
                    <span className="payment-eyebrow">
                        STORE PAYMENTS
                    </span>

                    <h1>Payment Methods</h1>

                    <p>
                        Manage the payment methods customers can use
                        when placing orders.
                    </p>
                </div>

                <button
                    className="payment-add-button"
                    onClick={() => {
                        setEditingId(null);
                        setForm({
                            type: "kpay",
                            account_name: "",
                            account_number: "",
                            qr_image: "",
                            instructions: "",
                            is_active: true,
                        });
                        setShowForm(true);
                        setError("");
                        setSuccess("");
                    }}
                >
                    <Plus size={18} />
                    Add Payment Method
                </button>
            </div>

            {success && (
                <div className="payment-alert success">
                    {success}
                </div>
            )}

            {error && (
                <div className="payment-alert error">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="payment-form-card">
                    <div className="payment-form-header">
                        <div>
                            <h2>
                                {editingId
                                    ? "Edit Payment Method"
                                    : "Add Payment Method"}
                            </h2>

                            <p>
                                Add the payment information customers
                                will use to pay you.
                            </p>
                        </div>

                        <button
                            className="payment-close-button"
                            onClick={resetForm}
                            type="button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="payment-form-grid">
                            <div className="payment-field">
                                <label>Payment Type</label>

                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                >
                                    <option value="kpay">
                                        KPay
                                    </option>

                                    <option value="wavepay">
                                        WavePay
                                    </option>

                                    <option value="bank">
                                        Bank Transfer
                                    </option>
                                </select>
                            </div>

                            <div className="payment-field">
                                <label>Account Name</label>

                                <input
                                    type="text"
                                    name="account_name"
                                    value={form.account_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Kaung Zan Thaw"
                                    required
                                />
                            </div>

                            <div className="payment-field">
                                <label>Account Number</label>

                                <input
                                    type="text"
                                    name="account_number"
                                    value={form.account_number}
                                    onChange={handleChange}
                                    placeholder="e.g. 09xxxxxxxxx"
                                    required
                                />
                            </div>

                            <div className="payment-field">
                                <label>QR Image URL</label>

                                <input
                                    type="text"
                                    name="qr_image"
                                    value={form.qr_image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/qr.png"
                                />
                            </div>

                            <div className="payment-field full-width">
                                <label>Payment Instructions</label>

                                <textarea
                                    name="instructions"
                                    value={form.instructions}
                                    onChange={handleChange}
                                    placeholder="Example: Please send the exact order amount and include your order number."
                                    rows="4"
                                />
                            </div>

                            <label className="payment-toggle">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                />

                                <span>
                                    Active payment method
                                </span>
                            </label>
                        </div>

                        <div className="payment-form-actions">
                            <button
                                type="button"
                                className="payment-cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="payment-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Payment Method"
                                        : "Save Payment Method"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="payment-section">
                <div className="payment-section-header">
                    <div>
                        <h2>Your Payment Methods</h2>

                        <p>
                            Customers will see active payment methods
                            during checkout.
                        </p>
                    </div>

                    <span className="payment-count">
                        {paymentMethods.length}{" "}
                        {paymentMethods.length === 1
                            ? "method"
                            : "methods"}
                    </span>
                </div>

                {loading ? (
                    <div className="payment-empty">
                        Loading payment methods...
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div className="payment-empty">
                        <div className="payment-empty-icon">
                            <CreditCard size={26} />
                        </div>

                        <h3>No payment methods yet</h3>

                        <p>
                            Add KPay, WavePay, or a bank account so
                            customers know how to pay you.
                        </p>

                        <button
                            className="payment-add-button"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={18} />
                            Add Your First Method
                        </button>
                    </div>
                ) : (
                    <div className="payment-list">
                        {paymentMethods.map((paymentMethod) => (
                            <div
                                className="payment-method-card"
                                key={paymentMethod.id}
                            >
                                <div className="payment-method-icon">
                                    {getPaymentIcon(
                                        paymentMethod.type
                                    )}
                                </div>

                                <div className="payment-method-info">
                                    <div className="payment-method-title">
                                        <h3>
                                            {getPaymentName(
                                                paymentMethod.type
                                            )}
                                        </h3>

                                        <span
                                            className={
                                                paymentMethod.is_active
                                                    ? "status active"
                                                    : "status inactive"
                                            }
                                        >
                                            {paymentMethod.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <p>
                                        {
                                            paymentMethod.account_name
                                        }
                                    </p>

                                    <strong>
                                        {
                                            paymentMethod.account_number
                                        }
                                    </strong>

                                    {paymentMethod.instructions && (
                                        <small>
                                            {
                                                paymentMethod.instructions
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="payment-method-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(
                                                paymentMethod
                                            )
                                        }
                                        title="Edit"
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                paymentMethod.id
                                            )
                                        }
                                        title="Delete"
                                        className="delete"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellerPaymentMethodsPage;