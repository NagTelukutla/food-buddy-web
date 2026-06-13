import { useMemo } from 'react';
import { canNavigateTo, openNativeNavigation } from '../../utils/nativeMaps';
import { buildStaticMapUrl } from '../../utils/staticMap';
import { isValidCoord } from '../../utils/geo';

function ExpandIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
  );
}

/**
 * Lightweight static map preview with a full-screen control that opens native
 * Google Maps navigation (no embedded interactive map / Directions API cost).
 */
export default function StaticMapPreview({
  latitude,
  longitude,
  address,
  label = 'Open in Google Maps',
  className = '',
  height = '9rem',
}) {
  const destination = useMemo(
    () => ({ lat: latitude, lng: longitude, address }),
    [latitude, longitude, address],
  );

  const mapUrl = useMemo(
    () => (isValidCoord(latitude, longitude) ? buildStaticMapUrl(latitude, longitude) : null),
    [latitude, longitude],
  );

  const canOpen = canNavigateTo(destination);

  const handleOpenMaps = () => {
    openNativeNavigation(destination);
  };

  if (!mapUrl && !canOpen) return null;

  return (
    <div className={`relative overflow-hidden rounded-xl ring-1 ring-black/5 ${className}`} style={{ height }}>
      {mapUrl ? (
        <img
          src={mapUrl}
          alt={address || 'Delivery location map'}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-stone-100 text-xs text-stone-500">
          Map preview unavailable
        </div>
      )}

      {canOpen && (
        <button
          type="button"
          onClick={handleOpenMaps}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-stone-700 shadow-md ring-1 ring-black/5 transition hover:bg-white hover:text-brand-700"
          aria-label={label}
          title={label}
        >
          <ExpandIcon />
        </button>
      )}
    </div>
  );
}
