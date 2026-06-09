import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { fetchDrivingRoute, hasMapPoint } from '../../utils/mapRouting';

export default function RoadRoute({ from, to, pathOptions, enabled = true }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!enabled || !hasMapPoint(from) || !hasMapPoint(to)) {
      setPositions([]);
      return undefined;
    }

    let cancelled = false;
    fetchDrivingRoute(from, to).then((points) => {
      if (!cancelled) setPositions(points);
    });

    return () => {
      cancelled = true;
    };
  }, [from?.latitude, from?.longitude, to?.latitude, to?.longitude, enabled]);

  if (positions.length < 2) return null;

  return <Polyline positions={positions} pathOptions={pathOptions} />;
}
