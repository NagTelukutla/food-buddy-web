import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import PageContainer from '../components/common/PageContainer';
import PremiumHeroBanner from '../components/home/PremiumHeroBanner';
import RestaurantCardsSection from '../components/home/RestaurantCardsSection';
import { restaurantApi } from '../api/restaurantApi';
import { useDeliveryLocation } from '../context/DeliveryLocationContext';
import useNearbyRestaurants from '../hooks/useNearbyRestaurants';

function NoRestaurantsNearby({ areaLabel, radiusKm }) {
  return (
    <div className="premium-section">
      <div className="card mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-stone-900">No restaurants deliver here yet</h3>
        <p className="mt-2 text-sm text-stone-600">
          We couldn&apos;t find any restaurants within {radiusKm} km of
          {areaLabel ? ` ${areaLabel}` : ' your delivery address'}. Try a different delivery location.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { deliveryLocation } = useDeliveryLocation();
  const { hasCoordinates, nearby, unlocated, radiusKm } = useNearbyRestaurants(restaurants);

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
      <PageContainer>
        <ErrorState message={error} />
      </PageContainer>
    );
  }

  const areaLabel =
    deliveryLocation?.suburb || deliveryLocation?.city || deliveryLocation?.label || '';
  // When we can measure distance, show only nearby restaurants. Restaurants
  // without coordinates can't be filtered, so fall back to showing them.
  const primaryList = hasCoordinates ? nearby : restaurants;
  const showEmptyState = hasCoordinates && nearby.length === 0 && unlocated.length === 0;

  return (
    <div className="font-sans antialiased">
      <PageContainer className="!px-4 !py-5 sm:!px-6 sm:!py-8">
        <PremiumHeroBanner />

        {showEmptyState ? (
          <NoRestaurantsNearby areaLabel={areaLabel} radiusKm={radiusKm} />
        ) : (
          <>
            <RestaurantCardsSection restaurants={primaryList} sectionId="restaurants" />
            {hasCoordinates && unlocated.length > 0 && (
              <RestaurantCardsSection restaurants={unlocated} sectionId="more-restaurants" />
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}
