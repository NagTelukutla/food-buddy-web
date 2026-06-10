import { formatCurrency } from '../../utils/format';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = item.price * item.quantity;

  return (
    <article className="border-b border-white/35 py-4 last:border-0 sm:py-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="glass-menu-thumb mb-0 flex h-12 w-12 shrink-0 text-xl sm:h-14 sm:w-14 sm:text-2xl">
          🍽️
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-stone-900">{item.name}</h4>
          <p className="mt-0.5 text-sm text-stone-500">{formatCurrency(item.price)} each</p>
        </div>
        <p className="shrink-0 text-right font-semibold text-stone-900 sm:hidden">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pl-[3.75rem] sm:pl-[4.5rem]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="glass-quantity-btn"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="glass-quantity-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden font-semibold text-stone-900 sm:block">
            {formatCurrency(lineTotal)}
          </p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="min-h-[2.25rem] rounded-xl px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 active:bg-red-500/15"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
