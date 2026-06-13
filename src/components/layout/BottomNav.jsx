import { memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSelectedRestaurant } from '../../context/SelectedRestaurantContext';
import { buildBottomNavLinks, customerIcons } from '../../utils/navLinks';
import {
  getCustomerSession,
  getStaffProfilePath,
  getStaffSessions,
  ROLES,
} from '../../utils/roles';

const BottomNavItem = memo(function BottomNavItem({ link, itemCount }) {
  return (
    <NavLink
      to={link.to}
      end={link.end}
      className={({ isActive }) =>
        `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : 'bottom-nav-item-inactive'}`
      }
      aria-label={link.isCart ? `Cart, ${itemCount} items` : link.label}
    >
      <span className="relative flex h-6 w-6 items-center justify-center [&_svg]:h-6 [&_svg]:w-6">
        {link.icon}
        {link.isCart && itemCount > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </span>
      <span className="truncate">{link.isCart ? 'Cart' : link.label}</span>
    </NavLink>
  );
});

export default function BottomNav() {
  const { itemCount } = useCart();
  const { activeSessions } = useAuth();
  const { selectedRestaurant } = useSelectedRestaurant();
  const location = useLocation();

  const bottomLinks = useMemo(
    () => buildBottomNavLinks(activeSessions, location.pathname, selectedRestaurant),
    [activeSessions, location.pathname, selectedRestaurant]
  );

  const customerSession = getCustomerSession(activeSessions);
  const profilePath = useMemo(() => {
    const staffSessions = getStaffSessions(activeSessions);
    if (customerSession) return '/customer/profile';
    if (location.pathname.startsWith('/delivery')) return getStaffProfilePath(ROLES.DRIVER);
    if (location.pathname.startsWith('/admin')) return getStaffProfilePath(ROLES.ADMIN);
    if (location.pathname.startsWith('/platform')) return getStaffProfilePath(ROLES.PLATFORM);
    const staffRole = staffSessions[0]?.role;
    return staffRole ? getStaffProfilePath(staffRole) : '/login';
  }, [customerSession, activeSessions, location.pathname]);

  const isProfileActive = location.pathname === profilePath;

  const profileIcon = customerIcons.profile;

  return (
    <nav className="app-bottom-nav" aria-label="Mobile navigation">
      {bottomLinks.map((link) => (
        <BottomNavItem key={link.id} link={link} itemCount={itemCount} />
      ))}
      <NavLink
        to={profilePath}
        className={`bottom-nav-item ${isProfileActive ? 'bottom-nav-item-active' : 'bottom-nav-item-inactive'}`}
        aria-label="Profile"
      >
        <span className="flex h-6 w-6 items-center justify-center [&_svg]:h-6 [&_svg]:w-6">{profileIcon}</span>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
