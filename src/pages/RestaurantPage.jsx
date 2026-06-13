import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantApi } from '../api/restaurantApi';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';
import PageContainer from '../components/common/PageContainer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import MenuFilters from '../components/menu/MenuFilters';
import MenuCard from '../components/menu/MenuCard';
import ModalShell from '../components/common/ModalShell';
import HeroSlider from '../components/home/HeroSlider';

export default function RestaurantPage() {
  const { id } = useParams();
  const restaurantIdInt = parseInt(id, 10);
  const [searchParams] = useSearchParams();
  
  const { selectedRestaurant, setSelectedRestaurant } = useSelectedRestaurant();
  const { items: cartItems, addItem, clearCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loadingRes, setLoadingRes] = useState(true);
  const [errorRes, setErrorRes] = useState(null);

  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const { items: menuItems, loading: menuLoading, error: menuError } = useMenu({
    search,
    category,
    availableOnly,
    restaurantId: restaurantIdInt,
  });

  const [pendingItem, setPendingItem] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => {
    setLoadingRes(true);
    setErrorRes(null);
    restaurantApi
      .get(restaurantIdInt)
      .then(({ data }) => {
        setRestaurant(data);
        setSelectedRestaurant(data);
        setLoadingRes(false);
      })
      .catch((err) => {
        setErrorRes(err.response?.data?.detail || 'Failed to load restaurant details');
        setLoadingRes(false);
      });
  }, [restaurantIdInt, setSelectedRestaurant]);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearch(query);
  }, [searchParams]);

  const handleAddToCart = (item) => {
    // Check if the cart has items from a different restaurant
    const hasMismatch = cartItems.some(
      (cartItem) => cartItem.restaurant_id && cartItem.restaurant_id !== restaurantIdInt
    );

    if (hasMismatch) {
      setPendingItem(item);
      setShowClearCartModal(true);
    } else {
      addItem({ ...item, restaurant_id: restaurantIdInt });
      toast.success(`${item.name} added to cart!`);
    }
  };

  const confirmClearCart = () => {
    clearCart();
    if (pendingItem) {
      addItem({ ...pendingItem, restaurant_id: restaurantIdInt });
      toast.success(`${pendingItem.name} added to cart!`);
    }
    setShowClearCartModal(false);
    setPendingItem(null);
  };

  if (loadingRes) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorRes) {
    return (
      <PageContainer>
        <ErrorState message={errorRes} />
      </PageContainer>
    );
  }

  return (
    <div className="restaurant-page">
      {restaurant && (
        <>
          <HeroSlider
            settings={restaurant}
            showActions={false}
            menuLink={`/restaurant/${restaurantIdInt}#restaurant-menu`}
          />

          <PageContainer className="restaurant-page-content !px-4 !pb-6 !pt-0 sm:!px-6">
            <div className="premium-info-panel restaurant-info-panel">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="home-heading">{restaurant.name}</h1>
                  {restaurant.cuisine_type && (
                    <span className="glass-pill shrink-0 px-3 py-1 text-xs font-semibold text-brand-700 sm:text-sm">
                      {restaurant.cuisine_type}
                    </span>
                  )}
                </div>
                {restaurant.tagline && (
                  <p className="home-lead mt-1">{restaurant.tagline}</p>
                )}
                {restaurant.description && (
                  <p className="home-card-body mt-2 max-w-3xl">{restaurant.description}</p>
                )}
              </div>

              <div className="restaurant-info-details">
                <div className="restaurant-info-row">
                  <div className="restaurant-info-icon" aria-hidden>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">Address</p>
                    <p className="text-xs leading-relaxed text-stone-500">{restaurant.address}</p>
                  </div>
                </div>

                <div className="restaurant-info-row">
                  <div className="restaurant-info-icon" aria-hidden>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">Working Hours</p>
                    <p className="text-xs leading-relaxed text-stone-500 whitespace-pre-line">
                      {restaurant.working_hours || 'Daily: 11 AM - 11 PM'}
                    </p>
                  </div>
                </div>

                <div className="restaurant-info-row">
                  <div className="restaurant-info-icon" aria-hidden>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">Contact</p>
                    <p className="text-xs leading-relaxed text-stone-500">{restaurant.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-section !pb-4" id="restaurant-menu">
              <h2 className="home-heading mb-4 sm:mb-5">Menu Items</h2>
              
              <MenuFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                availableOnly={availableOnly}
                onAvailableOnlyChange={setAvailableOnly}
              />

              {menuLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              )}

              {menuError && <ErrorState message={menuError} />}

              {!menuLoading && !menuError && menuItems.length === 0 && (
                <EmptyState
                  icon="search"
                  title="No dishes found"
                  message="Try adjusting your search or filters."
                />
              )}

              {!menuLoading && !menuError && menuItems.length > 0 && (
                <div className="premium-menu-grid premium-menu-grid--compact">
                  {menuItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={{ ...item, restaurant_id: restaurantIdInt }}
                      onAddToCart={() => handleAddToCart(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </PageContainer>
        </>
      )}

      {showClearCartModal && (
        <ModalShell
          title="Replace cart items?"
          onClose={() => setShowClearCartModal(false)}
          compact
          centered
          confirmCentered
        >
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
            <p className="text-sm text-stone-600">
              Your cart contains items from a different restaurant. Would you like to clear your cart and start a new order at <strong>{restaurant?.name}</strong>?
            </p>
          </div>
          <div className="mt-6 flex gap-3 w-full">
            <button
              type="button"
              className="btn-secondary flex-1 py-2 rounded-xl"
              onClick={() => setShowClearCartModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 border-none"
              onClick={confirmClearCart}
            >
              Clear & Add
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
