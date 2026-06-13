import { RECENT_LOCATION_SEARCHES_KEY } from './constants';
import { getGoogleMapsApiKey } from './googleMapsLoader';

const PLACES_API_BASE = 'https://places.googleapis.com/v1';
const LOCAL_RADIUS_KM = 18;
const MIN_REQUEST_GAP_MS = 200;
const SEARCH_REGION = 'in';

const searchCache = new Map();
const placeDetailsCache = new Map();
const reverseGeocodeCache = new Map();
const MAX_CACHE_SIZE = 32;
const MIN_SEARCH_LENGTH = 6;
let lastRequestAt = 0;
let throttleChain = Promise.resolve();

function throttleRequest(fn) {
  throttleChain = throttleChain.then(async () => {
    const wait = Math.max(0, MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  return throttleChain;
}

async function placesFetch(path, body, fieldMask, { method = 'POST' } = {}) {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) throw new Error('Google Maps API key is not configured');

  return throttleRequest(async () => {
    const response = await fetch(`${PLACES_API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(errorBody || 'Location lookup failed');
    }

    return response.json();
  });
}

export function extractLocalityFromAddressComponents(components = []) {
  const get = (type) => components.find((item) => item.types?.includes(type))?.longText
    || components.find((item) => item.types?.includes(type))?.long_name;

  return {
    city:
      get('locality') ||
      get('administrative_area_level_2') ||
      get('administrative_area_level_3'),
    state: get('administrative_area_level_1'),
    suburb:
      get('sublocality') ||
      get('sublocality_level_1') ||
      get('neighborhood') ||
      get('postal_town'),
    postcode: get('postal_code'),
  };
}

export function buildSearchReference(deliveryLocation) {
  if (!deliveryLocation) return null;

  return {
    latitude: deliveryLocation.latitude ?? null,
    longitude: deliveryLocation.longitude ?? null,
    city: deliveryLocation.city ?? null,
    state: deliveryLocation.state ?? null,
    suburb: deliveryLocation.suburb ?? null,
  };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeAddressComponents(components = []) {
  return components.map((component) => ({
    longText: component.longText || component.long_name,
    shortText: component.shortText || component.short_name,
    types: component.types || [],
  }));
}

function formatGoogleAddress(place) {
  if (!place) return '';
  if (place.formattedAddress) return place.formattedAddress;
  if (place.formatted_address) return place.formatted_address;
  return place.displayName?.text || '';
}

export function formatSuggestionPrimary(item) {
  const place = item.raw || {};
  const displayName = place.displayName?.text;
  if (displayName) return displayName;

  const components = normalizeAddressComponents(place.addressComponents || place.address_components);
  const get = (type) => components.find((component) => component.types.includes(type))?.longText;

  const streetNumber = get('street_number');
  const route = get('route');
  if (streetNumber && route) return `${streetNumber}, ${route}`;
  if (route) return route;

  const suburb = get('sublocality') || get('sublocality_level_1') || get('neighborhood');
  if (suburb) return suburb;

  const city = get('locality') || get('administrative_area_level_2');
  if (city) return city;

  return item.label.split(',')[0]?.trim() || item.label;
}

export function formatSuggestionSecondary(item) {
  const place = item.raw || {};
  const components = normalizeAddressComponents(place.addressComponents || place.address_components);
  const get = (type) => components.find((component) => component.types.includes(type))?.longText;
  const parts = [];

  const suburb = get('sublocality') || get('sublocality_level_1') || get('neighborhood');
  if (suburb) parts.push(suburb);

  const city = get('locality') || get('administrative_area_level_2') || get('postal_town');
  if (city) parts.push(city);

  const state = get('administrative_area_level_1');
  if (state) parts.push(state);

  const postcode = get('postal_code');
  if (postcode) parts.push(postcode);

  if (parts.length > 0) return parts.join(', ');

  return item.label.split(',').slice(1, 3).map((part) => part.trim()).filter(Boolean).join(', ');
}

function mapGooglePlace(place) {
  const components = normalizeAddressComponents(place.addressComponents || place.address_components);
  const locality = extractLocalityFromAddressComponents(components);
  const label = formatGoogleAddress(place);

  return {
    id: String(place.id || place.place_id),
    label,
    primaryLabel: formatSuggestionPrimary({ label, raw: { ...place, addressComponents: components } }),
    secondaryLabel: formatSuggestionSecondary({ label, raw: { ...place, addressComponents: components } }),
    latitude: Number(place.location?.latitude ?? place.geometry?.location?.lat),
    longitude: Number(place.location?.longitude ?? place.geometry?.location?.lng),
    city: locality.city,
    state: locality.state,
    suburb: locality.suburb,
    raw: { ...place, addressComponents: components },
  };
}

function mapAutocompleteSuggestion(suggestion) {
  const prediction = suggestion?.placePrediction;
  if (!prediction) return null;

  const mainText = prediction.structuredFormat?.mainText?.text || '';
  const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';
  const label = prediction.text?.text || [mainText, secondaryText].filter(Boolean).join(', ');

  return {
    id: String(prediction.placeId),
    placeId: prediction.placeId,
    label,
    primaryLabel: mainText || label.split(',')[0]?.trim() || label,
    secondaryLabel: secondaryText || label.split(',').slice(1).join(',').trim(),
    latitude: null,
    longitude: null,
    raw: prediction,
  };
}

function buildLocationBias(reference) {
  if (reference?.latitude == null || reference?.longitude == null) return null;

  return {
    circle: {
      center: {
        latitude: reference.latitude,
        longitude: reference.longitude,
      },
      radius: LOCAL_RADIUS_KM * 1000,
    },
  };
}

async function fetchAutocompleteResults(query, reference = null) {
  const body = {
    input: query,
    includedRegionCodes: [SEARCH_REGION],
  };

  const bias = buildLocationBias(reference);
  if (bias) body.locationBias = bias;

  const data = await placesFetch(
    '/places:autocomplete',
    body,
    'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.distanceMeters'
  );

  return (Array.isArray(data.suggestions) ? data.suggestions : [])
    .map(mapAutocompleteSuggestion)
    .filter(Boolean);
}

export async function fetchPlaceDetails(placeId) {
  const normalizedId = String(placeId).replace(/^places\//, '');
  if (placeDetailsCache.has(normalizedId)) {
    return placeDetailsCache.get(normalizedId);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) throw new Error('Google Maps API key is not configured');

  const place = await throttleRequest(async () => {
    const response = await fetch(
      `${PLACES_API_BASE}/places/${encodeURIComponent(normalizedId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,formattedAddress,location,addressComponents,displayName,types',
        },
      }
    );

    if (!response.ok) throw new Error('Place details lookup failed');
    return response.json();
  });

  const mapped = mapGooglePlace(place);
  placeDetailsCache.set(normalizedId, mapped);
  if (placeDetailsCache.size > MAX_CACHE_SIZE) {
    placeDetailsCache.delete(placeDetailsCache.keys().next().value);
  }

  return mapped;
}

function getPlaceTypeScore(item) {
  const types = item.raw?.types || [];

  if (types.some((type) => ['neighborhood', 'sublocality', 'sublocality_level_1', 'postal_town'].includes(type))) {
    return 45;
  }
  if (types.some((type) => ['route', 'street_address', 'intersection'].includes(type))) {
    return 40;
  }
  if (types.some((type) => ['premise', 'subpremise', 'establishment', 'point_of_interest'].includes(type))) {
    return 35;
  }
  if (types.some((type) => ['locality', 'administrative_area_level_3'].includes(type))) {
    return 20;
  }
  if (types.some((type) => ['administrative_area_level_1', 'administrative_area_level_2', 'country'].includes(type))) {
    return 5;
  }
  return 15;
}

function getTextMatchScore(label, query) {
  const normalizedLabel = normalizeText(label);
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  let score = 0;
  if (normalizedLabel === normalizedQuery) score += 80;
  else if (normalizedLabel.startsWith(normalizedQuery)) score += 55;
  else if (normalizedLabel.includes(normalizedQuery)) score += 35;

  const matchedTokens = tokens.filter((token) => normalizedLabel.includes(token)).length;
  score += matchedTokens * 12;

  if (tokens.length > 0 && matchedTokens === tokens.length) score += 20;

  return score;
}

function rankSearchResults(results, query, reference) {
  const referenceCity = normalizeText(reference?.city);
  const referenceState = normalizeText(reference?.state);
  const referenceSuburb = normalizeText(reference?.suburb);
  const hasCoords = reference?.latitude != null && reference?.longitude != null;

  return results
    .map((item) => {
      let score = getTextMatchScore(item.label, query);
      score += getPlaceTypeScore(item);

      const itemCity = normalizeText(item.city);
      const itemState = normalizeText(item.state);
      const itemSuburb = normalizeText(item.suburb);

      if (hasCoords) {
        const distanceKm = haversineKm(
          reference.latitude,
          reference.longitude,
          item.latitude,
          item.longitude
        );
        item.distanceKm = distanceKm;

        if (distanceKm <= 3) score += 120;
        else if (distanceKm <= 8) score += 95;
        else if (distanceKm <= 15) score += 75;
        else if (distanceKm <= 30) score += 45;
        else if (distanceKm <= 60) score += 20;
        else score += 4;
      }

      if (referenceCity && itemCity && referenceCity === itemCity) score += 70;
      else if (referenceCity && itemCity && itemCity.includes(referenceCity)) score += 40;

      if (referenceSuburb && itemSuburb && referenceSuburb === itemSuburb) score += 50;

      if (referenceState && itemState && referenceState === itemState) score += 35;

      if (referenceCity && itemCity && referenceCity !== itemCity) score -= 25;
      if (referenceState && itemState && referenceState && referenceState !== itemState) score -= 15;

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function formatSavedAddress(addr) {
  return `${addr.line1}, ${addr.city} — ${addr.pincode}`;
}

export function truncateAddress(text, maxLength = 34) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export async function searchPlaces(query, reference = null) {
  const trimmed = query.trim();
  if (trimmed.length < MIN_SEARCH_LENGTH) return [];

  const cacheKey = [
    trimmed.toLowerCase(),
    reference?.latitude?.toFixed(2) ?? '',
    reference?.longitude?.toFixed(2) ?? '',
    normalizeText(reference?.city),
  ].join('|');

  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const suggestions = await fetchAutocompleteResults(trimmed, reference);
  const ranked = rankSearchResults(suggestions, trimmed, reference).slice(0, 8);

  searchCache.set(cacheKey, ranked);
  if (searchCache.size > MAX_CACHE_SIZE) {
    searchCache.delete(searchCache.keys().next().value);
  }

  return ranked;
}

/** Fetch coordinates for a selected autocomplete suggestion (1 Place Details call). */
export async function resolvePlaceSelection(item) {
  if (!item) throw new Error('Invalid place selection');

  if (Number.isFinite(item.latitude) && Number.isFinite(item.longitude)) {
    return {
      label: item.label,
      address: item.label,
      latitude: item.latitude,
      longitude: item.longitude,
      city: item.city ?? null,
      state: item.state ?? null,
      suburb: item.suburb ?? null,
      source: 'search',
    };
  }

  const place = await fetchPlaceDetails(item.placeId || item.id);
  return {
    label: place.label,
    address: place.label,
    latitude: place.latitude,
    longitude: place.longitude,
    city: place.city,
    state: place.state,
    suburb: place.suburb,
    source: 'search',
  };
}

function reverseGeocodeCacheKey(latitude, longitude) {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

function mapReverseGeocodeFromPlace(place, latitude, longitude) {
  const components = normalizeAddressComponents(place.addressComponents || place.address_components);
  const locality = extractLocalityFromAddressComponents(components);

  return {
    id: String(place.id || place.place_id || `${latitude},${longitude}`),
    label: formatGoogleAddress(place) || place.displayName?.text || '',
    latitude,
    longitude,
    city: locality.city,
    state: locality.state,
    suburb: locality.suburb,
    raw: { ...place, addressComponents: components },
  };
}

export async function reverseGeocode(latitude, longitude) {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) throw new Error('Google Maps API key is not configured');

  const cacheKey = reverseGeocodeCacheKey(latitude, longitude);
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey);
  }

  let result;

  try {
    const data = await placesFetch(
      '/places:searchNearby',
      {
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 120,
          },
        },
        maxResultCount: 1,
        rankPreference: 'DISTANCE',
      },
      'places.id,places.formattedAddress,places.location,places.addressComponents,places.displayName,places.types'
    );

    const place = Array.isArray(data.places) ? data.places[0] : null;
    if (place) {
      result = mapReverseGeocodeFromPlace(place, latitude, longitude);
    }
  } catch {
    // Fall through to Geocoding API v4.
  }

  if (!result) {
    const response = await fetch(
      `https://geocode.googleapis.com/v4beta/geocode/location/${latitude},${longitude}?key=${encodeURIComponent(apiKey)}&languageCode=en`
    );

    if (!response.ok) throw new Error('Location lookup failed');

    const data = await response.json();
    const geocodeResult = Array.isArray(data.results) ? data.results[0] : null;
    if (!geocodeResult) throw new Error('Location lookup failed');

    const formattedAddress = geocodeResult.formattedAddress || geocodeResult.formatted_address;
    const components = normalizeAddressComponents(
      geocodeResult.addressComponents || geocodeResult.address_components || []
    );
    const locality = extractLocalityFromAddressComponents(components);

    result = {
      id: String(geocodeResult.placeId || geocodeResult.place_id || `${latitude},${longitude}`),
      label: formattedAddress || '',
      latitude,
      longitude,
      city: locality.city,
      state: locality.state,
      suburb: locality.suburb,
      raw: { ...geocodeResult, addressComponents: components },
    };
  }

  reverseGeocodeCache.set(cacheKey, result);
  if (reverseGeocodeCache.size > MAX_CACHE_SIZE) {
    reverseGeocodeCache.delete(reverseGeocodeCache.keys().next().value);
  }

  return result;
}

export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_LOCATION_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 1) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(entry) {
  if (!entry?.label) return;
  const existing = loadRecentSearches().filter((item) => item.label !== entry.label);
  const next = [entry, ...existing].slice(0, 1);
  localStorage.setItem(RECENT_LOCATION_SEARCHES_KEY, JSON.stringify(next));
}
