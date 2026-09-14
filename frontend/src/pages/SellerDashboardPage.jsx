import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SellerDashboardPage.css";

function SellerDashboardPage() {
    const navigate = useNavigate();

    const [seller, setSeller] = useState(null);
    const [store, setStore] = useState(null);

    const [productCount, setProductCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [meResponse, productsResponse, ordersResponse] =
                    await Promise.all([
                        api.get("/me"),
                        api.get("/seller/products"),
                        api.get("/seller/orders"),
                    ]);

                setSeller(meResponse.data.user);
                setStore(meResponse.data.store);

                setProductCount(
                    productsResponse.data.products.total
                );

                setOrderCount(
                    ordersResponse.data.orders.total
                );

                setRecentOrders(
                    ordersResponse.data.orders.data.slice(0, 5)
                );
            } catch (error) {
                console.error(error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("seller_token");
                    navigate("/seller/login");
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("seller_token");

        navigate("/seller/login");
    };

    if (loading) {
        return (
            <div className="dashboard-message">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="dashboard">

            <header className="dashboard-header">
                <div>
                    <h1>{store?.name}</h1>

                    <p>
                        Welcome back, {seller?.name}
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>


            <section className="stats-grid">

                <div className="stat-card">
                    <span>Products</span>
                    <strong>{productCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Orders</span>
                    <strong>{orderCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Store Status</span>
                    <strong>
                        {store?.status || "Unknown"}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>Store URL</span>

                    <strong className="store-url">
                        /{store?.slug}
                    </strong>
                </div>

            </section>


            <section className="dashboard-section">

                <div className="section-header">
                    <h2>Recent Orders</h2>
                </div>

                {recentOrders.length === 0 ? (
                    <p>No orders yet.</p>
                ) : (
                    <div className="orders-table-wrapper">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>

                            <tbody>

                                {recentOrders.map((order) => (
                                    <tr key={order.id}>

                                        <td>
                                            {order.order_number}
                                        </td>

                                        <td>
                                            {order.customer_name}
                                        </td>

                                        <td>
                                            {Number(order.total).toLocaleString()}{" "}
                                            {order.currency}
                                        </td>

                                        <td>
                                            <span className="status">
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            {order.payment_status}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}

export default SellerDashboardPage;