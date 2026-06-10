import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HeroSlider from '../components/home/HeroSlider';
import MenuCard from '../components/menu/MenuCard';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';

export default function HomePage() {
  const { settings, loading: settingsLoading } = useSettings();
  const featuredIds = settings?.featured_dish_ids || [];
  const { items, loading: menuLoading } = useMenu({});
  const featured = items.filter((item) => featuredIds.includes(item.id));

  if (settingsLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <HeroSlider settings={settings} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-stone-900 sm:mb-8 sm:text-3xl">
          Featured Dishes
        </h2>
        {menuLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featured.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/menu" className="btn-order-now-hero">
            <span className="btn-order-now-hero-shine" aria-hidden="true" />
            <span className="relative z-[1] flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Order Now
            </span>
          </Link>
          <Link to="/menu" className="btn-secondary px-8 py-3.5 text-base font-semibold">
            View Full Menu
          </Link>
        </div>
      </section>
    </div>
  );
}
