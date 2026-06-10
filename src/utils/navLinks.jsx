import { canUseCartFeatures } from './roles';

const icons = {
  home: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  cart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  profile: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  dashboard: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  loyalty: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H5.5M12 8h4.5a2.5 2.5 0 010 5H12m0 0v5m0-5H8.5a2.5 2.5 0 000 5H12" />
    </svg>
  ),
  admin: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  delivery: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 011 1v1a1 1 0 01-1 1h-1M13 16V9h4l2 3v4h-6z" />
    </svg>
  ),
  platform: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  login: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  branches: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  campaigns: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  reviews: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  restaurants: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  rbac: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

export const navIcons = icons;

export const ADMIN_NAV_ITEMS = [
  { id: 'admin-dashboard', to: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
  { id: 'admin-menu', to: '/admin/menu', label: 'Menu', icon: icons.menu, group: 'staff' },
  { id: 'admin-orders', to: '/admin/orders', label: 'Orders', icon: icons.orders, group: 'staff' },
  { id: 'admin-branches', to: '/admin/branches', label: 'Branches', icon: icons.branches, group: 'staff' },
  { id: 'admin-delivery', to: '/admin/delivery', label: 'Delivery', icon: icons.delivery, group: 'staff' },
  { id: 'admin-campaigns', to: '/admin/campaigns', label: 'Campaigns', icon: icons.campaigns, group: 'staff' },
  { id: 'admin-reviews', to: '/admin/reviews', label: 'Reviews', icon: icons.reviews, group: 'staff' },
];

export const PLATFORM_NAV_ITEMS = [
  { id: 'platform-dashboard', to: '/platform/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
  { id: 'platform-restaurants', to: '/platform/restaurants', label: 'Restaurants', icon: icons.restaurants, group: 'staff' },
  { id: 'platform-users', to: '/platform/users', label: 'Users', icon: icons.users, group: 'staff' },
  { id: 'platform-rbac', to: '/platform/rbac', label: 'RBAC', icon: icons.rbac, group: 'staff' },
];

export const DELIVERY_NAV_ITEMS = [
  { id: 'delivery-dashboard', to: '/delivery/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
];

const STAFF_BUCKETS = ['restaurant', 'delivery', 'platform'];

function hasAnySessionToken() {
  try {
    const raw = localStorage.getItem('auth_sessions');
    const sessions = raw ? JSON.parse(raw) : {};
    return Object.values(sessions).some((s) => s?.access_token);
  } catch {
    return false;
  }
}

function hasStaffSession(buckets) {
  return STAFF_BUCKETS.some((b) => buckets.has(b));
}

/** Staff nav (Admin, Deliveries, Platform) — never shown to guests or customers. */
function shouldShowStaffNav(buckets) {
  if (!hasStaffSession(buckets)) return false;
  if (buckets.has('customer')) return false;
  return true;
}

/** Build visible navbar links from active login sessions. */
export function buildNavLinks(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  const showCart = canUseCartFeatures(activeSessions);
  const showStaffNav = shouldShowStaffNav(buckets);

  const links = [
    { id: 'home', to: '/', label: 'Home', end: true, icon: icons.home, group: 'public' },
    { id: 'menu', to: '/menu', label: 'Menu', icon: icons.menu, group: 'public' },
  ];

  if (showCart) {
    links.push({ id: 'cart', to: '/cart', label: 'Cart', icon: icons.cart, isCart: true, group: 'public' });
  }

  if (buckets.has('customer')) {
    links.push(
      { id: 'cust-dash', to: '/customer/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'customer' },
      { id: 'cust-orders', to: '/customer/orders', label: 'Orders', icon: icons.orders, group: 'customer' },
      { id: 'cust-loyalty', to: '/customer/loyalty', label: 'Loyalty', icon: icons.loyalty, group: 'customer' }
    );
  } else if (shouldShowLogin(activeSessions)) {
    links.push({ id: 'login', to: '/login', label: 'Login', icon: icons.login, isAuth: true, group: 'auth' });
  }

  if (showStaffNav) {
    if (buckets.has('restaurant') || buckets.has('platform')) {
      links.push({ id: 'admin', to: '/admin/dashboard', label: 'Admin', icon: icons.admin, group: 'staff' });
    }
    if (buckets.has('delivery')) {
      links.push({
        id: 'driver',
        to: '/delivery/dashboard',
        label: 'Dashboard',
        icon: icons.dashboard,
        group: 'staff',
      });
    }
    if (buckets.has('platform')) {
      links.push({ id: 'platform', to: '/platform/dashboard', label: 'Super Admin', icon: icons.platform, group: 'staff' });
    }
  }

  return links;
}

/** Staff mobile nav — same items as admin/platform/delivery layout sidebars. */
export function getStaffMobileNavLinks(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  if (!shouldShowStaffNav(buckets)) return [];

  const staffLinks = [];
  if (buckets.has('restaurant') || buckets.has('platform')) {
    staffLinks.push(...ADMIN_NAV_ITEMS);
  }
  if (buckets.has('delivery')) {
    staffLinks.push(...DELIVERY_NAV_ITEMS);
  }
  if (buckets.has('platform')) {
    staffLinks.push(...PLATFORM_NAV_ITEMS);
  }
  return staffLinks;
}

/** Mobile menu links — staff see only their role nav (no duplicate public + admin lists). */
export function buildMobileNavLinks(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));

  if (shouldShowStaffNav(buckets)) {
    return getStaffMobileNavLinks(activeSessions);
  }

  return buildNavLinks(activeSessions).filter((l) => l.id !== 'login');
}

/** Staff signed in without a customer session — dashboard in header, profile via dropdown. */
export function isStaffOnlyHeader(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  return shouldShowStaffNav(buckets);
}

export function shouldShowLogin(activeSessions = []) {
  return activeSessions.length === 0 && !hasAnySessionToken();
}

export function shouldShowLogout(activeSessions = []) {
  return activeSessions.length > 0 || hasAnySessionToken();
}
