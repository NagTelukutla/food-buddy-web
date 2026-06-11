import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, logGoogleMapsError } from '../../utils/googleMapsLoader';

function LocationMiniMapInner({ latitude, longitude, className = '' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) return undefined;

    let cancelled = false;
    setLoadFailed(false);

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;

        const center = { lat: latitude, lng: longitude };

        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(containerRef.current, {
            center,
            zoom: 15,
            disableDefaultUI: true,
            gestureHandling: 'none',
            clickableIcons: false,
            keyboardShortcuts: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
          });

          markerRef.current = new google.maps.Marker({
            position: center,
            map: mapRef.current,
          });
        } else {
          mapRef.current.setCenter(center);
          markerRef.current?.setPosition(center);
        }
      })
      .catch((error) => {
        logGoogleMapsError(error, 'LocationMiniMap');
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  if (latitude == null || longitude == null) return null;

  if (loadFailed) {
    return (
      <div
        className={`location-mini-map flex items-center justify-center rounded-2xl bg-stone-100 text-xs text-stone-500 ${className}`}
      >
        Map preview unavailable
      </div>
    );
  }

  return (
    <div className={`location-mini-map overflow-hidden rounded-2xl ring-1 ring-black/5 ${className}`}>
      <div ref={containerRef} className="location-mini-map-canvas h-full w-full" />
    </div>
  );
}

const LazyLocationMiniMapInner = lazy(async () => ({ default: LocationMiniMapInner }));

export default function LocationMiniMap(props) {
  return (
    <Suspense
      fallback={
        <div className={`location-mini-map animate-pulse rounded-2xl bg-stone-100 ${props.className || ''}`} />
      }
    >
      <LazyLocationMiniMapInner {...props} />
    </Suspense>
  );
}
