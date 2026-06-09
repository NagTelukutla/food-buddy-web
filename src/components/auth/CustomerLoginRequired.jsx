import { Link } from 'react-router-dom';

export default function CustomerLoginRequired({ redirectTo = '/checkout' }) {
  return (
    <div className="card border-brand-200 bg-brand-50 p-4 text-sm text-brand-950">
      <p className="font-semibold">Sign in required</p>
      <p className="mt-1 text-brand-900">
        Please sign in or register as a customer to place an order.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          to="/login"
          state={{ from: { pathname: redirectTo } }}
          className="btn-primary py-2 text-sm"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          state={{ from: { pathname: redirectTo } }}
          className="btn-secondary py-2 text-sm"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
