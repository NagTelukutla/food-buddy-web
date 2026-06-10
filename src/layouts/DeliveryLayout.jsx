import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileSlideMenu from '../components/layout/MobileSlideMenu';
import MobileSlideMenuProfileFooter from '../components/layout/MobileSlideMenuProfileFooter';
import { getMobileNavLinkClass } from '../utils/mobileNavStyles';
import { DELIVERY_NAV_ITEMS } from '../utils/navLinks';

const navItems = DELIVERY_NAV_ITEMS;

export default function DeliveryLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeSidebar = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('close-sidebar'));
  };

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    const handleToggle = () => setMenuOpen((open) => !open);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen min-w-0 flex-col">
      <MobileSlideMenu
        open={menuOpen}
        onClose={closeSidebar}
        ariaLabel="Delivery navigation"
        footer={
          <MobileSlideMenuProfileFooter
            user={user}
            roleLabel="Delivery Agent"
            profilePath="/delivery/profile"
            onNavigate={closeSidebar}
            onLogout={() => {
              closeSidebar();
              handleLogout();
            }}
          />
        }
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeSidebar}
            className={({ isActive }) => getMobileNavLinkClass(isActive)}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </MobileSlideMenu>

      <main className={`flex-1 ${menuOpen ? 'overflow-y-hidden' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
