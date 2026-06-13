import { Link, Navigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';
import CustomerLoginRequired from '../components/auth/CustomerLoginRequired';
import { getSelectedRestaurantMenuPath } from '../utils/restaurantPaths';
import {
  canPlaceOrders,
  canUseCartFeatures,
  getDashboardPath,
  getStaffSessions,
} from '../utils/roles';

export default function CartPage() {
  const { items, subtotal, tax, total, updateQuantity, removeItem } = useCart();
  const { activeSessions } = useAuth();
  const { selectedRestaurant } = useSelectedRestaurant();
  const menuPath = getSelectedRestaurantMenuPath(selectedRestaurant);
  const customerSignedIn = canPlaceOrders(activeSessions);
  const staffSessions = getStaffSessions(activeSessions);
  const loginRequired = !customerSignedIn;

  if (!canUseCartFeatures(activeSessions)) {
    const staff = staffSessions[0];
    return <Navigate to={getDashboardPath(staff?.role)} replace />;
  }

  return (
    <PageContainer>
      <PageTitle>Your Cart</PageTitle>

      {loginRequired && (
        <div className="mb-6">
          <CustomerLoginRequired />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Browse our menu and add some delicious dishes."
          action={
            <Link to={menuPath} className="btn-primary">
              {selectedRestaurant ? 'View Menu' : 'Discover Restaurants'}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="card cart-items-panel order-2 lg:order-1 lg:col-span-2">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
          <div className="order-1 lg:order-2">
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              total={total}
              orderingDisabled={false}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
