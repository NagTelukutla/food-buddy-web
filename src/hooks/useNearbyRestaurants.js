import { useMemo } from 'react';
import { useDeliveryLocation } from '../context/DeliveryLocationContext';
import { SERVICE_RADIUS_KM } from '../utils/constants';
import { distanceKm, isValidCoord } from '../utils/geo';

/**
 * Filter & sort restaurants by distance from the customer's selected delivery
 * location (Swiggy/Zomato style: show restaurants that deliver to *this* address,
 * not to the customer's current GPS position).
 *
 * Restaurants are annotated with `distanceKm`. When the delivery location has
 * coordinates, we return only those within `radiusKm`, nearest first. Restaurants
 * missing coordinates can't be distance-checked, so they're surfaced separately
 * (under `unlocated`) rather than silently hidden.
 */
export default function useNearbyRestaurants(restaurants, radiusKm = SERVICE_RADIUS_KM) {
  const { deliveryLocation } = useDeliveryLocation();

  return useMemo(() => {
    const list = Array.isArray(restaurants) ? restaurants : [];
    const origin = deliveryLocation;
    const hasOrigin = !!origin && isValidCoord(origin.latitude, origin.longitude);

    if (!hasOrigin) {
      return {
        hasLocation: !!origin,
        hasCoordinates: false,
        nearby: list,
        unlocated: [],
        outOfRange: 0,
        radiusKm,
      };
    }

    const located = [];
    const unlocated = [];

    list.forEach((restaurant) => {
      const lat = Number(restaurant.latitude);
      const lng = Number(restaurant.longitude);
      if (!isValidCoord(lat, lng)) {
        unlocated.push(restaurant);
        return;
      }
      located.push({
        ...restaurant,
        distanceKm: distanceKm(origin.latitude, origin.longitude, lat, lng),
      });
    });

    located.sort((a, b) => a.distanceKm - b.distanceKm);
    const nearby = located.filter((r) => r.distanceKm <= radiusKm);

    return {
      hasLocation: true,
      hasCoordinates: true,
      nearby,
      unlocated,
      outOfRange: located.length - nearby.length,
      radiusKm,
    };
  }, [restaurants, deliveryLocation, radiusKm]);
}
