import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let loadPromise = null;
let optionsConfigured = false;

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

function configureLoader(apiKey) {
  if (optionsConfigured) return;
  setOptions({
    key: apiKey,
    v: 'weekly',
  });
  optionsConfigured = true;
}

/**
 * Loads the Maps JS API and returns the global `google` namespace.
 * Resolves with `window.google` once the maps and marker libraries are ready.
 */
export function loadGoogleMaps() {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new Error('VITE_GOOGLE_MAPS_API_KEY is not set. Add it to your .env file.')
    );
  }

  if (!loadPromise) {
    configureLoader(apiKey);
    loadPromise = Promise.all([importLibrary('maps'), importLibrary('marker')])
      .then(() => {
        if (!window.google?.maps) {
          throw new Error('Google Maps failed to initialize.');
        }
        return window.google;
      })
      .catch((error) => {
        loadPromise = null;
        throw error;
      });
  }

  return loadPromise;
}

export function logGoogleMapsError(error, context = 'Google Maps') {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error?.message || error);
  }
}
