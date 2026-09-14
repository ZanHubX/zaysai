import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SellerLoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
        <div
            style={{
                maxWidth: "420px",
                margin: "100px auto",
                padding: "35px",
                background: "white",
                borderRadius: "16px",
            }}
        >
            <h1>ZaySai</h1>
            <h2>Seller Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={buttonStyle}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "13px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
};

const buttonStyle = {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#222",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
};

export default SellerLoginPage;