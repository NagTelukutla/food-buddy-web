import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { APP_NAME } from '../../utils/constants';
import {
  buildNavLinks,
  isStaffOnlyHeader,
  shouldShowLogin,
} from '../../utils/navLinks';
import {
  canUseCartFeatures,
  getCustomerSession,
  getStaffProfilePath,
  getStaffSessions,
  ROLES,
} from '../../utils/roles';
import ProfileMenu from './ProfileMenu';

function NavLinkItem({ link, itemCount, onNavigate, mobile = false }) {
  if (link.isCart) {
    if (mobile) {
      return (
        <NavLink
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-mobile-item ${isActive ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md' : 'bg-brand-50 text-brand-800 hover:bg-brand-100'}`
          }
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            {link.icon}
          </span>
          <span className="flex-1">Cart</span>
          {itemCount > 0 && (
            <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-dark-900 px-2 text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </NavLink>
      );
    }

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
    if (mobile) {
      return (
        <NavLink
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-mobile-item border border-stone-200 ${isActive ? 'border-brand-300 bg-brand-50 text-brand-700' : 'bg-white text-stone-700 hover:border-brand-200 hover:bg-stone-50'}`
          }
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
            {link.icon}
          </span>
          {link.label}
        </NavLink>
      );
    }

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

  if (mobile) {
    return (
      <NavLink
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `nav-mobile-item ${isActive ? 'bg-brand-100 text-brand-800 shadow-sm' : 'text-stone-700 hover:bg-stone-100'}`
        }
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            link.to === '/' ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {link.icon}
        </span>
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

  const staffOnlyHeader = isStaffOnlyHeader(activeSessions);
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

  const staffDashLinks = useMemo(
    () => navLinks.filter((l) => l.group === 'staff'),
    [navLinks]
  );

  const pillLinks = staffOnlyHeader
    ? staffDashLinks
    : navLinks.filter((l) => !l.isCart && l.id !== 'login');
  const cartLink = staffOnlyHeader ? null : navLinks.find((l) => l.isCart);
  const mobileNavLinks = staffOnlyHeader
    ? staffDashLinks
    : navLinks.filter((l) => l.id !== 'login');
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          onClick={closeMenu}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-1.5 shadow-md shadow-brand-600/20 transition group-hover:shadow-lg">
            <img src="/logo.svg" alt="" className="h-full w-full" />
          </span>
          <span className="truncate font-display text-base font-bold text-brand-900 sm:text-lg">
            <span className="sm:hidden">{shortName}</span>
            <span className="hidden sm:inline">{fullName}</span>
          </span>
        </Link>

        {showMainNav && (
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex" aria-label="Main navigation">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-stone-100/90 p-1 ring-1 ring-stone-200/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {pillLinks.map((link) => (
                <NavLinkItem key={link.id} link={link} itemCount={itemCount} />
              ))}
            </div>
            {cartLink && <NavLinkItem link={cartLink} itemCount={itemCount} />}
          </nav>
        )}

        {!showMainNav && <div className="flex-1" aria-hidden />}

        <div className="flex shrink-0 items-center gap-2">
          {!staffOnlyHeader ? (
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
                className={`nav-icon-btn border bg-white ${
                  menuOpen
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-stone-200 text-stone-700 hover:border-brand-200 hover:bg-stone-50'
                }`}
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
          ) : (
            staffDashLinks.length > 0 && (
              <div className="flex items-center gap-2 md:hidden">
                {staffDashLinks.map((link) => (
                  <NavLinkItem key={link.id} link={link} itemCount={itemCount} />
                ))}
              </div>
            )
          )}

          {identifiedUser ? (
            <ProfileMenu
              user={identifiedUser}
              profilePath={profilePath}
              profileLabel={profileLabel}
              onLogout={handleLogout}
            />
          ) : showLogin ? (
            <Link to="/login" className="nav-admin-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          ) : null}
        </div>
      </div>

      {menuOpen && !staffOnlyHeader && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
            aria-label="Close menu overlay"
          />
          <nav
            className="app-mobile-nav fixed right-0 z-50 flex w-[min(100%,320px)] flex-col bg-white shadow-2xl md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-brand-50 to-white px-4 py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Navigation</p>
                {identifiedUser ? (
                  <p className="truncate font-display text-sm font-bold text-stone-800">{identifiedUser.full_name}</p>
                ) : (
                  <p className="font-display text-sm font-bold text-stone-800">{shortName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="nav-icon-btn border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {mobileNavLinks.map((link) => (
                <NavLinkItem
                  key={link.id}
                  link={link}
                  itemCount={itemCount}
                  onNavigate={closeMenu}
                  mobile
                />
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
