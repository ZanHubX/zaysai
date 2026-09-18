import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    ArrowRight,
    Eye,
    EyeOff,
    Package,
    ShoppingBag,
    BarChart3,
} from "lucide-react";

import api from "../services/api";
import "./SellerLoginPage.css";

function SellerLoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/login", {
                email,
                password,
            });

            localStorage.setItem(
                "seller_token",
                response.data.token
            );

            navigate("/seller/dashboard");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-shell">

            {/* Brand Side */}
            <section className="login-brand-panel">

                <div className="login-brand-top">
                    <div className="login-logo">
                        Z
                    </div>

                    <div>
                        <h2>ZaySai</h2>
                        <span>Seller Console</span>
                    </div>
                </div>

                <div className="login-brand-content">

                    <span className="login-kicker">
                        YOUR STORE. YOUR SPACE.
                    </span>

                    <h1>
                        Run your online store
                        <span> without the noise.</span>
                    </h1>

                    <p>
                        Manage products, orders and customers
                        from one simple workspace.
                    </p>

                    <div className="login-features">

                        <div>
                            <Package size={20} />

                            <span>
                                Manage your products
                            </span>
                        </div>

                        <div>
                            <ShoppingBag size={20} />

                            <span>
                                Track customer orders
                            </span>
                        </div>

                        <div>
                            <BarChart3 size={20} />

                            <span>
                                Grow your store
                            </span>
                        </div>

                    </div>

                </div>

                <div className="login-brand-footer">
                    Built for independent online sellers.
                </div>

            </section>


            {/* Login Side */}
            <section className="login-form-panel">

                <div className="login-form-box">

                    <div className="mobile-brand">
                        <div className="login-logo">
                            Z
                        </div>

                        <strong>ZaySai</strong>
                    </div>

                    <div className="login-form-heading">

                        <div className="login-store-icon">
                            <Store size={21} />
                        </div>

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to manage your store.
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        <div className="login-field">
                            <label>Email address</label>

                            <input
                                type="email"
                                placeholder="seller@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>


                        <div className="login-field">
                            <label>Password</label>

                            <div className="password-field">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>
                        </div>


                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </span>

                            {!loading && (
                                <ArrowRight size={17} />
                            )}
                        </button>

                    </form>


                    <div className="login-security-text">
                        Protected seller access · ZaySai
                    </div>

                </div>

            </section>

        </div>
    );
}

export default SellerLoginPage;