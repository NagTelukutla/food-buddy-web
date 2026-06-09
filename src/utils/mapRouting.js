import { OSRM_BASE_URL } from '../config/env';
const routeCache = new Map();
const MAX_CACHE = 64;

export function hasMapPoint(point) {
  return (
    point != null
    && Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
  );
}

function cacheKey(from, to) {
  return `${from.latitude},${from.longitude}->${to.latitude},${to.longitude}`;
}

/** Fetch a driving route that follows roads (OSRM / OpenStreetMap). */
export async function fetchDrivingRoute(from, to) {
  if (!hasMapPoint(from) || !hasMapPoint(to)) return [];

  const key = cacheKey(from, to);
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }

  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Routing failed');
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
      throw new Error('No route');
    }

    const positions = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    if (routeCache.size >= MAX_CACHE) {
      routeCache.delete(routeCache.keys().next().value);
    }
    routeCache.set(key, positions);
    return positions;
  } catch {
    return [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude],
    ];
  }
}

const EN_ROUTE_TO_CUSTOMER = new Set(['out_for_delivery', 'picked_up', 'in_transit']);
const EN_ROUTE_TO_RESTAURANT = new Set(['accepted', 'pending_acceptance']);

/**
 * Food-app style legs: one active road route at a time — no zigzag through all markers.
 */
export function getDeliveryRouteLegs({ restaurant, destination, driver, deliveryStatus }) {
  if (driver && destination && EN_ROUTE_TO_CUSTOMER.has(deliveryStatus)) {
    return {
      primary: { from: driver, to: destination, label: 'On the way to you' },
      secondary: null,
    };
  }

  if (driver && restaurant && EN_ROUTE_TO_RESTAURANT.has(deliveryStatus)) {
    return {
      primary: { from: driver, to: restaurant, label: 'Heading to restaurant' },
      secondary: destination
        ? { from: restaurant, to: destination, label: 'Then to customer', muted: true }
        : null,
    };
  }

  if (driver && destination) {
    return {
      primary: { from: driver, to: destination, label: 'On the way to you' },
      secondary: null,
    };
  }

  if (restaurant && destination) {
    return {
      primary: { from: restaurant, to: destination, label: 'Delivery route' },
      secondary: null,
    };
  }

  return { primary: null, secondary: null };
}
