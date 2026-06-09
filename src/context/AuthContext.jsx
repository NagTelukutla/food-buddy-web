import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { AUTH_SESSION_EXPIRED } from '../utils/authEvents';
import {
  clearAllSessions,
  clearLegacyTokens,
  clearSession,
  getLegacyTokens,
  getSession,
  listActiveSessions,
  resolveAuthForPath,
  resolveAuthForRoles,
  roleToBucket,
  setSession,
} from '../utils/authSessions';
import { getLoginPathForRoute, getRequiredRolesForPath, isPublicPath } from '../utils/routeGuard';
import { getDashboardPath, normalizeRole } from '../utils/roles';

const AuthContext = createContext(null);

async function fetchUserProfile(accessToken) {
  const { data } = await authApi.me(accessToken);
  return data;
}

export function AuthProvider({ children }) {
  const location = useLocation();
  const [sessionsVersion, setSessionsVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  const bump = useCallback(() => setSessionsVersion((v) => v + 1), []);

  const hydrateSessions = useCallback(async () => {
    const legacy = getLegacyTokens();
    if (legacy) {
      try {
        const user = await fetchUserProfile(legacy.access_token);
        const bucket = roleToBucket(user.role);
        setSession(bucket, { ...legacy, user });
      } catch {
        clearLegacyTokens();
      } finally {
        clearLegacyTokens();
      }
    }

    const buckets = ['customer', 'restaurant', 'delivery', 'platform'];
    await Promise.all(
      buckets.map(async (bucket) => {
        const session = getSession(bucket);
        if (!session?.access_token) return;
        try {
          const user = await fetchUserProfile(session.access_token);
          setSession(bucket, { ...session, user });
        } catch {
          clearSession(bucket);
        }
      })
    );
    bump();
  }, [bump]);

  useEffect(() => {
    hydrateSessions().finally(() => setLoading(false));
  }, [hydrateSessions]);

  useEffect(() => {
    const onExpired = () => bump();
    window.addEventListener(AUTH_SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED, onExpired);
  }, [bump]);

  const routeAuth = useMemo(
    () => resolveAuthForPath(location.pathname),
    [location.pathname, sessionsVersion]
  );

  const user = routeAuth?.session?.user ?? null;
  const role = user ? normalizeRole(user.role) : null;

  const validateRouteAccess = useCallback(
    async (pathname) => {
      const requiredRoles = getRequiredRolesForPath(pathname);
      if (!requiredRoles) {
        return { allowed: true };
      }

      let auth = resolveAuthForRoles(pathname, requiredRoles);
      if (!auth?.session?.access_token) {
        return { allowed: false, redirectTo: getLoginPathForRoute(pathname) };
      }

      let profile;
      try {
        profile = await fetchUserProfile(auth.session.access_token);
        setSession(auth.bucket, { ...auth.session, user: profile });
        bump();
      } catch {
        clearSession(auth.bucket);
        bump();
        return { allowed: false, redirectTo: getLoginPathForRoute(pathname) };
      }

      const userRole = normalizeRole(profile.role);
      if (!requiredRoles.includes(userRole)) {
        return { allowed: false, redirectTo: getDashboardPath(userRole) };
      }

      return { allowed: true };
    },
    [bump]
  );

  const establishSession = useCallback(
    async (tokenData) => {
      const profile = await fetchUserProfile(tokenData.access_token);
      const role = profile.role || tokenData.role;
      const bucket = roleToBucket(role);
      setSession(bucket, {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user: profile,
      });
      bump();
      return { ...tokenData, role, bucket, user: profile };
    },
    [bump]
  );

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    return establishSession(data);
  };

  const logout = useCallback(
    (options = {}) => {
      if (options.all) {
        clearAllSessions();
        bump();
        return;
      }
      const pathname = options.pathname ?? location.pathname;
      const auth = resolveAuthForPath(pathname);
      if (auth?.bucket) {
        clearSession(auth.bucket);
      }
      bump();
    },
    [location.pathname, bump]
  );

  const getAuthForRoles = useCallback(
    (allowedRoles, pathname = location.pathname) =>
      resolveAuthForRoles(pathname, allowedRoles),
    [location.pathname, sessionsVersion]
  );

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      establishSession,
      logout,
      routeAuth,
      getAuthForRoles,
      validateRouteAccess,
      activeSessions: listActiveSessions(),
      isAuthenticated: !!routeAuth?.session?.access_token,
      hasRoleSession: (allowedRoles, pathname = location.pathname) =>
        !!resolveAuthForRoles(pathname, allowedRoles),
      getLoginPath: (pathname = location.pathname) => getLoginPathForRoute(pathname),
      isPublicPath,
    }),
    [
      user,
      role,
      loading,
      login,
      establishSession,
      logout,
      routeAuth,
      getAuthForRoles,
      validateRouteAccess,
      location.pathname,
      sessionsVersion,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
