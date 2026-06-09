import { Link } from 'react-router-dom';
import { getDashboardPath } from '../../utils/roles';

export default function StaffOrderingBlocked({ staffSessions = [] }) {
  return (
    <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Ordering is for customers only</p>
      <p className="mt-1 text-amber-900">
        You are signed in with an admin account. Restaurant owners, drivers, and platform admins cannot
        place orders from this account.
      </p>
      {staffSessions.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs">
          {staffSessions.map((s) => (
            <li key={s.bucket}>
              {s.user.full_name} ({s.role}) —{' '}
              <Link to={getDashboardPath(s.role)} className="font-medium text-brand-700 hover:underline">
                Go to dashboard
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-amber-800">
        To order food, sign out from staff areas or register / sign in as a{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">customer</Link>.
      </p>
    </div>
  );
}
