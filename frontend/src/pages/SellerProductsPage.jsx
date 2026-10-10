import { useEffect, useMemo, useState } from "react";
import {
    Package,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Save,
    AlertTriangle,
    Upload,
    Image as ImageIcon,
} from "lucide-react";

import api from "../services/api";
import "./SellerProductsPage.css";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    currency: "MMK",
    image: "",
    is_active: true,
};

function SellerProductsPage() {
    const [products, setProducts] = useState([]);

    const [subscription, setSubscription] =
        useState(null);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [limitError, setLimitError] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    const [imageFile, setImageFile] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Products + Subscription
    |--------------------------------------------------------------------------
    */

    const loadProducts = async () => {
        try {
            setLoading(true);

            setError("");

            setLimitError(null);

            const response =
                await api.get("/seller/products");

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            setProducts(
                response.data.products?.data || []
            );

            /*
            |--------------------------------------------------------------------------
            | Subscription
            |--------------------------------------------------------------------------
            */

            setSubscription(
                response.data.subscription || null
            );
        } catch (err) {
            console.error(
                "Load products error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadProducts();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Subscription Helpers
    |--------------------------------------------------------------------------
    */

    const currentProducts =
        subscription?.current_products ??
        products.length;

    const maxProducts =
        subscription?.plan?.max_products ?? null;

    const remainingProducts =
        subscription?.remaining_products ??
        null;

    const limitReached =
        subscription?.limit_reached ??
        (
            maxProducts !== null &&
            maxProducts > 0 &&
            currentProducts >= maxProducts
        );

    const planName =
        subscription?.plan?.name ||
        "No Plan";


    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredProducts = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return products;
        }

        return products.filter(
            (product) =>
                [
                    product.name,
                    product.slug,
                    product.description,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [products, search]);


    /*
    |--------------------------------------------------------------------------
    | Stats
    |--------------------------------------------------------------------------
    */

    const activeCount =
        products.filter(
            (product) =>
                product.is_active
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Form Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((current) => ({
            ...current,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Open Create Form
    |--------------------------------------------------------------------------
    */

    const openCreateForm = () => {
        /*
         * Never allow new product creation
         * when subscription limit is reached.
         */

        if (limitReached) {
            setLimitError({
                message:
                    "You have reached your product limit.",

                current:
                    currentProducts,

                max:
                    maxProducts,

                plan:
                    planName,
            });

            return;
        }

        setLimitError(null);

        setError("");

        setEditingId(null);

        setForm(emptyForm);

        setImageFile(null);

        setImagePreview("");

        setShowForm(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Edit Product
    |--------------------------------------------------------------------------
    */

    const handleEdit = (product) => {
        setLimitError(null);

        setError("");

        setEditingId(product.id);

        setImageFile(null);

        setImagePreview(product.image || "");

        setForm({
            name: product.name,

            description:
                product.description || "",

            price: product.price,

            currency:
                product.currency || "MMK",

            image:
                product.image || "",

            is_active:
                product.is_active,
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Cancel
    |--------------------------------------------------------------------------
    */

    const handleCancel = () => {
        setEditingId(null);

        setForm(emptyForm);

        if (imagePreview?.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(null);

        setImagePreview("");

        setError("");

        setLimitError(null);

        setShowForm(false);
    };


    /*
    |--------------------------------------------------------------------------
    | Product Image
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be 5MB or smaller.");
            return;
        }

        setError("");

        if (imagePreview?.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Submit Product
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        /*
         * Extra frontend protection.
         *
         * Only block CREATE.
         * Editing an existing product is allowed.
         */

        if (
            !editingId &&
            limitReached
        ) {
            setLimitError({
                message:
                    "You have reached your product limit.",

                current:
                    currentProducts,

                max:
                    maxProducts,

                plan:
                    planName,
            });

            return;
        }

        setSubmitting(true);

        setError("");

        setLimitError(null);

        try {
            const payload = new FormData();

            payload.append("name", form.name);

            payload.append(
                "description",
                form.description || ""
            );

            payload.append(
                "price",
                String(Number(form.price))
            );

            payload.append(
                "currency",
                form.currency
            );

            payload.append(
                "is_active",
                form.is_active ? "1" : "0"
            );

            if (imageFile) {
                payload.append(
                    "image_file",
                    imageFile
                );
            } else {
                payload.append(
                    "image",
                    form.image || ""
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Update
            |--------------------------------------------------------------------------
            */

            if (editingId) {
                payload.append("_method", "PUT");

                await api.post(
                    `/seller/products/${editingId}`,
                    payload
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Create
            |--------------------------------------------------------------------------
            */

            else {
                await api.post(
                    "/seller/products",
                    payload
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Close Form
            |--------------------------------------------------------------------------
            */

            handleCancel();


            /*
            |--------------------------------------------------------------------------
            | Reload
            |--------------------------------------------------------------------------
            */

            await loadProducts();
        } catch (err) {
            console.error(
                "Product save error:",
                err
            );


            /*
            |--------------------------------------------------------------------------
            | Product Limit Error
            |--------------------------------------------------------------------------
            */

            if (
                err.response?.status === 403 &&
                err.response?.data
                    ?.current_products !==
                undefined
            ) {
                const data =
                    err.response.data;

                setLimitError({
                    message:
                        data.message ||
                        "You have reached your product limit.",

                    current:
                        Number(
                            data.current_products
                        ),

                    max:
                        Number(
                            data.max_products
                        ),

                    plan:
                        data.plan?.name ||
                        planName,
                });


                /*
                 * Update local subscription
                 * immediately.
                 */

                setSubscription(
                    (current) => ({
                        ...current,

                        current_products:
                            Number(
                                data.current_products
                            ),

                        remaining_products:
                            Math.max(
                                0,
                                Number(
                                    data.max_products
                                ) -
                                Number(
                                    data.current_products
                                )
                            ),

                        limit_reached:
                            Number(
                                data.current_products
                            ) >=
                            Number(
                                data.max_products
                            ),

                        plan: {
                            ...current?.plan,

                            name:
                                data.plan?.name ||
                                current?.plan?.name,

                            max_products:
                                Number(
                                    data.max_products
                                ),
                        },
                    })
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | General Error
            |--------------------------------------------------------------------------
            */

            setError(
                err.response?.data?.message ||
                "Failed to save product."
            );
        } finally {
            setSubmitting(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Delete Product
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (
        product
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            setLimitError(null);

            await api.delete(
                `/seller/products/${product.id}`
            );

            await loadProducts();
        } catch (err) {
            console.error(
                "Delete product error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete product."
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="seller-products-page">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="products-page-header">

                <div>

                    <span className="products-label">
                        CATALOG
                    </span>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage everything you're
                        selling from one place.
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        limitReached &&
                            !showForm
                            ? "new-product-button disabled"
                            : "new-product-button"
                    }
                    disabled={
                        limitReached &&
                        !showForm
                    }
                    onClick={
                        showForm
                            ? handleCancel
                            : openCreateForm
                    }
                >

                    {showForm ? (
                        <>
                            <X size={17} />
                            Close
                        </>
                    ) : (
                        <>
                            <Plus size={17} />
                            Add Product
                        </>
                    )}

                </button>

            </div>


            {/* =========================================================
                SUBSCRIPTION SUMMARY
            ========================================================= */}

            {subscription && (
                <div className="seller-product-subscription">

                    <div className="seller-product-subscription-main">

                        <div>

                            <span>
                                Current Plan
                            </span>

                            <strong>
                                {planName}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Products
                            </span>

                            <strong>
                                {currentProducts}
                                {" / "}
                                {maxProducts > 0
                                    ? maxProducts
                                    : "∞"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Remaining
                            </span>

                            <strong>
                                {maxProducts > 0
                                    ? remainingProducts
                                    : "Unlimited"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Status
                            </span>

                            <strong
                                className={
                                    subscription.status ===
                                        "active"
                                        ? "subscription-active"
                                        : "subscription-inactive"
                                }
                            >
                                {subscription.status}
                            </strong>

                        </div>

                    </div>

                </div>
            )}


            {/* =========================================================
                STATS
            ========================================================= */}

            <div className="product-mini-stats">

                <div className="product-mini-card">

                    <div className="mini-icon">

                        <Package size={19} />

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


                <div className="product-mini-card">

                    <div className="mini-status-dot"></div>


                    <div>

                        <span>
                            Active Products
                        </span>

                        <strong>
                            {activeCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================================
                LIMIT ALERT
            ========================================================= */}

            {limitReached && (
                <div className="product-limit-alert">

                    <div className="product-limit-alert-icon">

                        <AlertTriangle size={20} />

                    </div>


                    <div className="product-limit-alert-content">

                        <strong>
                            Product limit reached
                        </strong>


                        <p>
                            You have reached your
                            product limit.
                        </p>


                        <span>
                            {planName}
                            {" · "}
                            {currentProducts}
                            {" / "}
                            {maxProducts}
                            {" products"}
                        </span>

                    </div>

                </div>
            )}


            {/* =========================================================
                PRODUCT FORM
            ========================================================= */}

            {showForm && (
                <div className="modern-product-form">

                    <div className="form-card-header">

                        <div>

                            <span>
                                {editingId
                                    ? "EDIT PRODUCT"
                                    : "NEW PRODUCT"}
                            </span>


                            <h2>
                                {editingId
                                    ? "Update product"
                                    : "Create a new product"}
                            </h2>

                        </div>


                        <button
                            type="button"
                            className="form-close-button"
                            onClick={handleCancel}
                        >
                            <X size={18} />
                        </button>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* Product Name */}

                        <div className="modern-form-group">

                            <label>
                                Product name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Netflix Premium"
                                required
                            />

                        </div>


                        {/* Description */}

                        <div className="modern-form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Tell customers about this product..."
                            />

                        </div>


                        {/* Price + Currency */}

                        <div className="modern-form-row">

                            <div className="modern-form-group">

                                <label>
                                    Price
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={
                                        form.price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="25000"
                                    min="0"
                                    required
                                />

                            </div>


                            <div className="modern-form-group">

                                <label>
                                    Currency
                                </label>

                                <select
                                    name="currency"
                                    value={
                                        form.currency
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="MMK">
                                        MMK
                                    </option>

                                    <option value="USD">
                                        USD
                                    </option>

                                    <option value="THB">
                                        THB
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Product Image */}

                        <div className="modern-form-group">

                            <label>
                                Product image
                            </label>

                            <div className="product-image-upload-box">

                                <input
                                    id="product-image-file"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    onChange={handleImageChange}
                                    hidden
                                />

                                <label
                                    htmlFor="product-image-file"
                                    className="product-image-upload-trigger"
                                >
                                    <Upload size={18} />

                                    <span>
                                        {imageFile
                                            ? imageFile.name
                                            : "Upload product image"}
                                    </span>

                                    <small>
                                        JPG, PNG, WEBP or GIF · Max 5MB
                                    </small>
                                </label>

                                {imagePreview ? (
                                    <div className="product-image-preview-frame">
                                        <img
                                            src={imagePreview}
                                            alt="Product preview"
                                        />
                                    </div>
                                ) : (
                                    <div className="product-image-preview-empty">
                                        <ImageIcon size={24} />
                                        <span>No image selected</span>
                                    </div>
                                )}

                            </div>

                            <p className="product-image-help">
                                This image will appear in your public storefront product card.
                            </p>

                        </div>


                        {/* Active */}

                        <label className="modern-toggle-row">

                            <input
                                type="checkbox"
                                name="is_active"
                                checked={
                                    form.is_active
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <div>

                                <strong>
                                    Active product
                                </strong>

                                <span>
                                    Customers can see
                                    this product in
                                    your store.
                                </span>

                            </div>

                        </label>


                        {/* Error */}

                        {error && (
                            <div className="product-form-error">
                                {error}
                            </div>
                        )}


                        {/* Actions */}

                        <div className="modern-form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleCancel
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="primary-save-button"
                                disabled={
                                    submitting ||
                                    (
                                        !editingId &&
                                        limitReached
                                    )
                                }
                            >

                                <Save size={16} />

                                {submitting
                                    ? "Saving..."
                                    : editingId
                                        ? "Save Changes"
                                        : "Create Product"}

                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* =========================================================
                PRODUCT LIST
            ========================================================= */}

            <div className="product-list-card">

                <div className="product-list-toolbar">

                    <div>

                        <h2>
                            Your products
                        </h2>

                        <p>
                            {products.length}
                            {" "}
                            items in your catalog
                        </p>

                    </div>


                    <div className="product-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* Loading */}

                {loading ? (

                    <div className="products-state">
                        Loading products...
                    </div>

                ) : error ? (

                    <div className="products-state error">
                        {error}
                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="products-empty">

                        <Package size={34} />


                        <h3>
                            {search
                                ? "No matching products"
                                : "No products yet"}
                        </h3>


                        <p>
                            {search
                                ? "Try a different search."
                                : "Create your first product to start selling."}
                        </p>

                    </div>

                ) : (

                    <div className="modern-products-table-wrapper">

                        <table className="modern-products-table">

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
                                        Slug
                                    </th>

                                    <th></th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredProducts.map(
                                    (product) => (

                                        <tr
                                            key={
                                                product.id
                                            }
                                        >

                                            {/* Product */}

                                            <td>

                                                <div className="product-main-cell">

                                                    <div className="product-thumb">

                                                        {product.image ? (

                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />

                                                        ) : (

                                                            <Package
                                                                size={18}
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                product.description ||
                                                                "No description"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Price */}

                                            <td className="table-price">

                                                {Number(
                                                    product.price
                                                ).toLocaleString()}

                                                {" "}

                                                <span>
                                                    {
                                                        product.currency
                                                    }
                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={
                                                        product.is_active
                                                            ? "modern-status active"
                                                            : "modern-status inactive"
                                                    }
                                                >

                                                    <i></i>

                                                    {product.is_active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            {/* Slug */}

                                            <td>

                                                <code className="product-slug">

                                                    /
                                                    {
                                                        product.slug
                                                    }

                                                </code>

                                            </td>


                                            {/* Actions */}

                                            <td>

                                                <div className="modern-product-actions">

                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(
                                                                product
                                                            )
                                                        }
                                                    >

                                                        <Pencil
                                                            size={16}
                                                        />

                                                    </button>


                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        className="danger-action"
                                                        onClick={() =>
                                                            handleDelete(
                                                                product
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

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

export default SellerProductsPage;