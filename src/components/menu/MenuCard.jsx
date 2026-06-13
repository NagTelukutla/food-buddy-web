import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { canShowMenuAddButton } from '../../utils/roles';
import { formatCurrency } from '../../utils/format';

const CATEGORY_EMOJI = {
  Biryani: '🍛',
  Desserts: '🍰',
  Starters: '🥗',
  Soups: '🍲',
  'Main Course': '🍽️',
  Beverages: '🥤',
};

const CATEGORY_GRADIENT = {
  Biryani: 'premium-menu-bg-biryani',
  Desserts: 'premium-menu-bg-dessert',
  Starters: 'premium-menu-bg-starter',
  Soups: 'premium-menu-bg-soup',
  'Main Course': 'premium-menu-bg-main',
  Beverages: 'premium-menu-bg-drink',
};

function PlusIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MinusIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
}

function dishEmoji(category) {
  return CATEGORY_EMOJI[category] || '🍽️';
}

function dishGradient(category) {
  return CATEGORY_GRADIENT[category] || 'premium-menu-bg-main';
}

export default function MenuCard({ item, onAddToCart }) {
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
      if (onAddToCart) {
        onAddToCart(item);
      } else {
        addItem(item);
        toast.success(`${item.name} added to cart`);
      }
      return;
    }
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <article className="premium-menu-card group">
      <div className="premium-menu-visual">
        <div className={`premium-menu-bg ${dishGradient(item.category)}`} aria-hidden />
        <span className="premium-menu-emoji" aria-hidden>
          {dishEmoji(item.category)}
        </span>
        <div className="premium-menu-visual-scrim" aria-hidden />

        {item.category && (
          <span className="premium-menu-chip premium-menu-chip--category">
            {item.category}
          </span>
        )}

        {!item.available && (
          <span className="premium-menu-chip premium-menu-chip--warn">
            Unavailable
          </span>
        )}

        <div className="premium-menu-visual-overlay">
          <h3 className="premium-menu-name">{item.name}</h3>
        </div>
      </div>

      <div className="premium-menu-body">
        {item.description && (
          <p className="premium-menu-desc line-clamp-2">{item.description}</p>
        )}

        <div className="premium-menu-footer">
          <span className="premium-menu-glass-pill">
            {formatCurrency(item.price)}
          </span>

          {authLoading && !showAdd ? (
            <span className="inline-block h-7 w-16 animate-pulse rounded-xl bg-white/40" aria-hidden />
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
                className="premium-add-btn"
                aria-label={`Add ${item.name} to cart`}
              >
                <PlusIcon />
              </button>
            )
          ) : (
            <span className="text-xs text-stone-400">View only</span>
          )}
        </div>
      </div>
    </article>
  );
}
