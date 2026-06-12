import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NavigationManeuverIcon from './NavigationManeuverIcon';
import { createPinIcon, MARKER_LABELS } from './mapPinIcons';
import { useRoadRoute } from './RoadRoute';
import useDriverVoiceNavigation from '../../hooks/useDriverVoiceNavigation';
import { loadGoogleMaps, logGoogleMapsError } from '../../utils/googleMapsLoader';
import {
  formatRouteDistance,
  formatRouteDuration,
  getNavigationState,
  lerpLatLng,
} from '../../utils/mapNavigation';
import { getDeliveryRouteLegs, hasMapPoint } from '../../utils/mapRouting';

const ROUTE_STYLES = {
  primary: {
    strokeColor: '#2563eb',
    strokeWeight: 7,
    strokeOpacity: 0.95,
  },
  secondary: {
    strokeColor: '#94a3b8',
    strokeWeight: 4,
    strokeOpacity: 0.45,
    dashed: true,
  },
};

function toLatLng(point) {
  return { lat: point.latitude, lng: point.longitude };
}

function toPath(positions) {
  return positions.map(([lat, lng]) => ({ lat, lng }));
}

function createRoutePolyline(google, map, positions, style) {
  const options = {
    map,
    path: toPath(positions),
    strokeColor: style.strokeColor,
    strokeWeight: style.strokeWeight,
    strokeOpacity: style.strokeOpacity,
    geodesic: true,
  };

  if (style.dashed) {
    options.icons = [
      {
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 4,
        },
        offset: '0',
        repeat: '22px',
      },
    ];
    options.strokeOpacity = 0;
  }

  return new google.maps.Polyline(options);
}

function upsertMarker(google, map, markers, key, point, type, label) {
  if (!hasMapPoint(point)) {
    if (markers[key]) {
      markers[key].setMap(null);
      delete markers[key];
    }
    return;
  }

  const position = toLatLng(point);
  const title = label || point.label || MARKER_LABELS[type];

  if (!markers[key]) {
    markers[key] = new google.maps.Marker({
      map,
      position,
      icon: createPinIcon(google, type),
      title,
      zIndex: type === 'driver' ? 1000 : 1,
    });
    return;
  }

  markers[key].setPosition(position);
  markers[key].setTitle(title);
}

function MapRecenterButton({ onRecenter, visible }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      className="delivery-map-control delivery-map-control--recenter"
      onClick={onRecenter}
      aria-label="Re-center map"
      title="Re-center map"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    </button>
  );
}

function OverlayCloseButton({ onClick, label, light = true, corner = false }) {
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={`delivery-map-overlay__close ${light ? 'delivery-map-overlay__close--light' : ''} ${corner ? 'delivery-map-overlay__close--corner' : ''}`}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function DeliveryMapOverlay({
  statusLabel,
  etaLabel,
  remainingTimeLabel,
  distanceLabel,
  arrivalTimeLabel,
  navigationState,
  navigationMode,
  voiceEnabled,
  onVoiceToggle,
}) {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const timePillLabel = remainingTimeLabel || etaLabel?.split(' •')[0] || distanceLabel || '—';
  const instruction = navigationState?.instruction;
  const maneuverKind = navigationState?.maneuverKind || 'straight';

  return (
    <div className="delivery-map-overlay">
      {navigationMode && navigationState && (
        navCollapsed ? (
          <button
            type="button"
            className="delivery-map-overlay__nav-pill"
            onClick={() => setNavCollapsed(false)}
            aria-label={`Expand directions: ${instruction}`}
            title={instruction}
          >
            <NavigationManeuverIcon kind={maneuverKind} compact />
          </button>
        ) : (
          <div className="delivery-map-overlay__nav-banner">
            <div className="delivery-map-overlay__nav-banner-main">
              <NavigationManeuverIcon kind={maneuverKind} />
              <div className="min-w-0 flex-1">
                <p className="delivery-map-overlay__nav-distance">{navigationState.distanceText}</p>
                <p className="delivery-map-overlay__nav-text">{instruction}</p>
                {navigationState.followingInstruction && (
                  <p className="delivery-map-overlay__nav-next">
                    Then · {navigationState.followingInstruction}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={`delivery-map-voice-toggle ${voiceEnabled ? 'delivery-map-voice-toggle--on' : ''}`}
                onClick={onVoiceToggle}
                aria-label={voiceEnabled ? 'Turn off voice guidance' : 'Turn on voice guidance'}
                title={voiceEnabled ? 'Voice on' : 'Voice off'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {voiceEnabled ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-7-4h3l4 4V6l4 4h3" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 4v16a1 1 0 01-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  )}
                </svg>
              </button>
            </div>
            <OverlayCloseButton
              onClick={() => setNavCollapsed(true)}
              label="Minimize directions"
              light={false}
              corner
            />
          </div>
        )
      )}

      {navigationState?.offRoute && (
        <div className="delivery-map-overlay__reroute">Recalculating route…</div>
      )}

      {headerCollapsed ? (
        <button
          type="button"
          className="delivery-map-overlay__header delivery-map-overlay__header--pill"
          onClick={() => setHeaderCollapsed(false)}
          aria-label={`Expand delivery status, ${timePillLabel} remaining`}
          title="Expand status"
        >
          <span className="delivery-map-overlay__pill-time">{timePillLabel}</span>
        </button>
      ) : (
        <div className="delivery-map-overlay__header">
          <div className="min-w-0 flex-1 pr-7">
            <p className="delivery-map-overlay__status">{statusLabel}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {etaLabel && (
                <span className="delivery-map-overlay__eta">{etaLabel}</span>
              )}
              {distanceLabel && (
                <span className="delivery-map-overlay__distance">{distanceLabel}</span>
              )}
              {arrivalTimeLabel && (
                <span className="delivery-map-overlay__arrival">Arrive {arrivalTimeLabel}</span>
              )}
            </div>
          </div>
          <OverlayCloseButton
            onClick={() => setHeaderCollapsed(true)}
            label="Minimize status"
            corner
          />
        </div>
      )}
    </div>
  );
}

export default function LiveDeliveryMap({
  restaurant,
  destination,
  driver,
  deliveryStatus = null,
  height = '340px',
  followDriver = true,
  framed = false,
  navigationMode = false,
  deliveryAddress = null,
  statusLabel = 'Order is on the way',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef([]);
  const programmaticMoveRef = useRef(false);
  const fittedRef = useRef(false);
  const driverAnimFrameRef = useRef(null);
  const driverPositionRef = useRef(null);

  const [userMovedMap, setUserMovedMap] = useState(false);
  const [recenterToken, setRecenterToken] = useState(0);
  const [fitToken, setFitToken] = useState(0);
  const [routeRefreshKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [primaryRoute, setPrimaryRoute] = useState({
    positions: [],
    distance: 0,
    duration: 0,
    steps: [],
  });

  const legs = useMemo(
    () => getDeliveryRouteLegs({ restaurant, destination, driver, deliveryStatus }),
    [restaurant, destination, driver, deliveryStatus],
  );

  const center = useMemo(() => {
    if (followDriver && driver) return toLatLng(driver);
    if (driver && legs.primary?.to) return toLatLng(legs.primary.to);
    if (destination) return toLatLng(destination);
    if (restaurant) return toLatLng(restaurant);
    return { lat: restaurant?.latitude || destination?.latitude || 0, lng: restaurant?.longitude || destination?.longitude || 0 };
  }, [restaurant, destination, driver, followDriver, legs.primary]);

  const fitPoints = useMemo(() => {
    const pts = [restaurant, destination, driver].filter(hasMapPoint);
    if (legs.primary) pts.push(legs.primary.from, legs.primary.to);
    if (legs.secondary) pts.push(legs.secondary.to);
    return pts;
  }, [restaurant, destination, driver, legs]);

  const secondaryRoute = useRoadRoute({
    from: legs.secondary?.from,
    to: legs.secondary?.to,
    enabled: !!legs.secondary,
  });

  const handlePrimaryRouteUpdate = useCallback((route) => {
    setPrimaryRoute(route);
  }, []);

  useRoadRoute({
    from: legs.primary?.from,
    to: legs.primary?.to,
    enabled: !!legs.primary,
    includeSteps: navigationMode,
    onRouteUpdate: handlePrimaryRouteUpdate,
    freezeOrigin: !!driver,
    checkDeviation: !!driver,
    deviationPoint: driver,
    refreshKey: routeRefreshKey,
  });

  const navigationState = useMemo(
    () => getNavigationState(driver, primaryRoute.steps, primaryRoute.positions),
    [driver, primaryRoute.steps, primaryRoute.positions],
  );

  const remainingTimeLabel = navigationState
    ? formatRouteDuration(navigationState.remainingDuration)
    : primaryRoute.duration
      ? formatRouteDuration(primaryRoute.duration)
      : null;

  const etaLabel = remainingTimeLabel
    ? `${remainingTimeLabel} • On time`
    : null;

  const distanceLabel = navigationState
    ? formatRouteDistance(navigationState.remainingDistance)
    : primaryRoute.distance
      ? formatRouteDistance(primaryRoute.distance)
      : null;

  const arrivalTimeLabel = navigationState?.arrivalTime || null;

  useDriverVoiceNavigation(navigationState, navigationMode && voiceEnabled);

  const handleRecenter = useCallback(() => {
    setUserMovedMap(false);
    setRecenterToken((token) => token + 1);
    if (!followDriver || !driver) {
      setFitToken((token) => token + 1);
    }
  }, [followDriver, driver]);

  const followEnabled = followDriver && !!driver && !userMovedMap;
  const initialFitEnabled = !followDriver || !driver;
  const fitTokenKey = `${fitToken}-${legs.primary?.label || 'route'}`;

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let cancelled = false;
    setMapLoadFailed(false);

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;

        googleRef.current = google;
        const map = new google.maps.Map(containerRef.current, {
          center,
          zoom: 15,
          scrollwheel: true,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });

        map.addListener('dragstart', () => {
          if (!programmaticMoveRef.current) setUserMovedMap(true);
        });

        mapRef.current = map;
        setMapReady(true);
      })
      .catch((error) => {
        logGoogleMapsError(error, 'LiveDeliveryMap');
        if (!cancelled) setMapLoadFailed(true);
      });

    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
      markersRef.current = {};
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
      mapRef.current = null;
      googleRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    const routes = [
      { positions: secondaryRoute.positions, style: ROUTE_STYLES.secondary },
      { positions: primaryRoute.positions, style: ROUTE_STYLES.primary },
    ];

    routes.forEach(({ positions, style }) => {
      if (positions.length < 2) return;
      polylinesRef.current.push(
        createRoutePolyline(googleRef.current, mapRef.current, positions, style)
      );
    });
  }, [mapReady, primaryRoute.positions, secondaryRoute.positions]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const destinationLabel = deliveryAddress || MARKER_LABELS.destination;
    upsertMarker(googleRef.current, mapRef.current, markersRef.current, 'restaurant', restaurant, 'restaurant');
    upsertMarker(
      googleRef.current,
      mapRef.current,
      markersRef.current,
      'destination',
      destination,
      'destination',
      destinationLabel
    );
  }, [mapReady, restaurant, destination, deliveryAddress]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return undefined;

    if (!hasMapPoint(driver)) {
      if (driverAnimFrameRef.current) cancelAnimationFrame(driverAnimFrameRef.current);
      upsertMarker(googleRef.current, mapRef.current, markersRef.current, 'driver', null, 'driver');
      driverPositionRef.current = null;
      return undefined;
    }

    const next = [driver.latitude, driver.longitude];

    if (!driverPositionRef.current) {
      driverPositionRef.current = next;
      upsertMarker(
        googleRef.current,
        mapRef.current,
        markersRef.current,
        'driver',
        { latitude: next[0], longitude: next[1], label: driver.label },
        'driver'
      );
      return undefined;
    }

    const start = driverPositionRef.current;
    const startTime = performance.now();
    const duration = 900;

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) ** 3;
      const position = lerpLatLng(start, next, eased);

      upsertMarker(
        googleRef.current,
        mapRef.current,
        markersRef.current,
        'driver',
        { latitude: position[0], longitude: position[1], label: driver.label },
        'driver'
      );

      if (t < 1) {
        driverAnimFrameRef.current = requestAnimationFrame(tick);
      } else {
        driverPositionRef.current = next;
      }
    };

    driverAnimFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (driverAnimFrameRef.current) cancelAnimationFrame(driverAnimFrameRef.current);
    };
  }, [mapReady, driver?.latitude, driver?.longitude, driver?.label]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !followEnabled || !center) return;

    programmaticMoveRef.current = true;
    mapRef.current.panTo(center);
    window.setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 900);
  }, [mapReady, center, followEnabled]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !recenterToken) return;
    setUserMovedMap(false);
  }, [mapReady, recenterToken]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !center || !(followDriver && driver && recenterToken)) return;

    programmaticMoveRef.current = true;
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(15);
    window.setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 300);
  }, [mapReady, center, followDriver, driver, recenterToken]);

  useEffect(() => {
    fittedRef.current = false;
  }, [fitTokenKey]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current || !initialFitEnabled || fittedRef.current) {
      return;
    }

    const valid = fitPoints.filter(hasMapPoint);
    if (valid.length < 2) return;

    const bounds = new googleRef.current.maps.LatLngBounds();
    valid.forEach((point) => bounds.extend(toLatLng(point)));

    programmaticMoveRef.current = true;
    mapRef.current.fitBounds(bounds, { top: 56, bottom: 56, left: 56, right: 56 });
    fittedRef.current = true;
    window.setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 300);
  }, [mapReady, fitPoints, initialFitEnabled, fitTokenKey]);

  if (!restaurant) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-500"
        style={{ height }}
      >
        Map unavailable
      </div>
    );
  }

  if (mapLoadFailed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-stone-100 px-4 text-center text-sm text-stone-500"
        style={{ height }}
      >
        Map unavailable — check VITE_GOOGLE_MAPS_API_KEY in .env
      </div>
    );
  }

  const frameClass = framed
    ? 'delivery-map-frame delivery-map-frame--framed'
    : 'delivery-map-frame';

  return (
    <div className={frameClass} style={{ height }}>
      <DeliveryMapOverlay
        statusLabel={statusLabel}
        etaLabel={etaLabel}
        remainingTimeLabel={remainingTimeLabel}
        distanceLabel={distanceLabel}
        arrivalTimeLabel={arrivalTimeLabel}
        navigationState={navigationState}
        navigationMode={navigationMode}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={() => setVoiceEnabled((on) => !on)}
      />

      <div ref={containerRef} className="delivery-map-canvas z-0" />

      <MapRecenterButton onRecenter={handleRecenter} visible={userMovedMap} />
    </div>
  );
}
