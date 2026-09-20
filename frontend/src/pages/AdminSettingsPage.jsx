import { useEffect, useState } from "react";
import {
    Settings,
    Save,
    LoaderCircle,
    AlertCircle,
    CheckCircle2,
    Globe,
    Mail,
    Send,
    Coins,
    Users,
    Wrench,
} from "lucide-react";
import api from "../services/api";

function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        platform_name: "",
        platform_description: "",
        support_email: "",
        support_telegram: "",
        currency: "MMK",
        seller_registration: true,
        maintenance_mode: false,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/settings");

            const data = response.data.settings || {};

            setSettings({
                platform_name: data.platform_name || "",
                platform_description:
                    data.platform_description || "",
                support_email: data.support_email || "",
                support_telegram:
                    data.support_telegram || "",
                currency: data.currency || "MMK",
                seller_registration:
                    data.seller_registration ?? true,
                maintenance_mode:
                    data.maintenance_mode ?? false,
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load settings."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setSettings((current) => ({
            ...current,
            [name]: value,
        }));

        setSuccess("");
    };

    const handleToggle = (name) => {
        setSettings((current) => ({
            ...current,
            [name]: !current[name],
        }));

        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await api.put(
                "/admin/settings",
                settings
            );

            if (response.data.settings) {
                setSettings(response.data.settings);
            }

            setSuccess(
                response.data.message ||
                "Settings updated successfully."
            );
        } catch (err) {
            console.error(err);

            const validationErrors =
                err.response?.data?.errors;

            const firstValidationError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : null;

            setError(
                firstValidationError ||
                err.response?.data?.message ||
                "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <LoaderCircle
                    size={32}
                    className="admin-loading-icon"
                />

                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* Header */}
            <div className="admin-dashboard-header">
                <div>
                    <h1>Settings</h1>

                    <p>
                        Manage your ZaySai platform settings
                    </p>
                </div>

                <div className="admin-page-count">
                    <Settings size={17} />

                    <span>Platform Settings</span>
                </div>
            </div>


            {/* Error */}
            {error && (
                <div className="admin-settings-alert error">
                    <AlertCircle size={18} />

                    <span>{error}</span>
                </div>
            )}


            {/* Success */}
            {success && (
                <div className="admin-settings-alert success">
                    <CheckCircle2 size={18} />

                    <span>{success}</span>
                </div>
            )}


            <form onSubmit={handleSubmit}>

                {/* Platform Settings */}
                <div className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div className="admin-settings-card-icon">
                            <Globe size={19} />
                        </div>

                        <div>
                            <h2>Platform Settings</h2>

                            <p>
                                Basic information about your
                                ZaySai platform
                            </p>
                        </div>

                    </div>


                    <div className="admin-settings-grid">

                        {/* Platform Name */}
                        <div className="admin-settings-field">

                            <label htmlFor="platform_name">
                                Platform Name
                            </label>

                            <div className="admin-settings-input">

                                <Globe size={17} />

                                <input
                                    id="platform_name"
                                    name="platform_name"
                                    type="text"
                                    value={
                                        settings.platform_name
                                    }
                                    onChange={handleChange}
                                    placeholder="ZaySai"
                                    required
                                />

                            </div>

                        </div>


                        {/* Currency */}
                        <div className="admin-settings-field">

                            <label htmlFor="currency">
                                Currency
                            </label>

                            <div className="admin-settings-input">

                                <Coins size={17} />

                                <select
                                    id="currency"
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleChange}
                                >
                                    <option value="MMK">
                                        MMK
                                    </option>

                                    <option value="THB">
                                        THB
                                    </option>

                                    <option value="USD">
                                        USD
                                    </option>
                                </select>

                            </div>

                        </div>


                        {/* Description */}
                        <div className="admin-settings-field full">

                            <label htmlFor="platform_description">
                                Platform Description
                            </label>

                            <textarea
                                id="platform_description"
                                name="platform_description"
                                value={
                                    settings.platform_description
                                }
                                onChange={handleChange}
                                placeholder="Describe your platform..."
                                rows="4"
                            />

                        </div>

                    </div>

                </div>


                {/* Support */}
                <div className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div className="admin-settings-card-icon">
                            <Send size={19} />
                        </div>

                        <div>
                            <h2>Support Contact</h2>

                            <p>
                                Contact information for
                                platform support
                            </p>
                        </div>

                    </div>


                    <div className="admin-settings-grid">

                        {/* Email */}
                        <div className="admin-settings-field">

                            <label htmlFor="support_email">
                                Support Email
                            </label>

                            <div className="admin-settings-input">

                                <Mail size={17} />

                                <input
                                    id="support_email"
                                    name="support_email"
                                    type="email"
                                    value={
                                        settings.support_email
                                    }
                                    onChange={handleChange}
                                    placeholder="support@zaysai.com"
                                />

                            </div>

                        </div>


                        {/* Telegram */}
                        <div className="admin-settings-field">

                            <label htmlFor="support_telegram">
                                Support Telegram
                            </label>

                            <div className="admin-settings-input">

                                <Send size={17} />

                                <input
                                    id="support_telegram"
                                    name="support_telegram"
                                    type="text"
                                    value={
                                        settings.support_telegram
                                    }
                                    onChange={handleChange}
                                    placeholder="@zaysai_support"
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* Platform Controls */}
                <div className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div className="admin-settings-card-icon">
                            <Wrench size={19} />
                        </div>

                        <div>
                            <h2>Platform Controls</h2>

                            <p>
                                Control important platform
                                behaviors
                            </p>
                        </div>

                    </div>


                    <div className="admin-settings-options">

                        {/* Seller Registration */}
                        <div className="admin-settings-option">

                            <div className="admin-settings-option-info">

                                <div className="admin-settings-option-icon">
                                    <Users size={18} />
                                </div>

                                <div>
                                    <strong>
                                        Seller Registration
                                    </strong>

                                    <p>
                                        Allow new sellers to
                                        register on ZaySai
                                    </p>
                                </div>

                            </div>


                            <button
                                type="button"
                                className={`admin-toggle ${settings.seller_registration
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    handleToggle(
                                        "seller_registration"
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        {/* Maintenance Mode */}
                        <div className="admin-settings-option">

                            <div className="admin-settings-option-info">

                                <div className="admin-settings-option-icon">
                                    <Wrench size={18} />
                                </div>

                                <div>
                                    <strong>
                                        Maintenance Mode
                                    </strong>

                                    <p>
                                        Temporarily put the
                                        platform into maintenance
                                        mode
                                    </p>
                                </div>

                            </div>


                            <button
                                type="button"
                                className={`admin-toggle ${settings.maintenance_mode
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    handleToggle(
                                        "maintenance_mode"
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>

                    </div>

                </div>


                {/* Save */}
                <div className="admin-settings-actions">

                    <button
                        type="submit"
                        className="admin-settings-save"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="admin-loading-icon"
                                />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />

                                Save Settings
                            </>
                        )}
                    </button>

                </div>

            </form>
        </div>
    );
}

export default AdminSettingsPage;