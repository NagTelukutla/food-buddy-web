import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { canShowMenuAddButton } from '../../utils/roles';
import { formatCurrency } from '../../utils/format';

function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MinusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
}

export default function MenuCard({ item }) {
  const { items, addItem, updateQuantity } = useCart();
  const { activeSessions, loading: authLoading } = useAuth();
  const showAdd = canShowMenuAddButton(activeSessions);
  const quantity = items.find((cartItem) => cartItem.id === item.id)?.quantity ?? 0;

  const handleIncrease = () => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }
    if (quantity === 0) {
      addItem(item);
      toast.success(`${item.name} added to cart`);
      return;
    }
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <article className="card flex flex-col transition hover:shadow-lg">
      <div className="glass-menu-thumb">
        {item.category === 'Biryani' ? '🍛' : item.category === 'Desserts' ? '🍰' : '🍽️'}
      </div>
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-900">{item.name}</h3>
        {!item.available && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Unavailable</span>
        )}
      </div>
      <p className="mb-2 flex-1 text-sm text-stone-600 line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-bold text-brand-700">{formatCurrency(item.price)}</span>
        {authLoading && !showAdd ? (
          <span className="inline-block h-8 w-20 animate-pulse rounded-xl bg-white/50" aria-hidden />
        ) : showAdd ? (
          quantity > 0 ? (
            <div className="menu-qty-control" aria-label={`${item.name} quantity`}>
              <button
                type="button"
                onClick={handleDecrease}
                className="menu-qty-btn"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <MinusIcon />
              </button>
              <span className="menu-qty-count">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={!item.available}
                className="menu-qty-btn"
                aria-label={`Increase ${item.name} quantity`}
              >
                <PlusIcon />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.available}
              className="menu-add-btn"
            >
              <PlusIcon />
              Add
            </button>
          )
        ) : (
          <span className="text-xs text-stone-400">View only</span>
        )}
      </div>
    </article>
  );
}
