import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function ProductDetailPage() {
    const { slug, productSlug } = useParams();

    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [orderNumber, setOrderNumber] = useState("");

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await api.get(
                    `/stores/${slug}/products/${productSlug}`
                );

                setStore(response.data.store);
                setProduct(response.data.product);
            } catch (err) {
                console.error(err);
                setError("Product not found.");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug, productSlug]);

    const handleOrder = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const response = await api.post(`/stores/${slug}/orders`, {
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail || null,

                items: [
                    {
                        product_id: product.id,
                        quantity: Number(quantity),
                    },
                ],
            });

            setSuccess("Order placed successfully!");
            setOrderNumber(response.data.order.order_number);

            setCustomerName("");
            setCustomerPhone("");
            setCustomerEmail("");
            setQuantity(1);
        } catch (err) {
            console.error(err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to place order.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <h2 style={{ padding: "40px" }}>Loading product...</h2>;
    }

    if (!product) {
        return <h2 style={{ padding: "40px" }}>{error}</h2>;
    }

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "50px auto",
                padding: "30px",
                background: "#fff",
                borderRadius: "16px",
            }}
        >
            <Link to={`/${slug}`}>← Back to {store.name}</Link>

            <div
                style={{
                    height: "300px",
                    background: "#eeeef2",
                    marginTop: "25px",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",
                        }}
                    />
                ) : (
                    <span>No Image</span>
                )}
            </div>

            <h1>{product.name}</h1>

            <p>{product.description}</p>

            <h2>
                {Number(product.price).toLocaleString()} {product.currency}
            </h2>

            <hr style={{ margin: "30px 0" }} />

            <h2>Order Now</h2>

            <form onSubmit={handleOrder}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="email"
                    placeholder="Email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={inputStyle}
                />

                <label>Quantity</label>

                <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={inputStyle}
                />

                <p>
                    Total:{" "}
                    <strong>
                        {(Number(product.price) * Number(quantity)).toLocaleString()}{" "}
                        {product.currency}
                    </strong>
                </p>

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                {success && (
                    <div
                        style={{
                            padding: "15px",
                            background: "#eef8ee",
                            borderRadius: "8px",
                            marginBottom: "15px",
                        }}
                    >
                        <strong>{success}</strong>

                        <p>
                            Order Number: {orderNumber}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: "100%",
                        padding: "14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#222",
                        color: "#fff",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                >
                    {submitting ? "Placing Order..." : "Place Order"}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0 16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
};

export default ProductDetailPage;