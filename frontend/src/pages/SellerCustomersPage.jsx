import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";

import api from "../services/api";

import "./SellerCustomersPage.css";

function SellerCustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/seller/customers"
            );

            setCustomers(
                response.data.customers || []
            );
        } catch (error) {
            console.error(
                "Failed to load customers:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load customers."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(
        (customer) => {
            const keyword = search
                .toLowerCase()
                .trim();

            if (!keyword) {
                return true;
            }

            return (
                customer.customer_name
                    ?.toLowerCase()
                    .includes(keyword) ||
                customer.customer_phone
                    ?.toLowerCase()
                    .includes(keyword) ||
                customer.customer_email
                    ?.toLowerCase()
                    .includes(keyword)
            );
        }
    );

    return (
        <div className="seller-customers-page">
            {/* =================================
                Header
            ================================= */}

            <div className="customers-header">
                <div className="customers-title-row">
                    <div className="customers-title-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <h1>Customers</h1>

                        <p>
                            View customers who have
                            ordered from your store.
                        </p>
                    </div>
                </div>

                <div className="customers-count">
                    {customers.length} Customers
                </div>
            </div>

            {/* =================================
                Search
            ================================= */}

            <div className="customers-toolbar">
                <div className="customers-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>
            </div>

            {/* =================================
                Loading
            ================================= */}

            {loading && (
                <div className="customers-state">
                    Loading customers...
                </div>
            )}

            {/* =================================
                Error
            ================================= */}

            {!loading && error && (
                <div className="customers-state customers-error">
                    {error}
                </div>
            )}

            {/* =================================
                Empty State
            ================================= */}

            {!loading &&
                !error &&
                filteredCustomers.length === 0 && (
                    <div className="customers-empty">
                        <Users size={36} />

                        <h3>
                            No customers found
                        </h3>

                        <p>
                            Customers will appear here
                            after they place orders.
                        </p>
                    </div>
                )}

            {/* =================================
                Customers Table
            ================================= */}

            {!loading &&
                !error &&
                filteredCustomers.length > 0 && (
                    <div className="customers-table-card">
                        <div className="customers-table-wrapper">
                            <table className="customers-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Orders
                                        </th>

                                        <th>
                                            Total Spent
                                        </th>

                                        <th>
                                            Last Order
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCustomers.map(
                                        (customer) => (
                                            <tr
                                                key={
                                                    customer.customer_phone
                                                }
                                            >
                                                {/* Customer */}
                                                <td>
                                                    <div className="customer-name">
                                                        {
                                                            customer.customer_name
                                                        }
                                                    </div>

                                                    {customer.contact_username && (
                                                        <div className="customer-contact">
                                                            {
                                                                customer.contact_username
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Phone */}
                                                <td>
                                                    {
                                                        customer.customer_phone
                                                    }
                                                </td>

                                                {/* Email */}
                                                <td>
                                                    {
                                                        customer.customer_email ||
                                                        "—"
                                                    }
                                                </td>

                                                {/* Orders */}
                                                <td>
                                                    {
                                                        customer.total_orders
                                                    }
                                                </td>

                                                {/* Total Spent */}
                                                <td>
                                                    {Number(
                                                        customer.total_spent ||
                                                        0
                                                    ).toLocaleString()}{" "}
                                                    MMK
                                                </td>

                                                {/* Last Order */}
                                                <td>
                                                    {customer.last_order_at
                                                        ? new Date(
                                                            customer.last_order_at
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default SellerCustomersPage;