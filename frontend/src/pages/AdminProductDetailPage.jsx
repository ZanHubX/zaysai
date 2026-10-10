import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    Store,
    User,
    LoaderCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";

import api from "../services/api";


function AdminProductDetailPage() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [product, setProduct] = useState(null);

    const [store, setStore] = useState(null);

    const [seller, setSeller] = useState(null);


    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(false);


    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Fetch Product
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        fetchProduct();

    }, [id]);


    const fetchProduct = async () => {

        try {

            setLoading(true);

            setError("");

            setSuccess("");


            const response = await api.get(
                `/admin/products/${id}`
            );


            setProduct(
                response.data.product
            );

            setStore(
                response.data.store
            );

            setSeller(
                response.data.seller
            );

        } catch (err) {

            console.error(
                "Admin product detail error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Failed to load product."
            );

        } finally {

            setLoading(false);

        }

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
    | Status Class
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {

        return status === "active"
            ? "admin-status-badge active"
            : "admin-status-badge inactive";

    };


    /*
    |--------------------------------------------------------------------------
    | Toggle Product Status
    |--------------------------------------------------------------------------
    */

    const handleToggleStatus = async () => {

        if (!product || actionLoading) {

            return;

        }


        const isCurrentlyActive =
            product.is_active === true ||
            product.status === "active";


        const nextStatus =
            !isCurrentlyActive;


        const confirmMessage = nextStatus
            ? `Are you sure you want to activate "${product.name}"?`
            : `Are you sure you want to deactivate "${product.name}"?`;


        const confirmed =
            window.confirm(confirmMessage);


        if (!confirmed) {

            return;

        }


        try {

            setActionLoading(true);

            setError("");

            setSuccess("");


            const response = await api.patch(
                `/admin/products/${id}/status`,
                {
                    is_active: nextStatus,
                }
            );


            const updatedProduct =
                response.data.product;


            setProduct((prev) => ({

                ...prev,

                is_active:
                    Boolean(
                        updatedProduct.is_active
                    ),

                status:
                    updatedProduct.status,

            }));


            setSuccess(
                response.data.message ||
                (
                    nextStatus
                        ? "Product activated successfully."
                        : "Product deactivated successfully."
                )
            );

        } catch (err) {

            console.error(
                "Admin product status update error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Failed to update product status."
            );

        } finally {

            setActionLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="admin-page-loading">

                <LoaderCircle
                    size={24}
                    className="admin-loading-icon"
                />

                <span>
                    Loading product...
                </span>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !product) {

        return (

            <div className="admin-page">

                <div className="admin-error-card">

                    {error ||
                        "Product not found."}

                </div>


                <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                        navigate(
                            "/admin/products"
                        )
                    }
                >

                    <ArrowLeft size={17} />

                    Back to Products

                </button>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Current Status
    |--------------------------------------------------------------------------
    */

    const isActive =
        product.is_active === true ||
        product.status === "active";


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="admin-page">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="admin-page-header">


                {/* LEFT */}

                <div>

                    <button
                        type="button"
                        className="admin-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >

                        <ArrowLeft size={17} />

                        Back to Products

                    </button>


                    <div className="admin-seller-title-row">


                        {/* Product Icon */}

                        <div className="admin-seller-avatar">

                            <Package size={24} />

                        </div>


                        {/* Product Name */}

                        <div>

                            <h1>
                                {product.name}
                            </h1>

                            <p>
                                Product ID #{product.id}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    STATUS + ACTION
                ===================================================== */}

                <div className="admin-product-header-actions">


                    {/* Status */}

                    <span
                        className={getStatusClass(
                            isActive
                                ? "active"
                                : "inactive"
                        )}
                    >

                        {isActive
                            ? "Active"
                            : "Inactive"}

                    </span>


                    {/* Activate / Deactivate */}

                    <button
                        type="button"
                        onClick={
                            handleToggleStatus
                        }
                        disabled={
                            actionLoading
                        }
                        className={
                            isActive
                                ? "admin-product-action-button deactivate"
                                : "admin-product-action-button activate"
                        }
                    >

                        {actionLoading ? (

                            <>

                                <LoaderCircle
                                    size={15}
                                    className="admin-loading-icon"
                                />

                                Updating...

                            </>

                        ) : isActive ? (

                            <>

                                <XCircle
                                    size={15}
                                />

                                Deactivate

                            </>

                        ) : (

                            <>

                                <CheckCircle
                                    size={15}
                                />

                                Activate

                            </>

                        )}

                    </button>

                </div>

            </div>


            {/* =========================================================
                SUCCESS MESSAGE
            ========================================================= */}

            {success && (

                <div
                    className="admin-product-success"
                >

                    <CheckCircle size={18} />

                    <span>
                        {success}
                    </span>

                </div>

            )}


            {/* =========================================================
                ERROR MESSAGE
            ========================================================= */}

            {error && (

                <div
                    className="admin-product-error"
                >

                    {error}

                </div>

            )}


            {/* =========================================================
                PRODUCT + STORE
            ========================================================= */}

            <div className="admin-seller-detail-grid">


                {/* =====================================================
                    PRODUCT INFORMATION
                ===================================================== */}

                <div className="admin-card">


                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Product Information
                            </h2>

                            <p>
                                Basic product details
                            </p>

                        </div>

                        <Package size={20} />

                    </div>


                    <div className="admin-info-list">


                        {/* Name */}

                        <div className="admin-info-item">

                            <span>
                                Name
                            </span>

                            <strong>
                                {product.name}
                            </strong>

                        </div>


                        {/* Slug */}

                        <div className="admin-info-item">

                            <span>
                                Slug
                            </span>

                            <strong>
                                {product.slug}
                            </strong>

                        </div>


                        {/* Price */}

                        <div className="admin-info-item">

                            <span>
                                Price
                            </span>

                            <strong>
                                {formatPrice(
                                    product.price,
                                    product.currency
                                )}
                            </strong>

                        </div>


                        {/* Status */}

                        <div className="admin-info-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                {isActive
                                    ? "Active"
                                    : "Inactive"}
                            </strong>

                        </div>


                        {/* Created */}

                        <div className="admin-info-item">

                            <span>
                                Created
                            </span>

                            <strong>
                                {formatDate(
                                    product.created_at
                                )}
                            </strong>

                        </div>


                        {/* Updated */}

                        <div className="admin-info-item">

                            <span>
                                Updated
                            </span>

                            <strong>
                                {formatDate(
                                    product.updated_at
                                )}
                            </strong>

                        </div>


                    </div>

                </div>


                {/* =====================================================
                    STORE
                ===================================================== */}

                <div className="admin-card">


                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Store
                            </h2>

                            <p>
                                Product store information
                            </p>

                        </div>

                        <Store size={20} />

                    </div>


                    {store ? (

                        <div className="admin-info-list">


                            <div className="admin-info-item">

                                <span>
                                    Store Name
                                </span>

                                <strong>
                                    {store.name}
                                </strong>

                            </div>


                            <div className="admin-info-item">

                                <span>
                                    Slug
                                </span>

                                <strong>
                                    {store.slug}
                                </strong>

                            </div>


                            <div className="admin-info-item">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {store.status ||
                                        "-"}
                                </strong>

                            </div>


                        </div>

                    ) : (

                        <div className="admin-empty-state">

                            <p>
                                No store information
                                available.
                            </p>

                        </div>

                    )}

                </div>

            </div>


            {/* =========================================================
                SELLER
            ========================================================= */}

            <div className="admin-card">


                <div className="admin-card-header">

                    <div>

                        <h2>
                            Seller
                        </h2>

                        <p>
                            Seller who owns this product
                        </p>

                    </div>

                    <User size={20} />

                </div>


                {seller ? (

                    <div className="admin-info-list">


                        <div className="admin-info-item">

                            <span>
                                Name
                            </span>

                            <strong>
                                {seller.name}
                            </strong>

                        </div>


                        <div className="admin-info-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                {seller.email}
                            </strong>

                        </div>


                        <div className="admin-info-item">

                            <span>
                                Account Status
                            </span>

                            <strong>
                                {seller.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </strong>

                        </div>


                    </div>

                ) : (

                    <div className="admin-empty-state">

                        <User size={30} />

                        <p>
                            Seller information not
                            available.
                        </p>

                    </div>

                )}

            </div>


            {/* =========================================================
                DESCRIPTION
            ========================================================= */}

            <div className="admin-card">


                <div className="admin-card-header">

                    <div>

                        <h2>
                            Description
                        </h2>

                        <p>
                            Product description
                        </p>

                    </div>

                </div>


                <div className="admin-product-description">

                    {product.description ? (

                        product.description

                    ) : (

                        <span>
                            No description available.
                        </span>

                    )}

                </div>

            </div>


        </div>

    );

}


export default AdminProductDetailPage;