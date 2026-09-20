import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
    const adminToken = localStorage.getItem("admin_token");

    if (!adminToken) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedAdminRoute;