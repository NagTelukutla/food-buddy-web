import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

export default function CartSummary({
  items,
  subtotal,
  tax,
  total,
  showCheckout = true,
  orderingDisabled = false,
}) {
  return (
    <div className="card lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
      <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
      {items?.length > 0 && (
        <ul className="mb-4 space-y-3 border-b border-stone-200 pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-900">{item.name}</p>
                {item.category && (
                  <p className="mt-0.5 text-xs text-stone-500">{item.category}</p>
                )}
                <p className="mt-0.5 text-xs text-stone-400">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 font-medium text-stone-800">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}
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
      {showCheckout && !orderingDisabled && (
        <Link to="/checkout" className="btn-primary mt-6 w-full py-3">
          Proceed to Checkout
        </Link>
      )}
      {showCheckout && orderingDisabled && (
        <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
          Checkout unavailable for admin accounts
        </p>
      )}
    </div>
  );
}
