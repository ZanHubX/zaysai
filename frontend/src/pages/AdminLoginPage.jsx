import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Mail, LoaderCircle } from "lucide-react";
import api from "../services/api";

function AdminLoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const existingToken = localStorage.getItem("admin_token");

    if (existingToken) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/admin/login", {
                email,
                password,
            });

            localStorage.setItem(
                "admin_token",
                response.data.token
            );

            localStorage.setItem(
                "admin_user",
                JSON.stringify(response.data.admin)
            );

            navigate("/admin/dashboard", {
                replace: true,
            });
        } catch (err) {
            console.error(err);

            const validationMessage =
                err.response?.data?.errors?.email?.[0];

            setError(
                validationMessage ||
                err.response?.data?.message ||
                "Invalid admin credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-logo">
                        Z
                    </div>

                    <h1>ZaySai Admin</h1>

                    <p>
                        Sign in to manage your platform
                    </p>
                </div>

                <form
                    className="admin-login-form"
                    onSubmit={handleSubmit}
                >
                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}

                    <div className="admin-input-group">
                        <label htmlFor="admin-email">
                            Email
                        </label>

                        <div className="admin-input-wrapper">
                            <Mail size={18} />

                            <input
                                id="admin-email"
                                type="email"
                                placeholder="admin@zaysai.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-input-group">
                        <label htmlFor="admin-password">
                            Password
                        </label>

                        <div className="admin-input-wrapper">
                            <Lock size={18} />

                            <input
                                id="admin-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="admin-loading-icon"
                                />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLoginPage;