import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
} from "lucide-react";
import api from "../services/api";

function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/admin/logout");
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");

            navigate("/admin/login", {
                replace: true,
            });
        }
    };

    const menuItems = [
        {
            label: "Dashboard",
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
            icon: ShoppingCart,
        },
        {
            label: "Settings",
            path: "/admin/settings",
            icon: Settings,
        },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo">
                <div className="admin-sidebar-logo-mark">
                    Z
                </div>

                <div>
                    <strong>ZaySai</strong>
                    <span>Admin Panel</span>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                <div className="admin-sidebar-section-title">
                    PLATFORM
                </div>

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `admin-sidebar-link ${isActive
                                    ? "active"
                                    : ""
                                }`
                            }
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="admin-sidebar-bottom">
                <button
                    type="button"
                    className="admin-sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;