import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    ShoppingBag,
    ArrowUpRight,
    CheckCircle2,
    Image as ImageIcon,
} from "lucide-react";

import api from "../services/api";
import "./SellerOrdersPage.css";

function SellerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [updatingId, setUpdatingId] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | Load Orders
    |--------------------------------------------------------------------------
    */

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/seller/orders");

            setOrders(response.data.orders.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadOrders();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingId(orderId);

            await api.patch(
                `/seller/orders/${orderId}/status`,
                { status }
            );

            await loadOrders();
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Filter Orders
    |--------------------------------------------------------------------------
    */

    const filteredOrders = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return orders.filter((order) => {
            const matchesStatus =
                filter === "all" ||
                order.status === filter;

            const matchesSearch = [
                order.order_number,
                order.customer_name,
                order.customer_phone,
                order.customer_email,
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);

            return matchesStatus && matchesSearch;
        });
    }, [orders, search, filter]);


    /*
    |--------------------------------------------------------------------------
    | Status Count
    |--------------------------------------------------------------------------
    */

    const getCount = (status) => {
        if (status === "all") {
            return orders.length;
        }

        return orders.filter(
            (order) => order.status === status
        ).length;
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="modern-orders-page">

            {/* Header */}

            <div className="orders-page-header">

                <div>

                    <span className="orders-page-label">
                        SALES
                    </span>

                    <h1>
                        Orders
                    </h1>

                    <p>
                        Track and manage customer orders from your store.
                    </p>

                </div>


                <div className="orders-total-badge">

                    <ShoppingBag size={17} />

                    {orders.length} Orders

                </div>

            </div>


            {/* Filter Tabs */}

            <div className="order-filter-tabs">

                {[
                    ["all", "All"],
                    ["pending", "Pending"],
                    ["processing", "Processing"],
                    ["completed", "Completed"],
                    ["cancelled", "Cancelled"],
                ].map(([value, label]) => (

                    <button
                        key={value}
                        className={
                            filter === value
                                ? "order-filter active"
                                : "order-filter"
                        }
                        onClick={() =>
                            setFilter(value)
                        }
                    >

                        {label}

                        <span>
                            {getCount(value)}
                        </span>

                    </button>

                ))}

            </div>


            {/* Orders Card */}

            <div className="modern-orders-card">

                {/* Toolbar */}

                <div className="orders-toolbar">

                    <div>

                        <h2>
                            Customer orders
                        </h2>

                        <p>
                            {filteredOrders.length} results
                        </p>

                    </div>


                    <div className="order-search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search customer or order..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {/* Loading */}

                {loading ? (

                    <div className="orders-empty-state">

                        Loading orders...

                    </div>

                ) : error ? (

                    /* Error */

                    <div className="orders-empty-state error">

                        {error}

                    </div>

                ) : filteredOrders.length === 0 ? (

                    /* Empty */

                    <div className="orders-empty-state">

                        <ShoppingBag size={34} />

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            Try changing your search or filter.
                        </p>

                    </div>

                ) : (

                    /* Orders Table */

                    <div className="modern-orders-table-wrapper">

                        <table className="modern-orders-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th></th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredOrders.map(
                                    (order) => (

                                        <tr
                                            key={order.id}
                                        >

                                            {/* Order */}

                                            <td>

                                                <div className="order-main-info">

                                                    <strong>
                                                        {order.order_number}
                                                    </strong>

                                                    <span>
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleDateString()}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Customer */}

                                            <td>

                                                <div className="customer-info">

                                                    <strong>
                                                        {
                                                            order.customer_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            order.customer_phone
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Total */}

                                            <td className="modern-order-total">

                                                {Number(
                                                    order.total
                                                ).toLocaleString()}{" "}

                                                <span>
                                                    {order.currency}
                                                </span>

                                            </td>


                                            {/* Payment */}

                                            <td>

                                                <div className="order-payment-info">

                                                    <span
                                                        className={`modern-payment ${order.payment_status
                                                            }`}
                                                    >
                                                        {
                                                            order.payment_status
                                                        }
                                                    </span>


                                                    {order.payment_proof ? (

                                                        <span className="payment-proof-badge uploaded">

                                                            <CheckCircle2
                                                                size={13}
                                                            />

                                                            Proof Uploaded

                                                        </span>

                                                    ) : (

                                                        <span className="payment-proof-badge missing">

                                                            <ImageIcon
                                                                size={13}
                                                            />

                                                            No Proof

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* Order Status */}

                                            <td>

                                                <select
                                                    className={`modern-order-status ${order.status}`}
                                                    value={
                                                        order.status
                                                    }
                                                    disabled={
                                                        updatingId ===
                                                        order.id
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="pending">
                                                        Pending
                                                    </option>

                                                    <option value="processing">
                                                        Processing
                                                    </option>

                                                    <option value="completed">
                                                        Completed
                                                    </option>

                                                    <option value="cancelled">
                                                        Cancelled
                                                    </option>

                                                </select>

                                            </td>


                                            {/* View */}

                                            <td>

                                                <Link
                                                    to={`/seller/orders/${order.id}`}
                                                    className="modern-view-order"
                                                >

                                                    View

                                                    <ArrowUpRight
                                                        size={14}
                                                    />

                                                </Link>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default SellerOrdersPage;