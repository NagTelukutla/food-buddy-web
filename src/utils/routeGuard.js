import { ROLES, normalizeRole } from './roles';

/** Paths accessible without authentication. */
const PUBLIC_EXACT = new Set([
  '/',
  '/menu',
  '/cart',
  '/login',
  '/register',
  '/order-success',
  '/payment-failed',
  '/payment-cancelled',
]);

const PUBLIC_PREFIXES = ['/track-order'];

export function isPublicPath(pathname) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Roles required to access a path; null when public. */
export function getRequiredRolesForPath(pathname) {
  if (isPublicPath(pathname)) return null;
  if (pathname.startsWith('/admin')) return [ROLES.ADMIN];
  if (pathname.startsWith('/platform')) return [ROLES.PLATFORM];
  if (pathname.startsWith('/delivery')) return [ROLES.DRIVER];
  if (pathname.startsWith('/customer')) return [ROLES.CUSTOMER];
  if (pathname.startsWith('/checkout')) return [ROLES.CUSTOMER];
  return null;
}

/** Unified login page for all roles. */
export function getLoginPathForRoute(_pathname) {
  return '/login';
}

export function roleAllowedForPath(pathname, role) {
  const required = getRequiredRolesForPath(pathname);
  if (!required) return true;
  return required.includes(normalizeRole(role));
}
