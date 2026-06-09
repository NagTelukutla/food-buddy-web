import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RoadRoute from './RoadRoute';
import { getDeliveryRouteLegs, hasMapPoint } from '../../utils/mapRouting';

function MapRecenter({ center, zoom, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !center) return;
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map, enabled]);
  return null;
}

function MapFitRoute({ points, padding = [48, 48], enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    const valid = (points || []).filter(hasMapPoint);
    if (valid.length < 2) return;
    const bounds = L.latLngBounds(valid.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding, maxZoom: 15, animate: true });
  }, [points, map, padding, enabled]);
  return null;
}

const MARKERS = {
  restaurant: { color: '#16a34a', fill: '#22c55e', label: 'Restaurant' },
  destination: { color: '#dc2626', fill: '#ef4444', label: 'Your location' },
  driver: { color: '#2563eb', fill: '#3b82f6', label: 'Delivery partner' },
};

const ROUTE_STYLES = {
  primary: {
    color: '#2563eb',
    weight: 6,
    opacity: 0.92,
    lineCap: 'round',
    lineJoin: 'round',
  },
  secondary: {
    color: '#94a3b8',
    weight: 4,
    opacity: 0.5,
    dashArray: '10 8',
    lineCap: 'round',
    lineJoin: 'round',
  },
};

function MapMarker({ point, type }) {
  if (!hasMapPoint(point)) return null;
  const style = MARKERS[type];
  return (
    <CircleMarker
      center={[point.latitude, point.longitude]}
      radius={type === 'driver' ? 11 : 10}
      pathOptions={{
        color: style.color,
        fillColor: style.fill,
        fillOpacity: 0.95,
        weight: type === 'driver' ? 3 : 2,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -10]} className="!text-xs !font-medium">
        {point.label || style.label}
      </Tooltip>
    </CircleMarker>
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
}) {
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
    ? 'overflow-hidden rounded-lg border-2 border-white shadow-sm ring-1 ring-stone-200/80'
    : 'overflow-hidden rounded-xl border border-stone-200';

  return (
    <div className={frameClass}>
      {legs.primary?.label && (
        <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
          <span className="inline-block h-1 w-6 rounded-full bg-blue-600" />
          <span>{legs.primary.label}</span>
          {legs.secondary?.label && (
            <>
              <span className="text-stone-300">·</span>
              <span className="inline-block h-1 w-6 rounded-full border border-dashed border-stone-400" />
              <span className="text-stone-500">{legs.secondary.label}</span>
            </>
          )}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={14}
        style={{ height, width: '100%' }}
        scrollWheelZoom
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter
          center={center}
          zoom={followDriver && driver ? 15 : 14}
          enabled={followDriver && !!driver}
        />
        <MapFitRoute points={fitPoints} enabled={!followDriver || !driver} />
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
          />
        )}
        <MapMarker point={restaurant} type="restaurant" />
        <MapMarker point={destination} type="destination" />
        <MapMarker point={driver} type="driver" />
      </MapContainer>
    </div>
  );
}
