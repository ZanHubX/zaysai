import { BrowserRouter, Routes, Route } from "react-router-dom";

import GlobalLoader from "./components/GlobalLoader";

import StoreFrontPage from "./pages/StoreFrontPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

import SellerLoginPage from "./pages/SellerLoginPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerOrderDetailPage from "./pages/SellerOrderDetailPage";
import SellerCustomersPage from "./pages/SellerCustomersPage";
import SellerSettingsPage from "./pages/SellerSettingsPage";
import SellerPaymentMethodsPage from "./pages/SellerPaymentMethodsPage";
import SellerCustomerDetailPage from "./pages/SellerCustomerDetailPage";
import SellerLayout from "./layouts/SellerLayout";
import ProtectedSellerRoute from "./components/ProtectedSellerRoute";

function App() {
  return (
    <BrowserRouter>
      {/* Global Loading Animation */}
      <GlobalLoader />

      <Routes>
        {/* =================================
                    Seller Login
                ================================= */}

        <Route
          path="/seller/login"
          element={<SellerLoginPage />}
        />

        {/* =================================
                    Protected Seller Panel
                ================================= */}

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

        {/* =================================
                    Customer Order Tracking
                ================================= */}

        <Route
          path="/track-order"
          element={<OrderTrackingPage />}
        />

        {/* =================================
                    Public Storefront
                ================================= */}

        <Route
          path="/:slug"
          element={<StoreFrontPage />}
        />

        {/* Public Product Detail */}
        <Route
          path="/:slug/products/:productSlug"
          element={<ProductDetailPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;