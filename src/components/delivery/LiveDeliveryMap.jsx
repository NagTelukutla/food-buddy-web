import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Tooltip, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RoadRoute from './RoadRoute';
import NavigationManeuverIcon from './NavigationManeuverIcon';
import { destinationPinIcon, driverPinIcon, restaurantPinIcon } from './mapPinIcons';
import useDriverVoiceNavigation from '../../hooks/useDriverVoiceNavigation';
import {
  formatRouteDistance,
  formatRouteDuration,
  getNavigationState,
  lerpLatLng,
} from '../../utils/mapNavigation';
import { getDeliveryRouteLegs, hasMapPoint } from '../../utils/mapRouting';

const ROUTE_STYLES = {
  primary: {
    color: '#2563eb',
    weight: 7,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round',
  },
  secondary: {
    color: '#94a3b8',
    weight: 4,
    opacity: 0.45,
    dashArray: '12 10',
    lineCap: 'round',
    lineJoin: 'round',
  },
  traveled: {
    color: '#64748b',
    weight: 8,
    opacity: 0.35,
    lineCap: 'round',
    lineJoin: 'round',
  },
};

function MapInteractionController({ onUserMovedChange, recenterToken }) {
  const map = useMap();
  const userMovedRef = useRef(false);

  useEffect(() => {
    const markMoved = () => {
      if (userMovedRef.current) return;
      userMovedRef.current = true;
      onUserMovedChange(true);
    };

    map.on('dragstart', markMoved);
    map.on('zoomstart', markMoved);
    map.on('touchstart', markMoved);

    return () => {
      map.off('dragstart', markMoved);
      map.off('zoomstart', markMoved);
      map.off('touchstart', markMoved);
    };
  }, [map, onUserMovedChange]);

  useEffect(() => {
    if (!recenterToken) return;
    userMovedRef.current = false;
    onUserMovedChange(false);
  }, [recenterToken, onUserMovedChange]);

  return null;
}

function MapFollowDriver({ center, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !center) return;
    map.panTo(center, { animate: true, duration: 0.8, easeLinearity: 0.25 });
  }, [center, enabled, map]);

  return null;
}

function MapRecenterView({ center, zoom = 15, token }) {
  const map = useMap();

  useEffect(() => {
    if (!token || !center) return;
    map.setView(center, zoom, { animate: true });
  }, [center, map, token, zoom]);

  return null;
}
function MapInitialFit({ points, enabled, fitToken }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    fittedRef.current = false;
  }, [fitToken]);

  useEffect(() => {
    if (!enabled || fittedRef.current) return;
    const valid = (points || []).filter(hasMapPoint);
    if (valid.length < 2) return;
    const bounds = L.latLngBounds(valid.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16, animate: true });
    fittedRef.current = true;
  }, [points, map, enabled, fitToken]);

  return null;
}

const MARKER_META = {
  restaurant: { icon: restaurantPinIcon, label: 'Restaurant' },
  destination: { icon: destinationPinIcon, label: 'Your location' },
  driver: { icon: driverPinIcon, label: 'Delivery partner' },
};

function MapMarker({ point, type, label }) {
  if (!hasMapPoint(point)) return null;
  const meta = MARKER_META[type];

  return (
    <Marker
      position={[point.latitude, point.longitude]}
      icon={meta.icon}
      zIndexOffset={type === 'driver' ? 1000 : 0}
    >
      <Tooltip permanent direction="top" offset={[0, -4]} className="!text-xs !font-medium">
        {label || point.label || meta.label}
      </Tooltip>
    </Marker>
  );
}

function AnimatedDriverMarker({ point }) {
  const [position, setPosition] = useState(null);
  const frameRef = useRef(null);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!hasMapPoint(point)) {
      setPosition(null);
      return undefined;
    }

    const next = [point.latitude, point.longitude];
    if (!prevRef.current) {
      prevRef.current = next;
      setPosition(next);
      return undefined;
    }

    const start = prevRef.current;
    const startTime = performance.now();
    const duration = 900;

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) ** 3;
      setPosition(lerpLatLng(start, next, eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = next;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [point?.latitude, point?.longitude]);

  if (!position) return null;

  return (
    <MapMarker
      point={{ latitude: position[0], longitude: position[1], label: point?.label }}
      type="driver"
    />
  );
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
  const [userMovedMap, setUserMovedMap] = useState(false);
  const [recenterToken, setRecenterToken] = useState(0);
  const [fitToken, setFitToken] = useState(0);
  const [routeRefreshKey, setRouteRefreshKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
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
    if (followDriver && driver) return [driver.latitude, driver.longitude];
    if (driver && legs.primary?.to) return [legs.primary.to.latitude, legs.primary.to.longitude];
    if (destination) return [destination.latitude, destination.longitude];
    if (restaurant) return [restaurant.latitude, restaurant.longitude];
    return [17.435886, 78.3618];
  }, [restaurant, destination, driver, followDriver, legs.primary]);

  const fitPoints = useMemo(() => {
    const pts = [restaurant, destination, driver].filter(hasMapPoint);
    if (legs.primary) pts.push(legs.primary.from, legs.primary.to);
    if (legs.secondary) pts.push(legs.secondary.to);
    return pts;
  }, [restaurant, destination, driver, legs]);

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

  const handlePrimaryRouteUpdate = useCallback((route) => {
    setPrimaryRoute(route);
  }, []);

  const handleRecenter = useCallback(() => {
    setUserMovedMap(false);
    setRecenterToken((token) => token + 1);
    if (!followDriver || !driver) {
      setFitToken((token) => token + 1);
    }
  }, [followDriver, driver]);

  const followEnabled = followDriver && !!driver && !userMovedMap;
  const initialFitEnabled = !followDriver || !driver;

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

  const frameClass = framed
    ? 'delivery-map-frame delivery-map-frame--framed'
    : 'delivery-map-frame';

  const destinationLabel = deliveryAddress ? 'Delivery' : MARKER_META.destination.label;

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

      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        className="delivery-map-canvas z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInteractionController
          onUserMovedChange={setUserMovedMap}
          recenterToken={recenterToken}
        />
        <MapFollowDriver center={center} enabled={followEnabled} />
        <MapRecenterView
          center={center}
          zoom={15}
          token={followDriver && driver ? recenterToken : 0}
        />
        <MapInitialFit
          points={fitPoints}
          enabled={initialFitEnabled}
          fitToken={`${fitToken}-${legs.primary?.label || 'route'}`}
        />

        {legs.secondary && (
          <RoadRoute
            from={legs.secondary.from}
            to={legs.secondary.to}
            pathOptions={ROUTE_STYLES.secondary}
          />
        )}

        {legs.primary && (
          <RoadRoute
            from={legs.primary.from}
            to={legs.primary.to}
            pathOptions={ROUTE_STYLES.primary}
            includeSteps={navigationMode}
            onRouteUpdate={handlePrimaryRouteUpdate}
            freezeOrigin={!!driver}
            checkDeviation={!!driver}
            deviationPoint={driver}
            refreshKey={routeRefreshKey}
          />
        )}

        {hasMapPoint(restaurant) && <MapMarker point={restaurant} type="restaurant" />}

        {hasMapPoint(destination) && (
          <MapMarker point={destination} type="destination" label={destinationLabel} />
        )}

        {hasMapPoint(driver) && <AnimatedDriverMarker point={driver} />}
      </MapContainer>

      <MapRecenterButton onRecenter={handleRecenter} visible={userMovedMap} />
    </div>
  );
}
