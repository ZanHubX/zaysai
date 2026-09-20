import { BrowserRouter, Routes, Route } from "react-router-dom";

import GlobalLoader from "./components/GlobalLoader";

// =========================================================
// Public Pages
// =========================================================

import StoreFrontPage from "./pages/StoreFrontPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

// =========================================================
// Seller Pages
// =========================================================

import SellerLoginPage from "./pages/SellerLoginPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerOrderDetailPage from "./pages/SellerOrderDetailPage";
import SellerCustomersPage from "./pages/SellerCustomersPage";
import SellerCustomerDetailPage from "./pages/SellerCustomerDetailPage";
import SellerPaymentMethodsPage from "./pages/SellerPaymentMethodsPage";
import SellerSettingsPage from "./pages/SellerSettingsPage";

// =========================================================
// Seller Protection / Layout
// =========================================================

import ProtectedSellerRoute from "./components/ProtectedSellerRoute";
import SellerLayout from "./layouts/SellerLayout";

// =========================================================
// Admin Pages
// =========================================================

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSellersPage from "./pages/AdminSellersPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

// =========================================================
// Admin Protection / Layout
// =========================================================

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";


function App() {
  return (
    <BrowserRouter>

      {/* Global Loading Animation */}
      <GlobalLoader />

      <Routes>

        {/* =================================================
                    SELLER LOGIN
                ================================================= */}

        <Route
          path="/seller/login"
          element={<SellerLoginPage />}
        />


        {/* =================================================
                    PROTECTED SELLER PANEL
                ================================================= */}

        <Route element={<ProtectedSellerRoute />}>

          <Route element={<SellerLayout />}>

            {/* Seller Dashboard */}

            <Route
              path="/seller/dashboard"
              element={<SellerDashboardPage />}
            />


            {/* Seller Products */}

            <Route
              path="/seller/products"
              element={<SellerProductsPage />}
            />


            {/* Seller Orders */}

            <Route
              path="/seller/orders"
              element={<SellerOrdersPage />}
            />


            {/* Seller Order Detail */}

            <Route
              path="/seller/orders/:id"
              element={<SellerOrderDetailPage />}
            />


            {/* Seller Customers */}

            <Route
              path="/seller/customers"
              element={<SellerCustomersPage />}
            />


            {/* Seller Customer Detail */}

            <Route
              path="/seller/customers/:phone"
              element={<SellerCustomerDetailPage />}
            />


            {/* Seller Payment Methods */}

            <Route
              path="/seller/payment-methods"
              element={<SellerPaymentMethodsPage />}
            />


            {/* Seller Store Settings */}

            <Route
              path="/seller/settings"
              element={<SellerSettingsPage />}
            />

          </Route>

        </Route>


        {/* =================================================
                    ADMIN LOGIN
                ================================================= */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />


        {/* =================================================
                    PROTECTED ADMIN PANEL
                ================================================= */}

        <Route element={<ProtectedAdminRoute />}>

          <Route element={<AdminLayout />}>

            {/* Admin Dashboard */}

            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />


            {/* Admin Sellers */}

            <Route
              path="/admin/sellers"
              element={<AdminSellersPage />}
            />


            {/* Admin Stores */}

            <Route
              path="/admin/stores"
              element={<AdminStoresPage />}
            />


            {/* Admin Products */}

            <Route
              path="/admin/products"
              element={<AdminProductsPage />}
            />


            {/* Admin Orders */}

            <Route
              path="/admin/orders"
              element={<AdminOrdersPage />}
            />


            {/* Admin Settings */}

            <Route
              path="/admin/settings"
              element={<AdminSettingsPage />}
            />

          </Route>

        </Route>


        {/* =================================================
                    CUSTOMER ORDER TRACKING
                ================================================= */}

        <Route
          path="/track-order"
          element={<OrderTrackingPage />}
        />


        {/* =================================================
                    PUBLIC STOREFRONT
                ================================================= */}

        <Route
          path="/:slug"
          element={<StoreFrontPage />}
        />


        {/* =================================================
                    PUBLIC PRODUCT DETAIL
                ================================================= */}

        <Route
          path="/:slug/products/:productSlug"
          element={<ProductDetailPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;