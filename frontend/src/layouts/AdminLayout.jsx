import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="admin-layout">

            {/* Mobile Header */}
            <header className="admin-mobile-header">
                <button
                    type="button"
                    className="admin-mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open admin menu"
                >
                    <Menu size={22} />
                </button>

                <div className="admin-mobile-brand">
                    <div className="admin-mobile-logo-mark">
                        <img
                            src="/zaysai-logo.png"
                            alt="ZaySai"
                        />
                    </div>

                    <div className="admin-mobile-brand-text">
                        <strong>ZaySai</strong>
                        <span>Admin Console</span>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <AdminSidebar
                sidebarOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
