import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getLoginRedirectMessage } from '../utils/authSessions';
import { getRequiredRolesForPath } from '../utils/routeGuard';
import { getDashboardPath, isAdminRole, normalizeRole, ROLES } from '../utils/roles';

export default function LoginPage() {
  const { login, activeSessions, getAuthForRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const fromPath = location.state?.from?.pathname;
  const redirectMessage = getLoginRedirectMessage(fromPath || '');

  const resolvePostLoginPath = (role, targetFrom) => {
    const normalizedRole = normalizeRole(role);
    const dashboard = getDashboardPath(normalizedRole);

    if (!targetFrom || targetFrom === '/login') return dashboard;

    if (targetFrom.startsWith('/checkout') || targetFrom.startsWith('/cart')) {
      return normalizedRole === ROLES.CUSTOMER ? targetFrom : dashboard;
    }
    if (targetFrom.startsWith('/delivery')) {
      return normalizedRole === ROLES.DRIVER ? targetFrom : dashboard;
    }
    if (targetFrom.startsWith('/admin')) {
      return isAdminRole(normalizedRole) ? targetFrom : dashboard;
    }
    if (targetFrom.startsWith('/platform')) {
      return normalizedRole === ROLES.PLATFORM ? targetFrom : dashboard;
    }
    if (targetFrom.startsWith('/customer')) {
      return normalizedRole === ROLES.CUSTOMER ? targetFrom : dashboard;
    }
    return targetFrom;
  };

  useEffect(() => {
    const target = fromPath;
    if (!target || target === '/login') return;

    const requiredRoles = getRequiredRolesForPath(target);
    if (!requiredRoles?.length) return;

    const auth = getAuthForRoles(requiredRoles, target);
    if (auth?.user) {
      navigate(resolvePostLoginPath(auth.user.role, target), { replace: true });
    }
  }, [fromPath, getAuthForRoles, navigate, activeSessions]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.username.trim(), data.password);
      toast.success('Welcome back!');
      const role = result.role || result.user?.role;
      navigate(resolvePostLoginPath(role, fromPath), { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (!err?.response) {
        toast.error('Cannot reach the API server. Check your connection and try again.');
      } else {
        toast.error(detail || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-900 to-brand-800 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
        </div>
        {redirectMessage && (
          <p className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-center text-sm text-brand-900">
            {redirectMessage}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Username or email</label>
            <input
              className="input-field"
              autoComplete="username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="input-field"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required', minLength: 6 })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
        </p>
        {activeSessions.length > 0 && (
          <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
            <p className="mb-2 font-medium text-stone-700">Active sessions (other roles stay signed in)</p>
            <ul className="space-y-1">
              {activeSessions.map((s) => (
                <li key={s.bucket}>
                  {s.user.full_name} ({s.role}) —{' '}
                  <Link to={getDashboardPath(s.role)} className="text-brand-600 hover:underline">
                    Open dashboard
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
