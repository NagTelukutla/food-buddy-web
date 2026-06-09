import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AppShell from '../layouts/AppShell';
import CustomerLayout from '../layouts/CustomerLayout';
import MainLayout from '../layouts/MainLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminMenuPage from '../pages/admin/AdminMenuPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminBranchesPage from '../pages/admin/AdminBranchesPage';
import AdminDeliveryPage from '../pages/admin/AdminDeliveryPage';
import AdminCampaignsPage from '../pages/admin/AdminCampaignsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import CustomerOrdersPage from '../pages/customer/CustomerOrdersPage';
import CustomerLoyaltyPage from '../pages/customer/CustomerLoyaltyPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';
import DeliveryLayout from '../layouts/DeliveryLayout';
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';
import DeliveryProfilePage from '../pages/delivery/DeliveryProfilePage';
import PlatformLayout from '../layouts/PlatformLayout';
import PlatformDashboardPage from '../pages/platform/PlatformDashboardPage';
import PlatformRestaurantsPage from '../pages/platform/PlatformRestaurantsPage';
import PlatformUsersPage from '../pages/platform/PlatformUsersPage';
import PlatformRbacPage from '../pages/platform/PlatformRbacPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MenuPage from '../pages/MenuPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import PaymentCancelledPage from '../pages/PaymentCancelledPage';
import PaymentFailedPage from '../pages/PaymentFailedPage';
import TrackOrderPage from '../pages/TrackOrderPage';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/roles';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route
            path="checkout"
            element={
              <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CheckoutPage />
              </RoleRoute>
            }
          />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="payment-failed" element={<PaymentFailedPage />} />
          <Route path="payment-cancelled" element={<PaymentCancelledPage />} />
          <Route path="track-order/:id" element={<TrackOrderPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="admin/login" element={<Navigate to="/login" replace />} />

        <Route
          path="customer"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="loyalty" element={<CustomerLoyaltyPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>

        <Route
          path="delivery"
          element={
            <RoleRoute allowedRoles={[ROLES.DRIVER]}>
              <DeliveryLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboardPage />} />
          <Route path="profile" element={<DeliveryProfilePage />} />
        </Route>

        <Route
          path="platform"
          element={
            <RoleRoute allowedRoles={[ROLES.PLATFORM]}>
              <PlatformLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PlatformDashboardPage />} />
          <Route path="restaurants" element={<PlatformRestaurantsPage />} />
          <Route path="users" element={<PlatformUsersPage />} />
          <Route path="rbac" element={<PlatformRbacPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="branches" element={<AdminBranchesPage />} />
          <Route path="delivery" element={<AdminDeliveryPage />} />
          <Route path="campaigns" element={<AdminCampaignsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
