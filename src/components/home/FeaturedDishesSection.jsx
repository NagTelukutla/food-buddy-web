import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import SectionHeading from './SectionHeading';

const CATEGORY_EMOJI = {
  Biryani: '🍛',
  Desserts: '🍰',
  Starters: '🥗',
  Soups: '🍲',
  'Main Course': '🍽️',
  Beverages: '🥤',
};

function dishEmoji(category) {
  return CATEGORY_EMOJI[category] || '🍽️';
}

export default function FeaturedDishesSection({ dishes, restaurantId, loading }) {
  if (loading) {
    return (
      <section className="mb-14 sm:mb-20" aria-label="Featured dishes loading">
        <SectionHeading eyebrow="Chef's Selection" title="Featured Dishes" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-surface-soft h-64 animate-pulse rounded-[1.75rem] bg-white/40"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!dishes?.length) return null;

  const menuPath = restaurantId ? `/restaurant/${restaurantId}` : '/';

  return (
    <section className="mb-14 sm:mb-20" aria-labelledby="featured-dishes-heading">
      <SectionHeading
        eyebrow="Chef's Selection"
        title="Featured Dishes"
        subtitle="Handpicked favorites crafted with authentic spices, fresh ingredients, and generations of culinary tradition."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dishes.map((dish, index) => (
          <Link
            key={dish.id}
            to={menuPath}
            className="glass-surface group flex flex-col p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-5 glass-rise"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="glass-menu-thumb mb-4 h-32 text-5xl transition-transform duration-300 group-hover:scale-[1.03]">
              {dishEmoji(dish.category)}
            </div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors">
                {dish.name}
              </h3>
              {dish.category && (
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  {dish.category}
                </span>
              )}
            </div>
            {dish.description && (
              <p className="mb-4 flex-1 text-sm leading-relaxed text-stone-600 line-clamp-2">
                {dish.description}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between border-t border-white/50 pt-4">
              <span className="text-lg font-bold text-brand-700">{formatCurrency(dish.price)}</span>
              <span className="text-xs font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                Order →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
