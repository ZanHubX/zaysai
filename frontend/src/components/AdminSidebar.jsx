import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    ShoppingBag,
    CreditCard,
    WalletCards,
    Settings,
    LogOut,
    X,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import api from "../services/api";


function AdminSidebar({
    sidebarOpen = false,
    onClose = () => { },
}) {

    const navigate = useNavigate();


    const navigation = [
        {
            label: "Overview",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },

        {
            label: "Sellers",
            path: "/admin/sellers",
            icon: Users,
        },

        {
            label: "Stores",
            path: "/admin/stores",
            icon: Store,
        },

        {
            label: "Products",
            path: "/admin/products",
            icon: Package,
        },

        {
            label: "Orders",
            path: "/admin/orders",
            icon: ShoppingBag,
        },

        {
            label: "Subscription Payments",
            path: "/admin/subscription-payments",
            icon: CreditCard,
        },

        {
            label: "Subscription Payment Methods",
            path: "/admin/subscription-payment-methods",
            icon: WalletCards,
        },

        {
            label: "Settings",
            path: "/admin/settings",
            icon: Settings,
        },
    ];


    const handleLogout = async () => {

        try {

            await api.post(
                "/admin/logout"
            );

        } catch (error) {

            console.error(
                "Admin logout error:",
                error
            );

        } finally {

            localStorage.removeItem(
                "admin_token"
            );

            navigate(
                "/admin/login",
                {
                    replace: true,
                }
            );
        }
    };


    return (

        <aside
            className={`admin-sidebar ${sidebarOpen
                    ? "mobile-open"
                    : ""
                }`}
        >

            {/* Mobile Close Button */}

            <button
                type="button"
                className="admin-sidebar-close"
                onClick={onClose}
                aria-label="Close admin menu"
            >
                <X size={21} />
            </button>


            {/* =====================================================
                BRAND
            ===================================================== */}

            <div className="admin-sidebar-header">

                <div className="admin-sidebar-logo-mark">

                    <img
                        src="/zaysai-logo.png"
                        alt="ZaySai"
                    />

                </div>


                <div className="admin-sidebar-brand">

                    <strong>
                        ZaySai
                    </strong>

                    <span>
                        Admin Console
                    </span>

                </div>

            </div>


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <div className="admin-sidebar-section">

                <span className="admin-sidebar-label">
                    WORKSPACE
                </span>


                <nav className="admin-sidebar-nav">

                    {navigation.map(
                        (item) => {

                            const Icon =
                                item.icon;


                            return (

                                <NavLink
                                    key={
                                        item.path
                                    }
                                    to={
                                        item.path
                                    }
                                    onClick={
                                        onClose
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        isActive
                                            ? "admin-sidebar-link active"
                                            : "admin-sidebar-link"
                                    }
                                >

                                    <Icon
                                        size={17}
                                    />


                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>

                                </NavLink>

                            );

                        }
                    )}

                </nav>

            </div>


            {/* =====================================================
                BOTTOM
            ===================================================== */}

            <div className="admin-sidebar-bottom">

                <button
                    type="button"
                    className="admin-sidebar-logout"
                    onClick={
                        handleLogout
                    }
                >

                    <LogOut
                        size={17}
                    />

                    <span>
                        Logout
                    </span>

                </button>

            </div>


        </aside>
    );
}


export default AdminSidebar;
