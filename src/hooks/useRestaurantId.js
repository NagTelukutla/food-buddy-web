import { useAuth } from '../context/AuthContext';

/**
 * Returns the authenticated admin/driver's assigned restaurant ID.
 * Never use a hardcoded default — tenant scope comes from the session.
 */
export function useRestaurantId() {
  const { user } = useAuth();
  return user?.restaurant_id ?? null;
}
