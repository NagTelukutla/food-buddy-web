export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DRIVER: 'driver',
  PLATFORM: 'platform',
};

const LEGACY_ROLE_ALIASES = {
  restaurant_owner: ROLES.ADMIN,
  platform_admin: ROLES.PLATFORM,
  delivery_partner: ROLES.DRIVER,
};

export function normalizeRole(role) {
  return LEGACY_ROLE_ALIASES[role] || role;
}

export function getDashboardPath(role) {
  const r = normalizeRole(role);
  switch (r) {
    case ROLES.CUSTOMER:
      return '/customer/dashboard';
    case ROLES.DRIVER:
      return '/delivery/dashboard';
    case ROLES.PLATFORM:
      return '/platform/dashboard';
    case ROLES.ADMIN:
    default:
      return '/admin/dashboard';
  }
}

export function getStaffProfilePath(role) {
  const r = normalizeRole(role);
  switch (r) {
    case ROLES.DRIVER:
      return '/delivery/profile';
    case ROLES.PLATFORM:
      return '/platform/profile';
    case ROLES.ADMIN:
    default:
      return '/admin/profile';
  }
}

export function getRoleLabel(role) {
  const labels = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.DRIVER]: 'Driver',
    [ROLES.PLATFORM]: 'Super Admin',
    [ROLES.CUSTOMER]: 'Customer',
  };
  return labels[normalizeRole(role)] || role;
}

export function isAdminRole(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}

const STAFF_BUCKETS = new Set(['restaurant', 'delivery', 'platform']);

function readStoredSessions() {
  try {
    const raw = localStorage.getItem('auth_sessions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function hasStaffSessionToken() {
  const sessions = readStoredSessions();
  return Object.keys(sessions).some(
    (bucket) => STAFF_BUCKETS.has(bucket) && sessions[bucket]?.access_token
  );
}

function hasCustomerSessionToken() {
  const sessions = readStoredSessions();
  return !!sessions.customer?.access_token;
}

export function hasCustomerSession(activeSessions = []) {
  return activeSessions.some(
    (s) => s.bucket === 'customer' || s.role === ROLES.CUSTOMER || s.user?.is_customer
  );
}

/** True when signed in as a registered customer (checkout allowed even if admin is also signed in). */
export function canPlaceOrders(activeSessions = []) {
  if (hasCustomerSession(activeSessions)) return true;
  return hasCustomerSessionToken();
}

export function getStaffSessions(activeSessions = []) {
  return activeSessions.filter((s) => STAFF_BUCKETS.has(s.bucket));
}

export function getCustomerSession(activeSessions = []) {
  return activeSessions.find((s) => s.bucket === 'customer') ?? null;
}

/** Cart & menu add: guests (pre-login) and customers only — hidden for staff-only sessions. */
export function canUseCartFeatures(activeSessions = []) {
  if (hasCustomerSession(activeSessions) || hasCustomerSessionToken()) return true;
  if (activeSessions.some((s) => STAFF_BUCKETS.has(s.bucket))) return false;
  if (hasStaffSessionToken()) return false;
  return true;
}

/** Public menu "Add" button — same rules as cart (customers + guests only). */
export function canShowMenuAddButton(activeSessions = []) {
  return canUseCartFeatures(activeSessions);
}
