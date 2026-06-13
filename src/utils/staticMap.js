import { getGoogleMapsApiKey } from './googleMapsLoader';
import { isValidCoord } from './geo';

/** Build a Google Static Maps image URL for a single marker preview. */
export function buildStaticMapUrl(lat, lng, { width = 640, height = 240, zoom = 15 } = {}) {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || !isValidCoord(lat, lng)) return null;

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: '2',
    maptype: 'roadmap',
    markers: `color:red|${lat},${lng}`,
    key: apiKey,
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}
