import { useEffect, useState } from "react";
import {
    CheckCircle2,
    ExternalLink,
    Image,
    Save,
    Store,
    Upload,
    X,
} from "lucide-react";

import api from "../services/api";
import "./SellerSettingsPage.css";

function SellerSettingsPage() {
    const [store, setStore] = useState(null);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        phone: "",
        logo: "",
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadStore();
    }, []);

    const loadStore = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/seller/store");

            const data = response.data.store;

            setStore(data);

            setForm({
                name: data.name || "",
                slug: data.slug || "",
                description: data.description || "",
                phone: data.phone || "",
                logo: data.logo || "",
            });

            setLogoPreview(data.logo || "");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load store settings."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        // Client-side validation
        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );

            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError(
                "Logo image must be 2MB or smaller."
            );

            e.target.value = "";
            return;
        }

        // Remove previous preview URL
        if (
            logoPreview &&
            logoPreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoFile(file);

        const previewUrl =
            URL.createObjectURL(file);

        setLogoPreview(previewUrl);
    };

    const handleRemoveLogo = () => {
        if (
            logoPreview &&
            logoPreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoFile(null);
        setLogoPreview("");

        setSuccess("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("name", form.name);
            formData.append("slug", form.slug);
            formData.append(
                "description",
                form.description
            );
            formData.append("phone", form.phone);

            /*
            |--------------------------------------------------------------------------
            | Laravel Method Spoofing
            |--------------------------------------------------------------------------
            */

            formData.append("_method", "PUT");

            /*
            |--------------------------------------------------------------------------
            | Logo
            |--------------------------------------------------------------------------
            */

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            const response = await api.post(
                "/seller/store",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            const updatedStore =
                response.data.store;

            setStore(updatedStore);

            setForm({
                name: updatedStore.name || "",
                slug: updatedStore.slug || "",
                description:
                    updatedStore.description || "",
                phone: updatedStore.phone || "",
                logo: updatedStore.logo || "",
            });

            setLogoFile(null);

            if (
                logoPreview &&
                logoPreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(logoPreview);
            }

            setLogoPreview(
                updatedStore.logo || ""
            );

            setSuccess(
                "Store settings updated successfully."
            );
        } catch (err) {
            console.error(err);

            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0]?.[0];

                setError(
                    firstError ||
                    "Please check your store information."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to update store settings."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-state">
                Loading store settings...
            </div>
        );
    }

    if (!store) {
        return (
            <div className="settings-state">
                <Store size={36} />

                <h2>Store not found</h2>

                <p>{error}</p>
            </div>
        );
    }

    const publicStoreUrl = `/${form.slug}`;

    return (
        <div className="seller-settings-page">

            {/* Header */}
            <div className="settings-header">

                <div>
                    <span className="settings-kicker">
                        STORE MANAGEMENT
                    </span>

                    <h1>Store Settings</h1>

                    <p>
                        Manage your storefront
                        information and public
                        store profile.
                    </p>
                </div>

                <a
                    href={publicStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="settings-view-store"
                >
                    <ExternalLink size={15} />
                    View Store
                </a>
            </div>

            {/* Main */}
            <div className="settings-grid">

                {/* Store Preview */}
                <section className="settings-preview-card">

                    <div className="settings-preview-top">

                        <span className="preview-label">
                            STORE PREVIEW
                        </span>

                        <span className="preview-status">
                            Active
                        </span>
                    </div>

                    <div className="store-preview">

                        <div className="store-preview-logo">

                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt={
                                        form.name ||
                                        "Store logo"
                                    }
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : (
                                <Store size={25} />
                            )}
                        </div>

                        <div className="store-preview-info">

                            <strong>
                                {form.name ||
                                    "Your Store"}
                            </strong>

                            <span>
                                /{form.slug ||
                                    "your-store"}
                            </span>
                        </div>
                    </div>

                    <div className="preview-description">
                        {form.description ||
                            "Your store description will appear here."}
                    </div>

                    <div className="preview-divider" />

                    <div className="preview-meta">

                        <div>
                            <span>
                                Store URL
                            </span>

                            <strong>
                                /{form.slug ||
                                    "your-store"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Phone
                            </span>

                            <strong>
                                {form.phone ||
                                    "Not provided"}
                            </strong>
                        </div>

                    </div>
                </section>

                {/* Settings Form */}
                <section className="settings-form-card">

                    <div className="settings-form-header">

                        <div className="settings-form-icon">
                            <Store size={18} />
                        </div>

                        <div>
                            <h2>
                                Store Information
                            </h2>

                            <p>
                                Update the information
                                customers see on your
                                storefront.
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Store Name */}
                        <div className="settings-field">

                            <label>
                                Store name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="GameHub"
                                required
                            />

                            <small>
                                This is the name
                                customers will see.
                            </small>

                        </div>

                        {/* Slug */}
                        <div className="settings-field">

                            <label>
                                Store URL
                            </label>

                            <div className="slug-input">

                                <span>/</span>

                                <input
                                    type="text"
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleChange}
                                    placeholder="gamehub"
                                    required
                                />

                            </div>

                            <small>
                                Use lowercase letters,
                                numbers and hyphens.
                            </small>

                        </div>

                        {/* Description */}
                        <div className="settings-field">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={handleChange}
                                placeholder="Tell customers about your store..."
                                rows="5"
                            />

                            <small>
                                A short description
                                helps customers
                                understand your store.
                            </small>

                        </div>

                        {/* Phone */}
                        <div className="settings-field">

                            <label>
                                Phone number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="09xxxxxxxxx"
                            />

                        </div>

                        {/* Logo */}
                        <div className="settings-field">

                            <label>
                                Store logo
                            </label>

                            <div className="logo-upload-area">

                                <div className="logo-upload-preview">

                                    {logoPreview ? (
                                        <img
                                            src={
                                                logoPreview
                                            }
                                            alt="Logo preview"
                                            onError={(
                                                e
                                            ) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <Image
                                            size={26}
                                        />
                                    )}

                                </div>

                                <div className="logo-upload-content">

                                    <div className="logo-upload-actions">

                                        <label className="logo-upload-button">
                                            <Upload
                                                size={16}
                                            />

                                            Choose Logo

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={
                                                    handleLogoChange
                                                }
                                                hidden
                                            />
                                        </label>

                                        {logoPreview && (
                                            <button
                                                type="button"
                                                className="logo-remove-button"
                                                onClick={
                                                    handleRemoveLogo
                                                }
                                            >
                                                <X
                                                    size={15}
                                                />

                                                Remove
                                            </button>
                                        )}

                                    </div>

                                    {logoFile ? (
                                        <small>
                                            Selected:{" "}
                                            {
                                                logoFile.name
                                            }
                                        </small>
                                    ) : (
                                        <small>
                                            JPG, PNG or
                                            WEBP · Max
                                            2MB
                                        </small>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="settings-message error">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="settings-message success">

                                <CheckCircle2
                                    size={15}
                                />

                                {success}

                            </div>
                        )}

                        {/* Save */}
                        <div className="settings-actions">

                            <button
                                type="submit"
                                className="settings-save-button"
                                disabled={saving}
                            >
                                <Save size={16} />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </section>

            </div>

        </div>
    );
}

export default SellerSettingsPage;