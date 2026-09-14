import { BrowserRouter, Routes, Route } from "react-router-dom";

import StorefrontPage from "./pages/StorefrontPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellerLoginPage from "./pages/SellerLoginPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Seller */}
        <Route
          path="/seller/login"
          element={<SellerLoginPage />}
        />

        <Route
          path="/seller/dashboard"
          element={<SellerDashboardPage />}
        />

        {/* Customer */}
        <Route
          path="/:slug"
          element={<StorefrontPage />}
        />

        <Route
          path="/:slug/products/:productSlug"
          element={<ProductDetailPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;