import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    CreditCard,
    Settings,
    ExternalLink,
    LogOut,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import api from "../services/api";
import "./SellerLayout.css";

function SellerLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("seller_token");
        navigate("/seller/login");
    };

    const navigationItems = [
        {
            label: "Overview",
            path: "/seller/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Products",
            path: "/seller/products",
            icon: Package,
        },
        {
            label: "Orders",
            path: "/seller/orders",
            icon: ShoppingBag,
        },
        {
            label: "Payment Methods",
            path: "/seller/payment-methods",
            icon: CreditCard,
        },
        {
            label: "Store Settings",
            path: "/seller/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="seller-layout">

            {/* =================================
                Sidebar
            ================================= */}

            <aside className="seller-sidebar">

                {/* Brand */}

                <div className="seller-brand">
                    <div className="seller-brand-logo-wrap">
                        <img
                            src="/zaysai-logo.png"
                            alt="ZaySai"
                            className="seller-brand-logo"
                        />
                    </div>

                    <div className="seller-brand-text">
                        <strong>ZaySai</strong>
                        <span>Seller Console</span>
                    </div>
                </div>


                {/* Navigation */}

                <div className="seller-nav-section">

                    <span className="seller-nav-label">
                        WORKSPACE
                    </span>

                    <nav className="seller-nav">

                        {navigationItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-item active"
                                            : "nav-item"
                                    }
                                >
                                    <Icon size={18} />

                                    <span>
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        })}

                    </nav>
                </div>


                {/* Sidebar Bottom */}

                <div className="seller-sidebar-bottom">

                    {/* Store Preview */}

                    <a
                        href="/"
                        className="sidebar-store-link"
                    >
                        <div className="sidebar-store-icon">
                            <ExternalLink size={16} />
                        </div>

                        <div className="sidebar-store-text">
                            <span>Storefront</span>
                            <strong>View your store</strong>
                        </div>
                    </a>


                    {/* Logout */}

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />

                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* =================================
                Main Content
            ================================= */}

            <main className="seller-content">
                <Outlet />
            </main>

        </div>
    );
}

export default SellerLayout;