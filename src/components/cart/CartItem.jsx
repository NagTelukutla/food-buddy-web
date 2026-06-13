import { formatCurrency } from '../../utils/format';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = item.price * item.quantity;

  return (
    <article className="cart-item">
      <div className="flex items-start gap-3">
        <div className="cart-item-thumb flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/55 bg-white/45 text-xl backdrop-blur-md">
          🍽️
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-stone-900">{item.name}</h4>
            </div>
            <p className="shrink-0 text-sm font-bold text-brand-700">{formatCurrency(lineTotal)}</p>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="cart-item-qty">
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="cart-item-qty-btn"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="cart-item-qty-value">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="cart-item-qty-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="cart-item-remove"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
