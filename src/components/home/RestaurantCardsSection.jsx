import RestaurantCard from './RestaurantCard';

export default function RestaurantCardsSection({ restaurants, sectionId = 'restaurants' }) {
  if (!restaurants?.length) return null;

  return (
    <section id={sectionId} className="home-scroll-target premium-section" aria-label="Restaurants">
      <div className="premium-restaurant-grid">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
        ))}
      </div>
    </section>
  );
}
