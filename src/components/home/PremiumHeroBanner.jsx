import { useCallback, useEffect, useState } from 'react';
import { PROMO_SLIDES } from '../../data/promoSlides';
import { useSwipeCarousel } from '../../hooks/useSwipeCarousel';

export default function PremiumHeroBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index) => {
    setActive((index + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const { onTouchStart, onTouchEnd } = useSwipeCarousel(goNext, goPrev);

  useEffect(() => {
    if (paused || PROMO_SLIDES.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="premium-hero-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div
        className="premium-hero-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {PROMO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`premium-hero-slide transition-opacity duration-700 ease-out ${
              index === active ? 'premium-hero-slide--active' : 'premium-hero-slide--inactive'
            }`}
            aria-hidden={index !== active}
          >
            <div className="premium-promo-panel">
              <div className="premium-promo-content">
                <span className="premium-promo-badge">{slide.badge}</span>
                <p className="premium-promo-eyebrow">{slide.eyebrow}</p>
                <h2 className="premium-promo-title">{slide.title}</h2>
                <p className="premium-promo-lead">{slide.subtitle}</p>
              </div>

              <div className="premium-promo-visual" aria-hidden>
                <img
                  src={slide.image}
                  alt=""
                  className="premium-promo-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ))}

        {PROMO_SLIDES.length > 1 && (
          <div className="premium-hero-dots">
            {PROMO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                className="premium-hero-dot-btn"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === active ? 'true' : undefined}
              >
                <span
                  className={`premium-hero-dot ${
                    index === active ? 'premium-hero-dot--active' : ''
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
