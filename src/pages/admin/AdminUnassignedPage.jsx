import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

export default function AdminUnassignedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/login', { replace: true });
    logout({ pathname: '/admin' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center sm:gap-8 md:flex-row md:items-center md:text-left">
        <div className="sorry-hero-visual h-40 sm:h-48 md:h-56 lg:h-64">
          <span className="sorry-accent sorry-accent-left" aria-hidden />
          <span className="sorry-accent sorry-accent-right" aria-hidden />
          <span className="sorry-accent sorry-accent-top" aria-hidden />
          <img
            src="/illustrations/sorry-unassigned.svg"
            alt=""
            className="sorry-animated-img relative z-10 h-full w-auto"
          />
        </div>

        <div className="sorry-content-enter min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Welcome to {APP_NAME}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            We&apos;re sorry — not quite ready yet
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            Hi{user?.full_name ? ` ${user.full_name}` : ''}, it looks like you&apos;re new here and
            your account has not been assigned to a restaurant yet.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-500 sm:text-base">
            Once a Super Admin maps you to a restaurant, you&apos;ll be able to manage orders, menu,
            deliveries, and more from this panel.
          </p>

          <p className="mt-5 text-sm font-medium text-stone-700 sm:text-base">
            What to do next
          </p>
          <p className="mt-1 text-sm leading-relaxed text-stone-500 sm:text-base">
            Please contact your platform administrator and ask them to assign your account to a
            restaurant from the Super Admin page.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-start">
            <button type="button" onClick={handleSignOut} className="btn-secondary">
              Sign out
            </button>
            <Link to="/" className="btn-primary text-center">
              Back to {APP_NAME}
            </Link>
          </div>

          {user?.email && (
            <p className="mt-6 text-xs text-stone-400">
              Signed in as <span className="font-medium text-stone-500">{user.email}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
