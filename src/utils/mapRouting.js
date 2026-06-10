import { OSRM_BASE_URL } from '../config/env';
import { normalizeRouteSteps } from './mapNavigation';

const routeCache = new Map();
const routeDetailsCache = new Map();
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

function trimCache(cache) {
  if (cache.size >= MAX_CACHE) {
    cache.delete(cache.keys().next().value);
  }
}

/** Fetch a driving route with geometry, ETA, and turn-by-turn steps. */
export async function fetchDrivingRouteWithDetails(from, to, { steps = true } = {}) {
  if (!hasMapPoint(from) || !hasMapPoint(to)) {
    return { positions: [], distance: 0, duration: 0, steps: [] };
  }

  const key = `${cacheKey(from, to)}:steps=${steps ? 1 : 0}`;
  if (routeDetailsCache.has(key)) {
    return routeDetailsCache.get(key);
  }

  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson&steps=${steps ? 'true' : 'false'}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Routing failed');
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
      throw new Error('No route');
    }

    const route = data.routes[0];
    const positions = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const normalizedSteps = steps ? normalizeRouteSteps(route.legs) : [];
    const result = {
      positions,
      distance: route.distance || 0,
      duration: route.duration || 0,
      steps: normalizedSteps,
    };

    trimCache(routeDetailsCache);
    routeDetailsCache.set(key, result);
    trimCache(routeCache);
    routeCache.set(cacheKey(from, to), positions);
    return result;
  } catch {
    const fallback = {
      positions: [
        [from.latitude, from.longitude],
        [to.latitude, to.longitude],
      ],
      distance: haversineFallback(from, to),
      duration: 0,
      steps: [],
    };
    return fallback;
  }
}

function haversineFallback(from, to) {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(x));
}

/** Fetch a driving route that follows roads (OSRM / OpenStreetMap). */
export async function fetchDrivingRoute(from, to) {
  const details = await fetchDrivingRouteWithDetails(from, to, { steps: false });
  return details.positions;
}

export function clearRouteCache() {
  routeCache.clear();
  routeDetailsCache.clear();
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
