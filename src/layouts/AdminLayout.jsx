import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AdminUnassignedPage from '../pages/admin/AdminUnassignedPage';
import { ROLES, normalizeRole } from '../utils/roles';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/orders', label: 'Orders', icon: '📋' },
  { to: '/admin/branches', label: 'Branches', icon: '📍' },
  { to: '/admin/delivery', label: 'Delivery', icon: '🛵' },
  { to: '/admin/campaigns', label: 'Campaigns', icon: '📣' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
];

export default function AdminLayout() {
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUnassignedAdmin =
    normalizeRole(user?.role) === ROLES.ADMIN && !user?.restaurant_id;

  if (isUnassignedAdmin) {
    return <AdminUnassignedPage />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="app-sidebar fixed bottom-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-dark-900 text-stone-200 md:flex">
        <div className="shrink-0 border-b border-stone-700 px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-8 w-8" />
            <span className="font-display text-lg text-white">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-stone-700 p-4 space-y-2.5">
          <div className="flex items-center gap-3 px-1 py-0.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {user?.full_name ? user.full_name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() : '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="truncate text-[11px] text-stone-400">Admin</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/profile"
              className="btn-secondary flex-1 py-1.5 text-center text-xs"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-primary flex-1 py-1.5 text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 animate-fade-in-backdrop md:hidden"
              onClick={closeSidebar}
              aria-label="Close menu"
            />
            <nav className="fixed top-[4.75rem] right-3 bottom-3 z-50 flex w-[min(85%,280px)] flex-col bg-white/25 backdrop-blur-[24px] border border-white/40 rounded-[1.75rem] shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-slide-in-right md:hidden">
              <div className="flex-1 space-y-1 p-3 pt-5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                          : 'text-stone-800 hover:bg-white/30 active:bg-white/50'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="shrink-0 border-t border-white/10 p-4 space-y-2.5 bg-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 px-1 py-0.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {user?.full_name ? user.full_name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() : '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{user?.full_name}</p>
                    <p className="truncate text-[11px] text-stone-500">Admin</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/admin/profile"
                    onClick={closeSidebar}
                    className="btn-secondary bg-white/40 border-white/20 hover:bg-white/60 flex-1 py-1.5 text-center text-xs"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeSidebar();
                      handleLogout();
                    }}
                    className="btn-primary flex-1 py-1.5 text-xs"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </>
        )}

        <div className={`flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 ${menuOpen ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, breadcrumbs, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
