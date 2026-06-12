import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RouteFallback from '../components/common/RouteFallback';
import AdminLayout from '../layouts/AdminLayout';
import AppShell from '../layouts/AppShell';
import CustomerLayout from '../layouts/CustomerLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';
import MainLayout from '../layouts/MainLayout';
import PlatformLayout from '../layouts/PlatformLayout';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/roles';

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminMenuPage = lazy(() => import('../pages/admin/AdminMenuPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminBranchesPage = lazy(() => import('../pages/admin/AdminBranchesPage'));
const AdminDeliveryPage = lazy(() => import('../pages/admin/AdminDeliveryPage'));
const AdminCampaignsPage = lazy(() => import('../pages/admin/AdminCampaignsPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfilePage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const CustomerOrdersPage = lazy(() => import('../pages/customer/CustomerOrdersPage'));
const CustomerLoyaltyPage = lazy(() => import('../pages/customer/CustomerLoyaltyPage'));
const CustomerProfilePage = lazy(() => import('../pages/customer/CustomerProfilePage'));
const CustomerSavedAddressesPage = lazy(() => import('../pages/customer/CustomerSavedAddressesPage'));
const DeliveryDashboardPage = lazy(() => import('../pages/delivery/DeliveryDashboardPage'));
const DeliveryProfilePage = lazy(() => import('../pages/delivery/DeliveryProfilePage'));
const PlatformDashboardPage = lazy(() => import('../pages/platform/PlatformDashboardPage'));
const PlatformRestaurantsPage = lazy(() => import('../pages/platform/PlatformRestaurantsPage'));
const PlatformUsersPage = lazy(() => import('../pages/platform/PlatformUsersPage'));
const PlatformRbacPage = lazy(() => import('../pages/platform/PlatformRbacPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const MenuPage = lazy(() => import('../pages/MenuPage'));
const RestaurantPage = lazy(() => import('../pages/RestaurantPage'));
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage'));
const PaymentCancelledPage = lazy(() => import('../pages/PaymentCancelledPage'));
const PaymentFailedPage = lazy(() => import('../pages/PaymentFailedPage'));
const TrackOrderPage = lazy(() => import('../pages/TrackOrderPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="restaurant/:id" element={<RestaurantPage />} />
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
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
            <Route path="loyalty" element={<CustomerLoyaltyPage />} />
            <Route path="addresses" element={<CustomerSavedAddressesPage />} />
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
            <Route path="profile" element={<AdminProfilePage />} />
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
    </Suspense>
  );
}
