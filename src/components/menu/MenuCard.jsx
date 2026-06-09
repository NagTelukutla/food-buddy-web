import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { canShowMenuAddButton } from '../../utils/roles';
import { formatCurrency } from '../../utils/format';

export default function MenuCard({ item }) {
  const { addItem } = useCart();
  const { activeSessions, loading: authLoading } = useAuth();
  const showAdd = canShowMenuAddButton(activeSessions);

  const handleAdd = () => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <article className="card flex flex-col transition hover:shadow-md">
      <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-4xl">
        {item.category === 'Biryani' ? '🍛' : item.category === 'Desserts' ? '🍰' : '🍽️'}
      </div>
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-900">{item.name}</h3>
        {!item.available && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Unavailable</span>
        )}
      </div>
      <p className="mb-2 flex-1 text-sm text-stone-600 line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-brand-700">{formatCurrency(item.price)}</span>
        {authLoading && !showAdd ? (
          <span className="inline-block h-8 w-14 animate-pulse rounded-lg bg-stone-100" aria-hidden />
        ) : showAdd ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!item.available}
            className="btn-primary text-xs"
          >
            Add
          </button>
        ) : (
          <span className="text-xs text-stone-400">View only</span>
        )}
      </div>
    </article>
  );
}
