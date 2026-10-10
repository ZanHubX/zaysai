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
import SellerSubscriptionPage from "./pages/SellerSubscriptionPage";

import ProtectedSellerRoute from "./components/ProtectedSellerRoute";
import SellerLayout from "./layouts/SellerLayout";

// =========================================================
// Admin Pages
// =========================================================

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSellersPage from "./pages/AdminSellersPage";
import AdminSellerDetailPage from "./pages/AdminSellerDetailPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminStoreDetailPage from "./pages/AdminStoreDetailPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminProductDetailPage from "./pages/AdminProductDetailPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/AdminOrderDetailPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminSubscriptionPaymentsPage from "./pages/AdminSubscriptionPaymentsPage";
import AdminSubscriptionPaymentMethodsPage from "./pages/AdminSubscriptionPaymentMethodsPage";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";


function App() {
  return (
    <BrowserRouter>

      <GlobalLoader />

      <Routes>

        {/* =====================================================
                    PUBLIC
                ===================================================== */}

        <Route
          path="/track-order"
          element={<OrderTrackingPage />}
        />

        <Route
          path="/:slug/products/:productSlug"
          element={<ProductDetailPage />}
        />

        <Route
          path="/:slug"
          element={<StoreFrontPage />}
        />


        {/* =====================================================
                    SELLER LOGIN
                ===================================================== */}

        <Route
          path="/seller/login"
          element={<SellerLoginPage />}
        />


        {/* =====================================================
                    PROTECTED SELLER
                ===================================================== */}

        <Route
          element={<ProtectedSellerRoute />}
        >

          <Route
            element={<SellerLayout />}
          >

            <Route
              path="/seller/dashboard"
              element={
                <SellerDashboardPage />
              }
            />

            <Route
              path="/seller/products"
              element={
                <SellerProductsPage />
              }
            />

            <Route
              path="/seller/orders"
              element={
                <SellerOrdersPage />
              }
            />

            <Route
              path="/seller/orders/:id"
              element={
                <SellerOrderDetailPage />
              }
            />

            <Route
              path="/seller/customers"
              element={
                <SellerCustomersPage />
              }
            />

            <Route
              path="/seller/customers/:phone"
              element={
                <SellerCustomerDetailPage />
              }
            />

            <Route
              path="/seller/payment-methods"
              element={
                <SellerPaymentMethodsPage />
              }
            />

            <Route
              path="/seller/subscription"
              element={
                <SellerSubscriptionPage />
              }
            />

            <Route
              path="/seller/settings"
              element={
                <SellerSettingsPage />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
                    ADMIN LOGIN
                ===================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />


        {/* =====================================================
                    PROTECTED ADMIN
                ===================================================== */}

        <Route
          element={<ProtectedAdminRoute />}
        >

          <Route
            element={<AdminLayout />}
          >

            {/* =================================================
                        ADMIN DASHBOARD
                    ================================================= */}

            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboardPage />
              }
            />


            {/* =================================================
                        ADMIN SELLERS
                    ================================================= */}

            <Route
              path="/admin/sellers"
              element={
                <AdminSellersPage />
              }
            />

            <Route
              path="/admin/sellers/:id"
              element={
                <AdminSellerDetailPage />
              }
            />


            {/* =================================================
                        ADMIN STORES
                    ================================================= */}

            <Route
              path="/admin/stores"
              element={
                <AdminStoresPage />
              }
            />

            <Route
              path="/admin/stores/:id"
              element={
                <AdminStoreDetailPage />
              }
            />


            {/* =================================================
                        ADMIN PRODUCTS
                    ================================================= */}

            <Route
              path="/admin/products"
              element={
                <AdminProductsPage />
              }
            />

            <Route
              path="/admin/products/:id"
              element={
                <AdminProductDetailPage />
              }
            />


            {/* =================================================
                        ADMIN ORDERS
                    ================================================= */}

            <Route
              path="/admin/orders"
              element={
                <AdminOrdersPage />
              }
            />

            <Route
              path="/admin/orders/:id"
              element={
                <AdminOrderDetailPage />
              }
            />


            {/* =================================================
                        ADMIN SUBSCRIPTION PAYMENTS
                    ================================================= */}

            <Route
              path="/admin/subscription-payments"
              element={
                <AdminSubscriptionPaymentsPage />
              }
            />


            {/* =================================================
                        ADMIN SUBSCRIPTION PAYMENT METHODS
                    ================================================= */}

            <Route
              path="/admin/subscription-payment-methods"
              element={
                <AdminSubscriptionPaymentMethodsPage />
              }
            />


            {/* =================================================
                        ADMIN SETTINGS
                    ================================================= */}

            <Route
              path="/admin/settings"
              element={
                <AdminSettingsPage />
              }
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;