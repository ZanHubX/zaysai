import { Navigate, Outlet } from "react-router-dom";

function ProtectedSellerRoute() {
    const token = localStorage.getItem("seller_token");

    if (!token) {
        return <Navigate to="/seller/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedSellerRoute;