import { useEffect, useMemo, useState } from "react";
import {
    Package,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Save,
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
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState(emptyForm);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/seller/products");

            setProducts(response.data.products.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return products;
        }

        return products.filter((product) =>
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

    const activeCount = products.filter(
        (product) => product.is_active
    ).length;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);

        setForm({
            name: product.name,
            description: product.description || "",
            price: product.price,
            currency: product.currency,
            image: product.image || "",
            is_active: product.is_active,
        });

        setError("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");

        try {
            const payload = {
                ...form,
                price: Number(form.price),
            };

            if (editingId) {
                await api.put(
                    `/seller/products/${editingId}`,
                    payload
                );
            } else {
                await api.post(
                    "/seller/products",
                    payload
                );
            }

            handleCancel();
            await loadProducts();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save product."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/seller/products/${product.id}`
            );

            await loadProducts();
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to delete product."
            );
        }
    };

    return (
        <div className="seller-products-page">

            <div className="products-page-header">
                <div>
                    <span className="products-label">
                        CATALOG
                    </span>

                    <h1>Products</h1>

                    <p>
                        Manage everything you're selling from one place.
                    </p>
                </div>

                <button
                    className="new-product-button"
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


            <div className="product-mini-stats">

                <div className="product-mini-card">
                    <div className="mini-icon">
                        <Package size={19} />
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>{products.length}</strong>
                    </div>
                </div>

                <div className="product-mini-card">
                    <div className="mini-status-dot"></div>

                    <div>
                        <span>Active Products</span>
                        <strong>{activeCount}</strong>
                    </div>
                </div>

            </div>


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
                            className="form-close-button"
                            onClick={handleCancel}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="modern-form-group">
                            <label>Product name</label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Netflix Premium"
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <label>Description</label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Tell customers about this product..."
                            />
                        </div>

                        <div className="modern-form-row">

                            <div className="modern-form-group">
                                <label>Price</label>

                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="25000"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="modern-form-group">
                                <label>Currency</label>

                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                >
                                    <option value="MMK">MMK</option>
                                    <option value="USD">USD</option>
                                    <option value="THB">THB</option>
                                </select>
                            </div>

                        </div>

                        <div className="modern-form-group">
                            <label>Image URL</label>

                            <input
                                name="image"
                                value={form.image}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <label className="modern-toggle-row">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />

                            <div>
                                <strong>Active product</strong>
                                <span>
                                    Customers can see this product in your store.
                                </span>
                            </div>
                        </label>

                        {error && (
                            <div className="product-form-error">
                                {error}
                            </div>
                        )}

                        <div className="modern-form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-save-button"
                                disabled={submitting}
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


            <div className="product-list-card">

                <div className="product-list-toolbar">

                    <div>
                        <h2>Your products</h2>

                        <p>
                            {products.length} items in your catalog
                        </p>
                    </div>

                    <div className="product-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


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
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Slug</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.map((product) => (

                                    <tr key={product.id}>

                                        <td>
                                            <div className="product-main-cell">

                                                <div className="product-thumb">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <Package size={18} />
                                                    )}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {product.name}
                                                    </strong>

                                                    <span>
                                                        {product.description ||
                                                            "No description"}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td className="table-price">
                                            {Number(
                                                product.price
                                            ).toLocaleString()}{" "}
                                            <span>
                                                {product.currency}
                                            </span>
                                        </td>

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

                                        <td>
                                            <code className="product-slug">
                                                /{product.slug}
                                            </code>
                                        </td>

                                        <td>
                                            <div className="modern-product-actions">

                                                <button
                                                    title="Edit"
                                                    onClick={() =>
                                                        handleEdit(product)
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    title="Delete"
                                                    className="danger-action"
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
    
}

export default SellerProductsPage;