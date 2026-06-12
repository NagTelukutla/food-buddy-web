import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { restaurantApi } from '../api/restaurantApi';

export default function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    restaurantApi
      .list()
      .then(({ data }) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load restaurants');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
          <span className="block">Hungry? Order from</span>
          <span className="block text-brand-600 mt-2">Our Premium Restaurants</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-stone-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
          Choose a restaurant near you to view their menu and order delicious food directly to your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/70 border border-stone-200/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/30 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold text-xl border border-brand-100">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  restaurant.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  {restaurant.cuisine_type && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                      {restaurant.cuisine_type}
                    </span>
                  )}
                </div>
                {restaurant.tagline && (
                  <p className="mt-1 text-sm text-stone-500 italic">
                    "{restaurant.tagline}"
                  </p>
                )}
                {restaurant.description && (
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-stone-100 pt-4 flex flex-col gap-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{restaurant.address}</span>
              </div>
              {restaurant.working_hours && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{restaurant.working_hours}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl"
              >
                <span>View Menu</span>
                <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
