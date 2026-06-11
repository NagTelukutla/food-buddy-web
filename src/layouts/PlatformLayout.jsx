import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PLATFORM_NAV_ITEMS } from '../utils/navLinks';

const navItems = PLATFORM_NAV_ITEMS;

export default function PlatformLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <aside className="glass-sidebar text-stone-200">
        <div className="shrink-0 border-b border-white/10 px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-8 w-8" />
            <span className="font-display text-lg text-white">Super Admin</span>
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
              <p className="truncate text-[11px] text-stone-400">Super Admin</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/platform/profile"
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

export function PlatformPageHeader({ title, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
