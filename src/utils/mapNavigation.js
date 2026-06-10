import { hasMapPoint } from './mapRouting';

const EARTH_RADIUS_M = 6371000;
export const DEVIATION_THRESHOLD_M = 75;
const MANEUVER_PASSED_M = 35;

export function haversineDistance(a, b) {
  if (!hasMapPoint(a) || !hasMapPoint(b)) return Infinity;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

export function formatRouteDistance(meters) {
  if (!Number.isFinite(meters)) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export function formatApproachDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) {
    if (meters < 100) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
    return `${Math.round(meters / 50) * 50 || Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export function formatRouteDuration(seconds) {
  if (!Number.isFinite(seconds)) return '—';
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min${mins !== 1 ? 's' : ''}`;
}

export function formatArrivalTime(remainingSeconds) {
  if (!Number.isFinite(remainingSeconds)) return '—';
  return new Date(Date.now() + remainingSeconds * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ordinal(n) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}

function isStraightManeuver(step) {
  if (!step) return false;
  const { type, modifier } = step;
  if (type === 'arrive' || type === 'roundabout' || type === 'rotary') return false;
  if (modifier === 'uturn') return false;
  if (type === 'turn' || type === 'fork' || type === 'end of road') {
    return modifier === 'straight' || !modifier;
  }
  return ['continue', 'new name', 'depart', 'merge', 'on ramp'].includes(type);
}

export function getManeuverKind(step) {
  if (!step) return 'straight';
  const { type, modifier, exit } = step;

  if (type === 'arrive') {
    if (modifier === 'left') return 'arrive-left';
    if (modifier === 'right') return 'arrive-right';
    return 'arrive';
  }

  if (type === 'roundabout' || type === 'rotary' || exit) return 'roundabout';
  if (modifier === 'uturn') return 'uturn';

  if (modifier === 'slight left' || modifier === 'sharp left') return 'slight-left';
  if (modifier === 'slight right' || modifier === 'sharp right') return 'slight-right';
  if (modifier === 'left') return 'left';
  if (modifier === 'right') return 'right';

  return 'straight';
}

export function buildManeuverText(step, { includeStreet = true } = {}) {
  if (!step) return 'Continue on the route';

  const { type, modifier, name, exit } = step;
  const street = includeStreet && name?.trim() ? ` onto ${name.trim()}` : '';

  if (type === 'arrive') {
    if (modifier === 'left') return 'Destination is on your left';
    if (modifier === 'right') return 'Destination is on your right';
    return 'You have arrived at your destination';
  }

  if (modifier === 'uturn') return 'Take a U-turn';

  if (type === 'roundabout' || type === 'rotary') {
    const exitNum = exit || step.maneuver?.exit;
    if (exitNum) {
      return `Enter the roundabout and take the ${exitNum}${ordinal(exitNum)} exit${street}`;
    }
    return `Enter the roundabout${street}`;
  }

  if (modifier === 'slight left') return `Keep left${street}`;
  if (modifier === 'slight right') return `Keep right${street}`;
  if (modifier === 'left' || modifier === 'sharp left') return `Take a left${street}`;
  if (modifier === 'right' || modifier === 'sharp right') return `Take a right${street}`;

  if (name?.trim()) return `Continue on ${name.trim()}`;
  return 'Go straight';
}

export function buildApproachInstruction(step, distanceM) {
  if (!step) return 'Continue on the route';

  if (step.type === 'arrive' || distanceM <= MANEUVER_PASSED_M) {
    return buildManeuverText(step);
  }

  const dist = formatApproachDistance(distanceM);

  if (isStraightManeuver(step)) {
    const segment = step.distance >= 200 ? step.distance : distanceM;
    const verb = ['continue', 'new name'].includes(step.type) ? 'Continue straight' : 'Go straight';
    return `${verb} for ${formatApproachDistance(segment)}`;
  }

  const action = buildManeuverText(step, { includeStreet: false });
  return `${action} in ${dist}`;
}

export function buildVoiceInstruction(step, distanceM) {
  if (!step) return '';
  const text = buildApproachInstruction(step, distanceM);
  return text.replace(/\bm\b/g, 'meters').replace(/\bkm\b/g, 'kilometers');
}

export function formatStepInstruction(step) {
  return buildManeuverText(
    {
      type: step.maneuver?.type,
      modifier: step.maneuver?.modifier,
      name: step.name,
      exit: step.maneuver?.exit,
      maneuver: step.maneuver,
    },
    { includeStreet: true },
  );
}

export function normalizeRouteSteps(legs = []) {
  return legs.flatMap((leg) =>
    (leg.steps || []).map((step) => ({
      instruction: formatStepInstruction(step),
      distance: step.distance || 0,
      duration: step.duration || 0,
      location: step.maneuver?.location
        ? [step.maneuver.location[1], step.maneuver.location[0]]
        : null,
      type: step.maneuver?.type,
      modifier: step.maneuver?.modifier,
      exit: step.maneuver?.exit,
      name: step.name,
    })),
  );
}

export function nearestPointOnPolyline(point, polyline = []) {
  if (!hasMapPoint(point) || polyline.length < 2) {
    return { index: 0, distance: Infinity, point: null, traversedM: 0 };
  }

  let best = { index: 0, distance: Infinity, point: polyline[0], traversedM: 0 };
  let traversedM = 0;

  for (let i = 0; i < polyline.length - 1; i += 1) {
    const start = polyline[i];
    const end = polyline[i + 1];
    const segmentM = haversineDistance(
      { latitude: start[0], longitude: start[1] },
      { latitude: end[0], longitude: end[1] },
    );
    const projected = projectPointOnSegment(point, start, end);
    const distance = haversineDistance(point, {
      latitude: projected[0],
      longitude: projected[1],
    });

    if (distance < best.distance) {
      const alongM = haversineDistance(
        { latitude: start[0], longitude: start[1] },
        { latitude: projected[0], longitude: projected[1] },
      );
      best = { index: i, distance, point: projected, traversedM: traversedM + alongM };
    }

    traversedM += segmentM;
  }

  return best;
}

function projectPointOnSegment(point, start, end) {
  const [lat, lng] = [point.latitude, point.longitude];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  const dx = lat2 - lat1;
  const dy = lng2 - lng1;

  if (dx === 0 && dy === 0) return start;

  const t = Math.max(
    0,
    Math.min(1, ((lat - lat1) * dx + (lng - lng1) * dy) / (dx * dx + dy * dy)),
  );

  return [lat1 + t * dx, lng1 + t * dy];
}

function polylineIndexForStep(step, polyline) {
  if (!step?.location || polyline.length < 2) return 0;
  const target = { latitude: step.location[0], longitude: step.location[1] };
  const nearest = nearestPointOnPolyline(target, polyline);
  return nearest.index;
}

function distanceAlongPolyline(polyline, fromIndex, fromPoint, toIndex, toPoint) {
  if (polyline.length < 2) {
    return haversineDistance(
      { latitude: fromPoint[0], longitude: fromPoint[1] },
      { latitude: toPoint[0], longitude: toPoint[1] },
    );
  }

  let total = 0;
  const start = [fromPoint[0], fromPoint[1]];

  for (let i = fromIndex; i < polyline.length - 1; i += 1) {
    const segStart = i === fromIndex ? start : polyline[i];
    const segEnd = i >= toIndex ? toPoint : polyline[i + 1];
    total += haversineDistance(
      { latitude: segStart[0], longitude: segStart[1] },
      { latitude: segEnd[0], longitude: segEnd[1] },
    );
    if (i >= toIndex) break;
  }

  return total;
}

export function isOffRoute(point, polyline = [], thresholdM = DEVIATION_THRESHOLD_M) {
  const nearest = nearestPointOnPolyline(point, polyline);
  return nearest.distance > thresholdM;
}

export function getNavigationState(driver, steps = [], polyline = []) {
  if (!hasMapPoint(driver) || !steps.length) return null;

  const nearest = polyline.length > 1 ? nearestPointOnPolyline(driver, polyline) : null;
  const offRoute = nearest ? nearest.distance > DEVIATION_THRESHOLD_M : false;

  let nextIndex = steps.length - 1;

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    if (!step.location) continue;

    const distToManeuver = haversineDistance(driver, {
      latitude: step.location[0],
      longitude: step.location[1],
    });

    if (distToManeuver > MANEUVER_PASSED_M || step.type === 'arrive') {
      nextIndex = i;
      break;
    }
  }

  const nextStep = steps[nextIndex];
  let distanceToManeuver = nextStep.location
    ? haversineDistance(driver, {
        latitude: nextStep.location[0],
        longitude: nextStep.location[1],
      })
    : nextStep.distance;

  if (nearest?.point && polyline.length > 1 && nextStep.location) {
    const stepIndex = polylineIndexForStep(nextStep, polyline);
    if (stepIndex >= nearest.index) {
      distanceToManeuver = distanceAlongPolyline(
        polyline,
        nearest.index,
        nearest.point,
        stepIndex,
        nextStep.location,
      );
    }
  }

  if (isStraightManeuver(nextStep) && nextStep.distance > distanceToManeuver) {
    distanceToManeuver = Math.max(distanceToManeuver, Math.min(nextStep.distance, distanceToManeuver));
  }

  const remainingDistance = steps
    .slice(nextIndex)
    .reduce((sum, step) => sum + (step.distance || 0), 0);
  const remainingDuration = steps
    .slice(nextIndex)
    .reduce((sum, step) => sum + (step.duration || 0), 0);

  const followingStep = steps[nextIndex + 1] || null;
  const instruction = buildApproachInstruction(nextStep, distanceToManeuver);

  return {
    instruction,
    primaryText: buildManeuverText(nextStep),
    distanceText: formatApproachDistance(distanceToManeuver),
    voiceText: buildVoiceInstruction(nextStep, distanceToManeuver),
    voiceKey: `${nextIndex}-${Math.round(distanceToManeuver / 25)}-${nextStep.type}-${nextStep.modifier}`,
    maneuverKind: getManeuverKind(nextStep),
    nextStep,
    followingStep,
    followingInstruction: followingStep ? buildManeuverText(followingStep) : null,
    remainingDistance,
    remainingDuration,
    arrivalTime: formatArrivalTime(remainingDuration),
    offRoute,
    distanceToManeuver,
    stepIndex: nextIndex,
  };
}

export function computeBearing(from, to) {
  if (!hasMapPoint(from) || !hasMapPoint(to)) return 0;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2)
    - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function lerpLatLng(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ];
}
