import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    CreditCard,
    BadgeDollarSign,
    Settings,
    ExternalLink,
    LogOut,
    Menu,
    X,
} from "lucide-react";

import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import { useState } from "react";

import api from "../services/api";
import "./SellerLayout.css";

function SellerLayout() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("seller_token");
        navigate("/seller/login");
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
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
            label: "Customers",
            path: "/seller/customers",
            icon: Users,
        },
        {
            label: "Payment Methods",
            path: "/seller/payment-methods",
            icon: CreditCard,
        },
        {
            label: "Subscription",
            path: "/seller/subscription",
            icon: BadgeDollarSign,
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
                Mobile Header
            ================================= */}

            <header className="seller-mobile-header">

                <button
                    type="button"
                    className="seller-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <div className="seller-mobile-brand">
                    <div className="seller-mobile-logo-wrap">
                        <img
                            src="/zaysai-logo.png"
                            alt="ZaySai"
                            className="seller-mobile-logo"
                        />
                    </div>

                    <div className="seller-mobile-brand-text">
                        <strong>ZaySai</strong>
                        <span>Seller Console</span>
                    </div>
                </div>

            </header>


            {/* =================================
                Mobile Overlay
            ================================= */}

            {sidebarOpen && (
                <div
                    className="seller-sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}


            {/* =================================
                Sidebar
            ================================= */}

            <aside
                className={`seller-sidebar ${sidebarOpen ? "mobile-open" : ""
                    }`}
            >

                {/* Mobile Close Button */}

                <button
                    type="button"
                    className="seller-sidebar-close"
                    onClick={closeSidebar}
                    aria-label="Close menu"
                >
                    <X size={21} />
                </button>


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
                                    onClick={closeSidebar}
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
                        onClick={closeSidebar}
                    >
                        <div className="sidebar-store-icon">
                            <ExternalLink size={16} />
                        </div>

                        <div className="sidebar-store-text">
                            <span>Storefront</span>
                            <strong>
                                View your store
                            </strong>
                        </div>
                    </a>


                    {/* Logout */}

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />

                        <span>
                            Logout
                        </span>
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