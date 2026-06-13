import { useNavigate } from 'react-router-dom';
import { formatDistanceKm } from '../../utils/geo';

const BANNER_GRADIENTS = [
  'premium-restaurant-bg-a',
  'premium-restaurant-bg-b',
  'premium-restaurant-bg-c',
];

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function RestaurantCard({ restaurant, index = 0 }) {
  const navigate = useNavigate();
  const gradientClass = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
  const distanceLabel = Number.isFinite(restaurant.distanceKm)
    ? formatDistanceKm(restaurant.distanceKm)
    : null;

  const goToRestaurant = () => navigate(`/restaurant/${restaurant.id}`);

  return (
    <article
      onClick={goToRestaurant}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToRestaurant();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${restaurant.name} details`}
      className="premium-restaurant-card group glass-rise"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="premium-restaurant-visual">
        <div className={`premium-restaurant-bg ${gradientClass}`} aria-hidden />
        {restaurant.hero_image && (
          <img
            src={restaurant.hero_image}
            alt=""
            className="premium-restaurant-photo"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="premium-restaurant-scrim" aria-hidden />

        {restaurant.working_hours && (
          <span className="premium-glass-chip premium-glass-chip--left">
            <ClockIcon />
            <span className="truncate">{restaurant.working_hours.split(':')[0] || restaurant.working_hours}</span>
          </span>
        )}

        {restaurant.cuisine_type && (
          <span className="premium-glass-chip premium-glass-chip--right">{restaurant.cuisine_type}</span>
        )}

        <div className="premium-restaurant-overlay">
          <div className="min-w-0 flex-1">
            <h3 className="premium-restaurant-name">{restaurant.name}</h3>
            {distanceLabel && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white/90">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {distanceLabel} away
              </p>
            )}
            {restaurant.tagline && (
              <p className="premium-restaurant-tagline line-clamp-1">{restaurant.tagline}</p>
            )}
            {restaurant.description && (
              <p className="premium-restaurant-desc line-clamp-2">{restaurant.description}</p>
            )}
          </div>
          <span className="premium-action-pill">Explore</span>
        </div>
      </div>
    </article>
  );
}
