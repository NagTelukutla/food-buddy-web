import { useAuth } from '../../context/AuthContext';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import { getRoleLabel } from '../../utils/roles';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AdminProfilePage() {
  const { user, role } = useAuth();
  if (!user) return null;

  const isPlatform = role === 'platform' || role === 'platform_admin' || window.location.pathname.startsWith('/platform');
  const parentLabel = isPlatform ? 'Super Admin' : 'Admin';
  const parentPath = isPlatform ? '/platform/dashboard' : '/admin/dashboard';

  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        breadcrumbs={[{ label: parentLabel, to: parentPath }, { label: 'Profile' }]}
      />

      <div className="card overflow-hidden p-0">
        <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold ring-2 ring-white/30">
              {getInitials(user.full_name)}
            </span>
            <div>
              <h2 className="text-xl font-bold">{user.full_name}</h2>
              <p className="text-sm text-brand-100">{user.email || 'No email added'}</p>
              <p className="mt-1 text-xs text-brand-200">{getRoleLabel(role)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Full Name</dt>
              <dd className="mt-1 font-medium text-stone-800">{user.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Username</dt>
              <dd className="mt-1 font-medium text-stone-800">{user.username}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Email</dt>
              <dd className="mt-1 font-medium text-stone-800">{user.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Phone</dt>
              <dd className="mt-1 font-medium text-stone-800">{user.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Role</dt>
              <dd className="mt-1 font-medium text-brand-700">{getRoleLabel(role)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
