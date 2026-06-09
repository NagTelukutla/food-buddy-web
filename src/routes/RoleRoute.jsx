import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Enforces role-based access. Validates token with the server before rendering children.
 */
export default function RoleRoute({ children, allowedRoles }) {
  const { loading, validateRouteAccess, getLoginPath } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [access, setAccess] = useState({ allowed: false, redirectTo: null });

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    setChecking(true);
    validateRouteAccess(location.pathname)
      .then((result) => {
        if (!cancelled) setAccess(result);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, location.pathname, validateRouteAccess, allowedRoles]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!access.allowed) {
    const redirectTo = access.redirectTo || getLoginPath(location.pathname);
    if (location.pathname === redirectTo) {
      return children;
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}
