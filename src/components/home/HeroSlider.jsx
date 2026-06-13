import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_SLIDES = [
  {
    title: 'Welcome to Hotel Abhi ruchi',
    subtitle: 'Real taste of Andhra — spices, soul, and tradition on every plate.',
    cta_label: 'Order Now',
    cta_link: '/menu',
    accent: 'from-dark-900 via-brand-900 to-brand-700',
    image: '/slides/slide-1.svg',
  },
  {
    title: 'Signature Dum Biryani',
    subtitle: 'Slow-cooked layers of fragrant rice and authentic Andhra masala.',
    cta_label: 'Order Now',
    cta_link: '/menu',
    accent: 'from-brand-900 via-brand-700 to-amber-700',
    image: '/slides/slide-2.svg',
  },
  {
    title: 'Dine In or Pickup',
    subtitle: 'Enjoy at our restaurant or order fresh food ready for pickup.',
    cta_label: 'Order Now',
    cta_link: '/menu',
    accent: 'from-stone-900 via-brand-800 to-orange-800',
    image: '/slides/slide-3.svg',
  },
  {
    title: 'Fresh. Hot. Homestyle.',
    subtitle: 'Starters, biryanis, curries, and desserts made the Andhra way.',
    cta_label: 'View Menu',
    cta_link: '/menu',
    accent: 'from-orange-900 via-brand-800 to-dark-900',
    image: '/slides/slide-4.svg',
  },
];

export default function HeroSlider({ settings, menuLink = '/', showActions = false }) {
  const resolveLink = (link) => (link === '/menu' ? menuLink : link || menuLink);
  const slides =
    settings?.hero_slides?.length > 0
      ? settings.hero_slides.map((slide, index) => ({
          ...DEFAULT_SLIDES[index % DEFAULT_SLIDES.length],
          ...slide,
          image: slide.image || DEFAULT_SLIDES[index % DEFAULT_SLIDES.length].image,
        }))
      : DEFAULT_SLIDES.map((slide, index) => ({
          ...slide,
          title: slide.title.replace('Hotel Abhi ruchi', settings?.name || 'Hotel Abhi ruchi'),
          subtitle: index === 0 && settings?.tagline ? settings.tagline : slide.subtitle,
        }));

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index) => {
      setActive((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const current = slides[active];
  const heroAccent = slides[0]?.accent || DEFAULT_SLIDES[0].accent;

  return (
    <section
      className="restaurant-hero-slider relative overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Restaurant highlights"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${heroAccent}`} />
      <div className="restaurant-hero-slider-scrim absolute inset-0 bg-black/30" />

      <div className="relative mx-auto max-w-7xl px-4 pb-3 pt-8 sm:px-6 sm:pb-4 sm:pt-10">
        <div className="grid items-center gap-4 md:grid-cols-2 md:gap-6">
          <div className="max-w-xl">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-200 sm:text-sm">
              {settings?.tagline}
            </p>
            <h2
              key={current.title}
              className="animate-fade-in font-display text-xl font-bold leading-tight sm:text-2xl md:text-3xl"
            >
              {current.title}
            </h2>
            <p
              key={current.subtitle}
              className="animate-fade-in mt-1.5 text-sm text-brand-50 sm:text-base"
            >
              {current.subtitle}
            </p>
            {showActions && (
              <div
                key={`${current.cta_label}-actions`}
                className="animate-fade-in mt-5 flex flex-wrap items-center gap-3"
              >
                <Link to={resolveLink(current.cta_link)} className="btn-order-now-hero">
                  <span className="btn-order-now-hero-shine" aria-hidden />
                  {current.cta_label || 'Order Now'}
                </Link>
                <Link to={menuLink} className="btn-hero-outline px-6 py-3 text-sm sm:text-base">
                  View Menu
                </Link>
              </div>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl ring-1 ring-black/10">
              <img
                key={current.image}
                src={current.image}
                alt=""
                className="animate-fade-in h-[200px] w-full object-cover sm:h-[220px] md:h-[240px]"
              />
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <div className="mt-3 flex items-center justify-center gap-2 pb-1">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === active ? 'w-6 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/65'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-1 sm:flex">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-lg backdrop-blur hover:bg-black/50"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-lg backdrop-blur hover:bg-black/50"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
