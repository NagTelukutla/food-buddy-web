/** Customer menu route for the currently selected restaurant. */
export function getSelectedRestaurantMenuPath(selectedRestaurant) {
  if (!selectedRestaurant?.id) return '/';
  return `/restaurant/${selectedRestaurant.id}`;
}
