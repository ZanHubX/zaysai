import { useEffect, useState } from "react";

import {
    Store,
    Package,
    ShoppingCart,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";


function AdminStoresPage() {

    const navigate = useNavigate();

    const [stores, setStores] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Fetch Stores
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchStores();
    }, []);


    const fetchStores = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/admin/stores"
            );


            setStores(
                response.data.stores || []
            );

        } catch (err) {

            console.error(err);


            setError(
                err.response?.data?.message ||
                "Failed to load stores."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="admin-dashboard-loading">

                <LoaderCircle
                    size={32}
                    className="admin-loading-icon"
                />

                <p>
                    Loading stores...
                </p>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {

        return (

            <div className="admin-dashboard-error">

                <AlertCircle size={20} />

                <span>
                    {error}
                </span>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="admin-dashboard">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="admin-dashboard-header">

                <div>

                    <h1>
                        Stores
                    </h1>

                    <p>
                        Manage stores across the ZaySai platform
                    </p>

                </div>


                <div className="admin-page-count">

                    <Store size={17} />

                    <span>
                        {stores.length} Stores
                    </span>

                </div>

            </div>


            {/* =========================================================
                STORES TABLE
            ========================================================= */}

            <div className="admin-section">


                {/* Section Header */}

                <div className="admin-section-header">

                    <div>

                        <h2>
                            All Stores
                        </h2>

                        <p>
                            Store information and platform activity
                        </p>

                    </div>

                </div>


                {/* Table */}

                <div className="admin-table-wrapper">

                    <table className="admin-table">


                        {/* =================================================
                            TABLE HEADER
                        ================================================= */}

                        <thead>

                            <tr>

                                <th>
                                    Store
                                </th>

                                <th>
                                    Owner
                                </th>

                                <th>
                                    Products
                                </th>

                                <th>
                                    Orders
                                </th>

                                <th>
                                    Created
                                </th>

                            </tr>

                        </thead>


                        {/* =================================================
                            TABLE BODY
                        ================================================= */}

                        <tbody>

                            {stores.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="admin-empty"
                                    >
                                        No stores found.
                                    </td>

                                </tr>

                            ) : (

                                stores.map((store) => (

                                    <tr
                                        key={store.id}
                                        onClick={() =>
                                            navigate(
                                                `/admin/stores/${store.id}`
                                            )
                                        }
                                        style={{
                                            cursor: "pointer",
                                        }}
                                    >


                                        {/* =================================
                                            STORE
                                        ================================= */}

                                        <td>

                                            <div className="admin-store-cell">


                                                {/* Store Logo */}

                                                <div
                                                    className="admin-store-avatar"
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        minWidth: "32px",
                                                        minHeight: "32px",
                                                        overflow: "hidden",
                                                    }}
                                                >

                                                    {store.logo ? (

                                                        <img
                                                            src={store.logo}
                                                            alt={store.name}
                                                            style={{
                                                                width: "32px",
                                                                height: "32px",
                                                                objectFit: "contain",
                                                                borderRadius: "7px",
                                                                display: "block",
                                                            }}
                                                        />

                                                    ) : (

                                                        <Store
                                                            size={18}
                                                        />

                                                    )}

                                                </div>


                                                {/* Store Name */}

                                                <div>

                                                    <strong>
                                                        {store.name}
                                                    </strong>

                                                    <span>
                                                        /{store.slug}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                            OWNER
                                        ================================= */}

                                        <td>

                                            {store.seller ? (

                                                <div className="admin-owner-cell">

                                                    <strong>
                                                        {store.seller.name}
                                                    </strong>

                                                    <span>
                                                        {store.seller.email}
                                                    </span>

                                                </div>

                                            ) : (

                                                "-"

                                            )}

                                        </td>


                                        {/* =================================
                                            PRODUCTS
                                        ================================= */}

                                        <td>

                                            <div className="admin-number-cell">

                                                <Package
                                                    size={16}
                                                />

                                                <strong>
                                                    {store.products_count ?? 0}
                                                </strong>

                                            </div>

                                        </td>


                                        {/* =================================
                                            ORDERS
                                        ================================= */}

                                        <td>

                                            <div className="admin-number-cell">

                                                <ShoppingCart
                                                    size={16}
                                                />

                                                <strong>
                                                    {store.orders_count ?? 0}
                                                </strong>

                                            </div>

                                        </td>


                                        {/* =================================
                                            CREATED
                                        ================================= */}

                                        <td>

                                            {formatDate(
                                                store.created_at
                                            )}

                                        </td>


                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}


export default AdminStoresPage;