import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoginPathForRoute, isPublicPath } from '../utils/routeGuard';

/**
 * Validates authentication on every route change and redirects unauthenticated
 * users away from protected paths.
 */
export default function useRouteAuthGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, validateRouteAccess } = useAuth();
  const validatingRef = useRef(false);

  useEffect(() => {
    if (loading || validatingRef.current) return;
    if (isPublicPath(location.pathname)) return;

    validatingRef.current = true;
    validateRouteAccess(location.pathname)
      .then((result) => {
        if (!result.allowed && result.redirectTo) {
          const loginPath = getLoginPathForRoute(location.pathname);
          if (location.pathname !== loginPath && location.pathname !== result.redirectTo) {
            navigate(result.redirectTo, { state: { from: location }, replace: true });
          }
        }
      })
      .finally(() => {
        validatingRef.current = false;
      });
  }, [location.pathname, loading, validateRouteAccess, navigate, location]);
}
