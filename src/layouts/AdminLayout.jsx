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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
            <img src="/logo.svg" alt="" className="h-8 w-8" />
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
        <div className="shrink-0 border-t border-stone-700 p-4">
          <p className="mb-2 truncate text-xs text-stone-400">{user?.full_name}</p>
          <button type="button" onClick={handleLogout} className="btn-secondary w-full text-xs">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <header className="app-subheader sticky z-30 border-b border-stone-200 bg-white md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-300"
              aria-label="Open admin menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="truncate font-semibold text-stone-800">Admin Panel</span>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 text-sm font-medium text-brand-600"
            >
              Logout
            </button>
          </div>
        </header>

        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <nav className="app-sidebar fixed bottom-0 left-0 z-50 flex w-[min(100%,260px)] flex-col bg-dark-900 text-stone-200 md:hidden">
              <div className="flex items-center justify-between border-b border-stone-700 px-4 py-4">
                <span className="font-semibold text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="text-stone-400"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 space-y-1 p-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                        isActive ? 'bg-brand-600 text-white' : 'text-stone-300'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </>
        )}

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
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
