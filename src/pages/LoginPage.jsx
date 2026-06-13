import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getRequiredRolesForPath } from '../utils/routeGuard';
import { getDashboardPath, isAdminRole, normalizeRole, ROLES } from '../utils/roles';

export default function LoginPage() {
  const { login, activeSessions, getAuthForRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const fromPath = location.state?.from?.pathname;

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
    <div className="glass-auth-shell">
      <div className="glass-auth-card glass-surface-strong w-full max-w-md p-6 sm:p-8">
        <div className="auth-heading mb-6 text-center sm:mb-6">
          <h1 className="text-2xl font-bold sm:text-2xl">Sign In</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form space-y-4">
          <div>
            <input
              className="input-field"
              placeholder="Username or email"
              autoComplete="username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              className="input-field"
              placeholder="Password"
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
        <p className="auth-footer-link mt-4 text-center text-sm">
          No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
        </p>
        {activeSessions.length > 0 && (
          <div className="glass-surface-soft mt-4 hidden p-3 text-xs text-stone-600 sm:block">
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
