import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deliveryApi } from '../api/restaurantApi';
import { distanceKm } from '../utils/geo';

const ACTIVE_STATUSES = new Set(['accepted', 'out_for_delivery', 'picked_up', 'in_transit']);
const ACTIVE_MIN_INTERVAL_MS = 8000;
const BROWSE_REFRESH_MS = 45000;
const BROWSE_MOVE_THRESHOLD_KM = 0.5;
const PARTNER_LOCATION_MIN_MS = 30000;

function coordsKey(coords) {
  if (!coords) return '';
  return `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;
}

/** Push GPS to backend during active deliveries (customer live tracking). */
export function useDriverLocationTracker(assignments) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const lastSent = useRef(0);

  const activeOrders = useMemo(
    () => (assignments || []).filter((a) => ACTIVE_STATUSES.has(a.delivery_status)),
    [assignments],
  );

  useEffect(() => {
    if (!activeOrders.length) {
      setSharing(false);
      setError(null);
      return undefined;
    }
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device');
      setSharing(false);
      return undefined;
    }

    const pushLocation = (latitude, longitude) => {
      const now = Date.now();
      if (now - lastSent.current < ACTIVE_MIN_INTERVAL_MS) return;
      lastSent.current = now;
      activeOrders.forEach((order) => {
        deliveryApi
          .updateLocation({ order_id: order.order_id, latitude, longitude })
          .catch(() => {});
      });
    };

    setSharing(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => pushLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setSharing(false);
        setError(err.message || 'Unable to access location');
      },
      { enableHighAccuracy: true, maximumAge: ACTIVE_MIN_INTERVAL_MS, timeout: 20000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setSharing(false);
    };
  }, [activeOrders.map((a) => `${a.order_id}:${a.delivery_status}`).join('|')]);

  return { sharing, activeCount: activeOrders.length, error };
}

/**
 * Device GPS for browsing pending orders: periodic refresh + movement threshold.
 * Returns coords for assignments API and triggers onLocationChange when coords move materially.
 */
export function useDriverBrowseLocation({ enabled = true, onLocationChange } = {}) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [denied, setDenied] = useState(false);
  const lastFilterPoint = useRef(null);
  const lastPartnerLocationSent = useRef(0);
  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const persistPartnerLocation = useCallback((latitude, longitude) => {
    const now = Date.now();
    if (now - lastPartnerLocationSent.current < PARTNER_LOCATION_MIN_MS) return;
    lastPartnerLocationSent.current = now;
    deliveryApi.updatePartnerLocation({ latitude, longitude }).catch(() => {});
  }, []);

  const applyCoords = useCallback((latitude, longitude, { persist = false } = {}) => {
    const next = { latitude, longitude };
    setCoords(next);
    setError(null);
    setDenied(false);

    if (persist) {
      persistPartnerLocation(latitude, longitude);
    }

    const prev = lastFilterPoint.current;
    const movedKm = prev
      ? distanceKm(prev.latitude, prev.longitude, latitude, longitude)
      : Infinity;
    if (!prev || movedKm >= BROWSE_MOVE_THRESHOLD_KM) {
      lastFilterPoint.current = next;
      if (!persist) {
        persistPartnerLocation(latitude, longitude);
      }
      onLocationChangeRef.current?.(next);
    }
  }, [persistPartnerLocation]);

  useEffect(() => {
    if (!enabled) {
      setCoords(null);
      setError(null);
      setDenied(false);
      return undefined;
    }
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device');
      setDenied(true);
      return undefined;
    }

    let watchId = null;
    let intervalId = null;

    const readOnce = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude, { persist: true }),
        (err) => {
          setDenied(err.code === 1);
          setError(err.message || 'Unable to access location');
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 },
      );
    };

    readOnce();
    intervalId = setInterval(readOnce, BROWSE_REFRESH_MS);

    watchId = navigator.geolocation.watchPosition(
      (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setDenied(err.code === 1);
        setError(err.message || 'Unable to access location');
      },
      { enableHighAccuracy: true, maximumAge: BROWSE_REFRESH_MS, timeout: 20000 },
    );

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, applyCoords]);

  return { coords, error, denied, coordsKey: coordsKey(coords) };
}
