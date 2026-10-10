import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Store,
    User,
    Mail,
    Package,
    ShoppingCart,
    ExternalLink,
    LoaderCircle,
    AlertCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import "./AdminStoreDetailPage.css";



function AdminStoreDetailPage() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [store, setStore] = useState(null);

    const [seller, setSeller] = useState(null);

    const [products, setProducts] = useState([]);

    const [ordersCount, setOrdersCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Fetch Store
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const fetchStore = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/admin/stores/${id}`
                );

                const data = response.data;

                setStore(data.store || null);

                setSeller(data.seller || null);

                setProducts(data.products || []);

                setOrdersCount(
                    data.orders_count || 0
                );

            } catch (err) {

                console.error(
                    "Admin store detail error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load store."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchStore();

    }, [id]);


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
    | Format Price
    |--------------------------------------------------------------------------
    */

    const formatPrice = (
        price,
        currency = "MMK"
    ) => {

        return `${Number(
            price || 0
        ).toLocaleString()} ${currency}`;

    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="admin-store-detail-page">

                <div className="admin-store-detail-state">

                    <LoaderCircle
                        size={28}
                        className="admin-loading-icon"
                    />

                    <p>
                        Loading store...
                    </p>

                </div>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !store) {

        return (

            <div className="admin-store-detail-page">

                <div className="admin-store-detail-error">

                    <AlertCircle size={22} />

                    <span>
                        {error || "Store not found."}
                    </span>

                </div>

                <button
                    type="button"
                    className="admin-store-back-button"
                    onClick={() =>
                        navigate("/admin/stores")
                    }
                >

                    <ArrowLeft size={17} />

                    Back to Stores

                </button>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Product Stats
    |--------------------------------------------------------------------------
    */

    const activeProducts = products.filter(
        (product) =>
            product.is_active === true
    ).length;

    const inactiveProducts =
        products.length - activeProducts;


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="admin-store-detail-page">


            {/* =========================================================
                BACK BUTTON
            ========================================================= */}

            <button
                type="button"
                className="admin-store-back-button"
                onClick={() =>
                    navigate("/admin/stores")
                }
            >

                <ArrowLeft size={17} />

                Back to Stores

            </button>


            {/* =========================================================
                STORE HEADER
            ========================================================= */}

            <div className="admin-store-detail-header">


                <div className="admin-store-detail-header-left">


                    {/* =================================================
                        FIXED STORE LOGO
                    ================================================= */}

                    <div
                        className="admin-store-detail-logo"
                        style={{
                            width: "64px",
                            height: "64px",
                            minWidth: "64px",
                            maxWidth: "64px",
                            minHeight: "64px",
                            maxHeight: "64px",
                            flex: "0 0 64px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "14px",
                            border: "1px solid #e5e7eb",
                            background: "#ffffff",
                            boxSizing: "border-box",
                        }}
                    >

                        {store.logo ? (

                            <img
                                src={store.logo}
                                alt={store.name}
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    maxWidth: "56px",
                                    maxHeight: "56px",
                                    minWidth: "56px",
                                    minHeight: "56px",
                                    objectFit: "contain",
                                    display: "block",
                                    borderRadius: "10px",
                                }}
                            />

                        ) : (

                            <Store
                                size={30}
                            />

                        )}

                    </div>


                    {/* =================================================
                        STORE TITLE
                    ================================================= */}

                    <div
                        className="admin-store-detail-title"
                        style={{
                            minWidth: 0,
                        }}
                    >

                        <div className="admin-store-detail-label">
                            STORE DETAILS
                        </div>

                        <h1>
                            {store.name}
                        </h1>

                        <p>
                            /{store.slug}
                        </p>

                    </div>

                </div>


                {/* =================================================
                    STORE STATUS
                ================================================= */}

                <div>

                    {store.status === "active" ? (

                        <span className="admin-store-status active">

                            <CheckCircle2 size={15} />

                            Active

                        </span>

                    ) : (

                        <span className="admin-store-status inactive">

                            <XCircle size={15} />

                            {store.status || "Inactive"}

                        </span>

                    )}

                </div>

            </div>


            {/* =========================================================
                STATS
            ========================================================= */}

            <div className="admin-store-stats-grid">


                {/* Total Products */}

                <div className="admin-store-stat-card">

                    <div className="admin-store-stat-icon">

                        <Package size={20} />

                    </div>

                    <div>

                        <span>
                            Total Products
                        </span>

                        <strong>
                            {products.length}
                        </strong>

                    </div>

                </div>


                {/* Total Orders */}

                <div className="admin-store-stat-card">

                    <div className="admin-store-stat-icon">

                        <ShoppingCart size={20} />

                    </div>

                    <div>

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {ordersCount}
                        </strong>

                    </div>

                </div>


                {/* Active Products */}

                <div className="admin-store-stat-card">

                    <div className="admin-store-stat-icon">

                        <CheckCircle2 size={20} />

                    </div>

                    <div>

                        <span>
                            Active Products
                        </span>

                        <strong>
                            {activeProducts}
                        </strong>

                    </div>

                </div>


                {/* Inactive Products */}

                <div className="admin-store-stat-card">

                    <div className="admin-store-stat-icon">

                        <XCircle size={20} />

                    </div>

                    <div>

                        <span>
                            Inactive Products
                        </span>

                        <strong>
                            {inactiveProducts}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================================
                STORE + SELLER
            ========================================================= */}

            <div className="admin-store-detail-grid">


                {/* =====================================================
                    STORE INFORMATION
                ===================================================== */}

                <div className="admin-store-card">

                    <div className="admin-store-card-header">

                        <div>

                            <h2>
                                Store Information
                            </h2>

                            <p>
                                Basic information about this store
                            </p>

                        </div>

                        <Store size={20} />

                    </div>


                    <div className="admin-store-info-list">


                        <div className="admin-store-info-item">

                            <span>
                                Store Name
                            </span>

                            <strong>
                                {store.name}
                            </strong>

                        </div>


                        <div className="admin-store-info-item">

                            <span>
                                Store Slug
                            </span>

                            <strong>
                                /{store.slug}
                            </strong>

                        </div>


                        <div className="admin-store-info-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                {store.status || "-"}
                            </strong>

                        </div>


                        <div className="admin-store-info-item">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {store.phone || "-"}
                            </strong>

                        </div>


                        <div className="admin-store-info-item">

                            <span>
                                Created
                            </span>

                            <strong>
                                {formatDate(
                                    store.created_at
                                )}
                            </strong>

                        </div>


                        <div className="admin-store-info-item">

                            <span>
                                Updated
                            </span>

                            <strong>
                                {formatDate(
                                    store.updated_at
                                )}
                            </strong>

                        </div>

                    </div>


                    {store.description && (

                        <div className="admin-store-description">

                            <span>
                                Description
                            </span>

                            <p>
                                {store.description}
                            </p>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    SELLER INFORMATION
                ===================================================== */}

                <div className="admin-store-card">

                    <div className="admin-store-card-header">

                        <div>

                            <h2>
                                Seller Information
                            </h2>

                            <p>
                                Store owner account
                            </p>

                        </div>

                        <User size={20} />

                    </div>


                    {seller ? (

                        <>

                            <div className="admin-store-seller">

                                <div className="admin-store-seller-avatar">

                                    <User size={22} />

                                </div>

                                <div className="admin-store-seller-main">

                                    <strong>
                                        {seller.name}
                                    </strong>

                                    <span>
                                        Seller ID #{seller.id}
                                    </span>

                                </div>

                            </div>


                            <div className="admin-store-info-list">


                                <div className="admin-store-info-item">

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {seller.name || "-"}
                                    </strong>

                                </div>


                                <div className="admin-store-info-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong
                                        className="admin-store-break-text"
                                    >

                                        <Mail
                                            size={14}
                                        />

                                        {seller.email || "-"}

                                    </strong>

                                </div>


                                <div className="admin-store-info-item">

                                    <span>
                                        Account Status
                                    </span>

                                    <strong>
                                        {seller.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </strong>

                                </div>


                                <div className="admin-store-info-item">

                                    <span>
                                        Joined
                                    </span>

                                    <strong>
                                        {formatDate(
                                            seller.created_at
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </>

                    ) : (

                        <div className="admin-store-empty">

                            Seller information unavailable.

                        </div>

                    )}

                </div>

            </div>


            {/* =========================================================
                PRODUCTS
            ========================================================= */}

            <div className="admin-store-card admin-store-products-card">


                <div className="admin-store-card-header">

                    <div>

                        <h2>
                            Products
                        </h2>

                        <p>
                            Products belonging to this store
                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-store-view-button"
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >

                        View All Products

                        <ExternalLink
                            size={15}
                        />

                    </button>

                </div>


                {products.length === 0 ? (

                    <div className="admin-store-empty">

                        <Package size={30} />

                        <p>
                            No products found.
                        </p>

                    </div>

                ) : (

                    <div className="admin-store-products-wrapper">

                        <table className="admin-store-products-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {products.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/products/${product.id}`
                                                )
                                            }
                                        >

                                            <td>

                                                <div className="admin-store-product-name">

                                                    <div
                                                        className="admin-store-product-icon"
                                                        style={{
                                                            width: "34px",
                                                            height: "34px",
                                                            minWidth: "34px",
                                                            maxWidth: "34px",
                                                            minHeight: "34px",
                                                            maxHeight: "34px",
                                                            overflow: "hidden",
                                                        }}
                                                    >

                                                        {product.image ? (

                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain",
                                                                    display: "block",
                                                                }}
                                                            />

                                                        ) : (

                                                            <Package
                                                                size={17}
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <span>
                                                            /{product.slug}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <strong>
                                                    {formatPrice(
                                                        product.price,
                                                        product.currency
                                                    )}
                                                </strong>

                                            </td>


                                            <td>

                                                {product.is_active ? (

                                                    <span className="admin-product-status active">

                                                        <CheckCircle2
                                                            size={14}
                                                        />

                                                        Active

                                                    </span>

                                                ) : (

                                                    <span className="admin-product-status inactive">

                                                        <XCircle
                                                            size={14}
                                                        />

                                                        Inactive

                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                {formatDate(
                                                    product.created_at
                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =========================================================
                PUBLIC STOREFRONT
            ========================================================= */}

            <div className="admin-store-public-link">

                <div>

                    <strong>
                        Public Storefront
                    </strong>

                    <span>
                        /{store.slug}
                    </span>

                </div>


                <a
                    href={`/${store.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    Open Store

                    <ExternalLink
                        size={15}
                    />

                </a>

            </div>


        </div>

    );

}


export default AdminStoreDetailPage;