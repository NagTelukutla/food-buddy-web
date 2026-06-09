import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

export default function CartSummary({
  subtotal,
  tax,
  total,
  showCheckout = true,
  orderingDisabled = false,
  loginRequired = false,
}) {
  return (
    <div className="card lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
      <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Subtotal</dt>
          <dd className="shrink-0 font-medium">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Tax (5%)</dt>
          <dd className="shrink-0 font-medium">{formatCurrency(tax)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd className="shrink-0 text-brand-700">{formatCurrency(total)}</dd>
        </div>
      </dl>
      {showCheckout && loginRequired && (
        <div className="mt-6 space-y-2">
          <Link
            to="/login"
            state={{ from: { pathname: '/checkout' } }}
            className="btn-primary w-full py-3"
          >
            Sign in to Checkout
          </Link>
          <Link
            to="/register"
            state={{ from: { pathname: '/checkout' } }}
            className="btn-secondary w-full py-3"
          >
            Create Account
          </Link>
        </div>
      )}
      {showCheckout && !loginRequired && !orderingDisabled && (
        <Link to="/checkout" className="btn-primary mt-6 w-full py-3">
          Proceed to Checkout
        </Link>
      )}
      {showCheckout && !loginRequired && orderingDisabled && (
        <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
          Checkout unavailable for admin accounts
        </p>
      )}
    </div>
  );
}
