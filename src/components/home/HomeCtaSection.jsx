import { Link } from 'react-router-dom';

export default function HomeCtaSection({ restaurantId, settings }) {
  const menuPath = restaurantId ? `/restaurant/${restaurantId}` : '/';
  const restaurantName = settings?.name || 'our restaurant';

  return (
    <section className="mb-6 sm:mb-10" aria-labelledby="home-cta-heading">
      <div className="glass-hero-banner relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
            Ready to indulge?
          </p>
          <h2 id="home-cta-heading" className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Experience {restaurantName} Today
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-50 sm:text-base">
            Order your favorites for delivery or pickup, or visit us for an unforgettable dine-in experience.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to={menuPath} className="btn-order-now-hero">
              <span className="btn-order-now-hero-shine" aria-hidden />
              Order Now
            </Link>
            <Link to={menuPath} className="btn-hero-outline px-7 py-3.5 text-sm sm:text-base">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
