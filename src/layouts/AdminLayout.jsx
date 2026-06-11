import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminUnassignedPage from '../pages/admin/AdminUnassignedPage';
import { ADMIN_NAV_ITEMS } from '../utils/navLinks';
import { ROLES, normalizeRole } from '../utils/roles';

const navItems = ADMIN_NAV_ITEMS;

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const isUnassignedAdmin =
    normalizeRole(user?.role) === ROLES.ADMIN && !user?.restaurant_id;

  if (isUnassignedAdmin) {
    return <AdminUnassignedPage />;
  }

  return (
    <div className="min-h-screen">
      <aside className="glass-sidebar text-stone-200">
        <div className="shrink-0 border-b border-white/10 px-6 py-5">
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
                `glass-sidebar-link ${isActive ? 'glass-sidebar-link-active' : ''}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 space-y-2.5 border-t border-white/10 p-4">
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
              onClick={() => logout()}
              className="btn-primary flex-1 py-1.5 text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
