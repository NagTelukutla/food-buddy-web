import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SelectedRestaurantContext = createContext(null);

export function SelectedRestaurantProvider({ children }) {
  const [selectedRestaurant, setSelectedRestaurantState] = useState(() => {
    try {
      const stored = localStorage.getItem('selected_restaurant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setSelectedRestaurant = useCallback((restaurant) => {
    setSelectedRestaurantState(restaurant);
    if (restaurant) {
      localStorage.setItem('selected_restaurant', JSON.stringify(restaurant));
    } else {
      localStorage.removeItem('selected_restaurant');
    }
  }, []);

  const clearSelectedRestaurant = useCallback(() => {
    setSelectedRestaurantState(null);
    localStorage.removeItem('selected_restaurant');
  }, []);

  const value = useMemo(
    () => ({
      selectedRestaurant,
      setSelectedRestaurant,
      clearSelectedRestaurant,
    }),
    [selectedRestaurant, setSelectedRestaurant, clearSelectedRestaurant]
  );

  return (
    <SelectedRestaurantContext.Provider value={value}>
      {children}
    </SelectedRestaurantContext.Provider>
  );
}

export function useSelectedRestaurant() {
  const context = useContext(SelectedRestaurantContext);
  if (!context) {
    throw new Error('useSelectedRestaurant must be used within SelectedRestaurantProvider');
  }
  return context;
}
