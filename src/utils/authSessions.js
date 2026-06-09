import { normalizeRole, ROLES } from './roles';

export const SESSIONS_KEY = 'auth_sessions';

export const BUCKETS = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DELIVERY: 'delivery',
  PLATFORM: 'platform',
};

export function roleToBucket(role) {
  const r = normalizeRole(role);
  switch (r) {
    case ROLES.CUSTOMER:
      return BUCKETS.CUSTOMER;
    case ROLES.DRIVER:
      return BUCKETS.DELIVERY;
    case ROLES.PLATFORM:
      return BUCKETS.PLATFORM;
    case ROLES.ADMIN:
      return BUCKETS.RESTAURANT;
    default:
      return BUCKETS.CUSTOMER;
  }
}

export function getSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSession(bucket) {
  if (!bucket) return null;
  return getSessions()[bucket] || null;
}

export function setSession(bucket, session) {
  const all = getSessions();
  all[bucket] = session;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
}

export function clearSession(bucket) {
  const all = getSessions();
  delete all[bucket];
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
}

export function clearAllSessions() {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getLegacyTokens() {
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  if (!access_token) return null;
  return { access_token, refresh_token };
}

export function clearLegacyTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/** Resolve which stored session applies to the current URL. */
export function resolveAuthForPath(pathname) {
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  if (pathname.startsWith('/platform')) {
    const session = getSession(BUCKETS.PLATFORM);
    return session?.access_token ? { bucket: BUCKETS.PLATFORM, session } : null;
  }
  if (pathname.startsWith('/delivery')) {
    const session = getSession(BUCKETS.DELIVERY);
    return session?.access_token ? { bucket: BUCKETS.DELIVERY, session } : null;
  }
  if (pathname.startsWith('/customer')) {
    const session = getSession(BUCKETS.CUSTOMER);
    return session?.access_token ? { bucket: BUCKETS.CUSTOMER, session } : null;
  }
  if (pathname.startsWith('/admin')) {
    const restaurant = getSession(BUCKETS.RESTAURANT);
    if (restaurant?.access_token) {
      return { bucket: BUCKETS.RESTAURANT, session: restaurant };
    }
    return null;
  }
  const customer = getSession(BUCKETS.CUSTOMER);
  if (customer?.access_token) {
    return { bucket: BUCKETS.CUSTOMER, session: customer };
  }
  return null;
}

/** Find a session whose role is allowed for this route. */
export function resolveAuthForRoles(pathname, allowedRoles = []) {
  const candidates = [];
  if (pathname.startsWith('/platform')) {
    candidates.push(BUCKETS.PLATFORM);
  } else if (pathname.startsWith('/delivery')) {
    candidates.push(BUCKETS.DELIVERY);
  } else if (pathname.startsWith('/customer')) {
    candidates.push(BUCKETS.CUSTOMER);
  } else if (pathname.startsWith('/admin')) {
    candidates.push(BUCKETS.RESTAURANT);
  } else if (pathname.startsWith('/checkout')) {
    candidates.push(BUCKETS.CUSTOMER);
  }

  for (const bucket of candidates) {
    const session = getSession(bucket);
    if (!session?.access_token) continue;
    if (!session.user) {
      return { bucket, session, user: null };
    }
    const role = normalizeRole(session.user.role);
    if (!allowedRoles.length || allowedRoles.includes(role)) {
      return { bucket, session, user: session.user };
    }
  }
  return null;
}

export function getTokenForPath(pathname) {
  const auth = resolveAuthForPath(pathname);
  return auth?.session?.access_token ?? null;
}

export { getLoginPathForRoute as getLoginPath } from './routeGuard';

export function getLoginRedirectMessage(pathname) {
  if (pathname.startsWith('/delivery')) {
    return 'Sign in as a delivery partner to accept and manage deliveries.';
  }
  return null;
}

export function listActiveSessions() {
  return Object.entries(getSessions())
    .filter(([, s]) => s?.access_token && s?.user)
    .map(([bucket, s]) => ({
      bucket,
      user: s.user,
      role: normalizeRole(s.user.role),
    }));
}
