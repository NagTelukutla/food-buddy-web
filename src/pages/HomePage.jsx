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
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/menu" className="btn-primary px-10 py-3 text-base">
            Order Now
          </Link>
          <Link to="/menu" className="btn-secondary">
            Explore Full Menu
          </Link>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 font-display text-2xl font-bold sm:text-3xl">About Us</h2>
          <p className="leading-relaxed text-stone-600">{settings?.about}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-2 font-semibold">Contact Details</h3>
            <p className="text-sm text-stone-600">{settings?.address}</p>
            <p className="text-sm text-stone-600">{settings?.phone}</p>
            <p className="text-sm break-all text-stone-600">{settings?.email}</p>
          </div>
          <div className="card">
            <h3 className="mb-2 font-semibold">Working Hours</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
              {settings?.working_hours}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
