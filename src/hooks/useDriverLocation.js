import { useEffect, useMemo, useRef, useState } from 'react';
import { deliveryApi } from '../api/restaurantApi';

const ACTIVE_STATUSES = new Set(['accepted', 'out_for_delivery', 'picked_up', 'in_transit']);
const MIN_INTERVAL_MS = 8000;

export function useDriverLocationTracker(assignments) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const lastSent = useRef(0);

  const activeOrders = useMemo(
    () => (assignments || []).filter((a) => ACTIVE_STATUSES.has(a.delivery_status)),
    [assignments]
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
      if (now - lastSent.current < MIN_INTERVAL_MS) return;
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
      { enableHighAccuracy: true, maximumAge: MIN_INTERVAL_MS, timeout: 20000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setSharing(false);
    };
  }, [activeOrders.map((a) => `${a.order_id}:${a.delivery_status}`).join('|')]);

  return { sharing, activeCount: activeOrders.length, error };
}
