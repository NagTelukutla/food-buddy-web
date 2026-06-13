/**
 * Native maps deep-linking — cost-optimized navigation.
 *
 * Instead of embedding Google Maps / Directions API inside the app, we hand off
 * navigation to the device's native Google Maps application. This avoids
 * Directions API, Navigation SDK and embedded map render costs entirely.
 */

import { isValidCoord } from './geo';

function getPlatform() {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  return 'web';
}

/** True when running inside a browser tab (http/https), including mobile browsers. */
function isWebApplication() {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}

/** Universal Google Maps directions URL — works in browser and opens the native app on mobile when installed. */
function buildWebDirectionsUrl(resolved) {
  const params = new URLSearchParams({
    api: '1',
    destination: resolved.value,
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Resolve a destination string: prefer coordinates, fall back to an address. */
function resolveDestination({ lat, lng, address } = {}) {
  if (isValidCoord(lat, lng)) {
    return { value: `${lat},${lng}`, isCoords: true };
  }
  if (address && address.trim()) {
    return { value: address.trim(), isCoords: false };
  }
  return null;
}

/**
 * Build a navigation URL to the given destination using the native maps app.
 * Returns null when there is nothing usable to navigate to.
 */
export function buildNavigationUrl(destination, platform = getPlatform()) {
  const resolved = resolveDestination(destination);
  if (!resolved) return null;

  // Web apps (browser tabs) must use https URLs — the google.navigation: scheme
  // is an Android app intent and throws "no registered handler" in browsers.
  // The https link still opens Google Maps on mobile when the app is installed.
  if (isWebApplication()) {
    return buildWebDirectionsUrl(resolved);
  }

  // Native Android shell (non-http context): direct turn-by-turn intent.
  if (platform === 'android' && resolved.isCoords) {
    return `google.navigation:q=${resolved.value}`;
  }

  return buildWebDirectionsUrl(resolved);
}

/** Whether we have enough info (coords or address) to start navigation. */
export function canNavigateTo(destination) {
  return buildNavigationUrl(destination) !== null;
}

/** Open the web Google Maps directions page in a new tab (browser fallback). */
function openWebMaps(destination) {
  const resolved = resolveDestination(destination);
  if (!resolved) return false;
  const webUrl = buildWebDirectionsUrl(resolved);
  window.open(webUrl, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Open navigation to the destination.
 *
 * - Web / desktop / iOS: opens the Google Maps directions page in a new tab.
 * - Android: launches the native Google Maps app (turn-by-turn), and if the app
 *   isn't available (e.g. running as a plain web app), gracefully falls back to
 *   the web Google Maps page so the user is never stranded.
 */
export function openNativeNavigation(destination) {
  const platform = getPlatform();
  const url = buildNavigationUrl(destination, platform);
  if (!url) return false;

  // Universal https links (web / desktop / iOS) — open Google Maps in a new tab.
  if (!url.startsWith('google.navigation:')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  // Android app intent — attempt to launch the native app, with a web fallback.
  let usedFallback = false;
  const fallback = () => {
    if (usedFallback) return;
    usedFallback = true;
    openWebMaps(destination);
  };

  const fallbackTimer = window.setTimeout(fallback, 1200);
  const onVisibilityChange = () => {
    // If the page becomes hidden, the native app opened — cancel the fallback.
    if (document.hidden) {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  try {
    window.location.href = url;
  } catch {
    window.clearTimeout(fallbackTimer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    fallback();
  }
  return true;
}
