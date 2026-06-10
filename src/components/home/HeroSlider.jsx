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

export default function HeroSlider({ settings }) {
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

  return (
    <section
      className="relative overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Restaurant highlights"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 ${current.accent}`}
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14">
        <div className="grid items-center gap-5 md:grid-cols-2 md:gap-8">
          <div className="max-w-xl">
            <img
              src="/logo.png"
              alt=""
              className="mb-3 h-11 w-11 sm:h-12 sm:w-12"
            />
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-brand-200 sm:text-sm">
              {settings?.tagline}
            </p>
            <h1
              key={current.title}
              className="animate-fade-in font-display text-xl font-bold leading-tight sm:text-3xl md:text-4xl"
            >
              {current.title}
            </h1>
            <p
              key={current.subtitle}
              className="animate-fade-in mt-2 text-sm text-brand-50 sm:text-base"
            >
              {current.subtitle}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                to={current.cta_link || '/menu'}
                className="btn-hero-primary w-full px-6 py-2.5 text-sm sm:w-auto sm:text-base"
              >
                {current.cta_label || 'Order Now'}
              </Link>
              <Link
                to="/menu"
                className="btn-hero-outline w-full px-6 py-2.5 text-sm sm:w-auto sm:text-base"
              >
                View Menu
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="overflow-hidden rounded-xl border border-white/20 shadow-2xl ring-1 ring-black/10">
              <img
                key={current.image}
                src={current.image}
                alt=""
                className="animate-fade-in h-[260px] w-full object-cover sm:h-[276px] md:h-[292px] lg:h-[308px]"
              />
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <div className="mt-5 flex items-center justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === active ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
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
