import { useEffect, useRef, useState } from 'react';
import { fetchDrivingRouteWithDetails, hasMapPoint } from '../../utils/mapRouting';
import { isOffRoute } from '../../utils/mapNavigation';

export function useRoadRoute({
  from,
  to,
  enabled = true,
  includeSteps = false,
  onRouteUpdate,
  freezeOrigin = false,
  checkDeviation = false,
  deviationPoint = null,
  refreshKey = 0,
}) {
  const [route, setRoute] = useState({ positions: [], distance: 0, duration: 0, steps: [] });
  const routeRef = useRef(route);
  const onRouteUpdateRef = useRef(onRouteUpdate);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    onRouteUpdateRef.current = onRouteUpdate;
  }, [onRouteUpdate]);

  const publishRoute = (result) => {
    setRoute(result);
    onRouteUpdateRef.current?.(result);
  };

  const loadRoute = (origin) => {
    if (!hasMapPoint(origin) || !hasMapPoint(to)) return;
    fetchDrivingRouteWithDetails(origin, to, { steps: includeSteps }).then(publishRoute);
  };

  const originLatch = freezeOrigin
    ? `refresh:${refreshKey}`
    : `${from?.latitude},${from?.longitude}`;

  useEffect(() => {
    if (!enabled || !hasMapPoint(from) || !hasMapPoint(to)) {
      publishRoute({ positions: [], distance: 0, duration: 0, steps: [] });
      return;
    }

    loadRoute(from);
  }, [enabled, includeSteps, to?.latitude, to?.longitude, originLatch]);

  useEffect(() => {
    if (!checkDeviation || !hasMapPoint(deviationPoint) || !hasMapPoint(to)) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (routeRef.current.positions.length < 2) return;
      if (!isOffRoute(deviationPoint, routeRef.current.positions)) return;
      loadRoute(deviationPoint);
    }, 8000);

    return () => clearInterval(interval);
  }, [
    checkDeviation,
    deviationPoint?.latitude,
    deviationPoint?.longitude,
    to?.latitude,
    to?.longitude,
    includeSteps,
  ]);

  return route;
}

export default useRoadRoute;
