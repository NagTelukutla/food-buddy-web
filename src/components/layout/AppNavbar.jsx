import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { APP_NAME } from '../../utils/constants';
import {
  buildNavLinks,
  buildMobileNavLinks,
  isStaffOnlyHeader,
  shouldShowLogin,
} from '../../utils/navLinks';
import {
  canUseCartFeatures,
  getCustomerSession,
  getLogoHomePath,
  getStaffProfilePath,
  getStaffSessions,
  getRoleLabel,
  ROLES,
} from '../../utils/roles';
import ProfileMenu from './ProfileMenu';
import MobileSlideMenu from './MobileSlideMenu';
import MobileSlideMenuProfileFooter from './MobileSlideMenuProfileFooter';
import { getMobileNavLinkClass } from '../../utils/mobileNavStyles';

function NavLinkItem({ link, itemCount, onNavigate, mobile = false }) {
  if (mobile) {
    return (
      <NavLink
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) => getMobileNavLinkClass(isActive)}
      >
        <span>{link.icon}</span>
        <span className="flex-1">{link.isCart ? 'Cart' : link.label}</span>
        {link.isCart && itemCount > 0 && (
          <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </NavLink>
    );
  }

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isStaffRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/platform') ||
    location.pathname.startsWith('/delivery');
  const staffOnlyHeader = isStaffOnlyHeader(activeSessions) && isStaffRoute;
  const navLinks = useMemo(() => buildNavLinks(activeSessions), [activeSessions]);
  const showCart = canUseCartFeatures(activeSessions);
  const showLogin = shouldShowLogin(activeSessions);
  const customerSession = getCustomerSession(activeSessions);
  const staffSessions = getStaffSessions(activeSessions);
  const isLoggedOut = showLogin;
  const identifiedUser = isLoggedOut
    ? null
    : customerSession?.user ?? staffSessions[0]?.user ?? null;

  const fullName = APP_NAME;
  const shortName = APP_NAME;

  const pillLinks = staffOnlyHeader
    ? []
    : navLinks.filter((l) => !l.isCart && l.id !== 'login');
  const cartLink = staffOnlyHeader ? null : navLinks.find((l) => l.isCart);
  const mobileNavLinks = useMemo(
    () => (staffOnlyHeader ? [] : buildMobileNavLinks(activeSessions)),
    [activeSessions, staffOnlyHeader]
  );
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
  const mobileProfileRoleLabel = customerSession
    ? 'Customer'
    : getRoleLabel(staffSessions[0]?.role) || 'Staff';

  const logoHomePath = useMemo(
    () => getLogoHomePath(activeSessions),
    [activeSessions],
  );

  useEffect(() => {
    setMenuOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen((open) => !open);
    const handleOpen = () => setSidebarOpen(true);
    const handleClose = () => setSidebarOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('open-sidebar', handleOpen);
    window.addEventListener('close-sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('open-sidebar', handleOpen);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout({ all: true });
    closeMenu();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={logoHomePath}
          className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          onClick={closeMenu}
        >
          <img
            src="/logo.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <span className="truncate font-display text-base font-bold text-brand-900 sm:text-lg">
            <span className="sm:hidden">{shortName}</span>
            <span className="hidden sm:inline">{fullName}</span>
          </span>
        </Link>

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

        {!showMainNav && <div className="flex-1" aria-hidden />}

        <div className="flex shrink-0 items-center gap-2">
          {staffOnlyHeader ? (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggle-sidebar'));
              }}
              className={`nav-icon-btn ${sidebarOpen ? 'border-brand-300/60 text-brand-700' : ''} md:hidden`}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 md:hidden">
              {showCart && (
                <Link
                  to="/cart"
                  className="nav-icon-btn relative bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-brand-600"
                  aria-label={`Cart, ${itemCount} items`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-dark-900 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={`nav-icon-btn ${menuOpen ? 'border-brand-300/60 text-brand-700' : ''}`}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
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

      <MobileSlideMenu
        open={menuOpen && !staffOnlyHeader}
        onClose={closeMenu}
        footer={
          identifiedUser ? (
            <MobileSlideMenuProfileFooter
              user={identifiedUser}
              roleLabel={mobileProfileRoleLabel}
              profilePath={profilePath}
              onNavigate={closeMenu}
              onLogout={handleLogout}
            />
          ) : null
        }
      >
        {mobileNavLinks.map((link) => (
          <NavLinkItem
            key={link.id}
            link={link}
            itemCount={itemCount}
            onNavigate={closeMenu}
            mobile
          />
        ))}
      </MobileSlideMenu>
    </header>
  );
}
