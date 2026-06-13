import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../utils/restaurantPaths';
import { hasCustomerSession } from '../utils/roles';

/** Legacy /menu route — redirects to the selected restaurant page or home. */
export default function MenuPage() {
  const { activeSessions } = useAuth();
  const { selectedRestaurant } = useSelectedRestaurant();

  if (hasCustomerSession(activeSessions) && selectedRestaurant?.id) {
    return <Navigate to={getSelectedRestaurantMenuPath(selectedRestaurant)} replace />;
  }

  return <Navigate to="/" replace />;
}
