import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { APP_NAME } from '../../utils/constants';
import { buildNavLinks, isStaffOnlyHeader, shouldShowLogin } from '../../utils/navLinks';
import {
  getCustomerSession,
  getLogoHomePath,
  getStaffProfilePath,
  getStaffSessions,
  ROLES,
} from '../../utils/roles';
import ProfileMenu from './ProfileMenu';
import HeaderSearchPopup from './HeaderSearchPopup';
import HeaderLocationPicker from './HeaderLocationPicker';

function NavLinkItem({ link, itemCount, onNavigate }) {
  if (link.isCart) {
    return (
      <NavLink
        to={link.to}
        onClick={onNavigate}
        className={({ isActive }) => `nav-cart-btn ${isActive ? 'nav-cart-btn-active' : ''}`}
      >
        {link.icon}
        <span>Cart</span>
        {itemCount > 0 && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/95 px-1.5 text-[11px] font-bold text-brand-700">
            {itemCount}
          </span>
        )}
      </NavLink>
    );
  }

  if (link.isAuth) {
    return (
      <NavLink
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) => `nav-admin-btn ${isActive ? 'nav-admin-btn-active' : ''}`}
      >
        {link.icon}
        {link.label}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onNavigate}
      className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : 'nav-pill-inactive'}`}
    >
      {link.icon}
      {link.label}
    </NavLink>
  );
}

export default function AppNavbar() {
  const { itemCount } = useCart();
  const { activeSessions, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const isStaffRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/platform') ||
    location.pathname.startsWith('/delivery');
  const staffOnlyHeader = isStaffOnlyHeader(activeSessions) && isStaffRoute;
  const navLinks = useMemo(() => buildNavLinks(activeSessions), [activeSessions]);
  const showLogin = shouldShowLogin(activeSessions);
  const customerSession = getCustomerSession(activeSessions);
  const staffSessions = getStaffSessions(activeSessions);
  const isLoggedOut = showLogin;
  const identifiedUser = isLoggedOut
    ? null
    : customerSession?.user ?? staffSessions[0]?.user ?? null;

  const fullName = APP_NAME;

  const pillLinks = staffOnlyHeader
    ? []
    : navLinks.filter((l) => !l.isCart && l.id !== 'login');
  const cartLink = staffOnlyHeader ? null : navLinks.find((l) => l.isCart);
  const showMainNav = pillLinks.length > 0 || !!cartLink;

  const profilePath = useMemo(() => {
    if (customerSession) return '/customer/profile';
    if (location.pathname.startsWith('/delivery')) return getStaffProfilePath(ROLES.DRIVER);
    if (location.pathname.startsWith('/admin')) return getStaffProfilePath(ROLES.ADMIN);
    if (location.pathname.startsWith('/platform')) return getStaffProfilePath(ROLES.PLATFORM);
    const staffRole = staffSessions[0]?.role;
    return staffRole ? getStaffProfilePath(staffRole) : '/login';
  }, [customerSession, location.pathname, staffSessions]);
  const profileLabel = customerSession ? 'My Profile' : 'Profile';

  const showSearch = useMemo(() => {
    const buckets = new Set(activeSessions.map((s) => s.bucket));
    const isAdminOrDriverSession = buckets.has('restaurant') || buckets.has('delivery');
    const isAdminOrDriverRoute =
      location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');

    if (isAdminOrDriverRoute) return false;
    if (isAdminOrDriverSession && !buckets.has('customer')) return false;
    return true;
  }, [activeSessions, location.pathname]);

  const showLocation = showSearch;

  const logoHomePath = useMemo(
    () => getLogoHomePath(activeSessions),
    [activeSessions],
  );

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showSearch) setSearchOpen(false);
  }, [showSearch]);

  const handleLogout = () => {
    logout({ all: true });
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3 ${searchOpen ? 'invisible' : ''}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <Link to={logoHomePath} className="group shrink-0" aria-label={fullName}>
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link
              to={logoHomePath}
              className="truncate font-display text-base font-bold leading-tight text-brand-900 sm:text-lg"
            >
              {fullName}
            </Link>
            {showLocation && !searchOpen && (
              <HeaderLocationPicker className="w-full max-w-full" />
            )}
          </div>
        </div>

        {showMainNav && (
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex" aria-label="Main navigation">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full glass-nav-rail">
              {pillLinks.map((link) => (
                <NavLinkItem key={link.id} link={link} itemCount={itemCount} />
              ))}
            </div>
            {cartLink && <NavLinkItem link={cartLink} itemCount={itemCount} />}
          </nav>
        )}

        {!showMainNav && <div className="hidden flex-1 md:block" aria-hidden />}

        <div className="flex shrink-0 items-center gap-2">
          {showSearch && !searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="nav-icon-btn md:hidden"
              aria-expanded={searchOpen}
              aria-label="Open search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}

          {identifiedUser ? (
            <div className="hidden md:block">
              <ProfileMenu
                user={identifiedUser}
                profilePath={profilePath}
                profileLabel={profileLabel}
                onLogout={handleLogout}
              />
            </div>
          ) : showLogin ? (
            <Link to="/login" className="nav-admin-btn hidden md:inline-flex">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          ) : null}
        </div>
      </div>

      {showSearch && (
        <HeaderSearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </header>
  );
}
