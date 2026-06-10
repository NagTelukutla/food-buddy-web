const MANEUVER_PATHS = {
  straight: 'M5 12h14M12 5l7 7-7 7',
  left: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  right: 'M14 5l7 7m0 0l-7 7m7-7H3',
  'slight-left': 'M7 16l-4-4m0 0l4-4m-4 4h12M14 8l3-3',
  'slight-right': 'M17 8l3 3m0 0l-3 3m3-3H8M10 16l-3 3',
  uturn: 'M9 14l-4-4m0 0l4-4m-4 4h6a4 4 0 014 4v2',
  roundabout: 'M12 8a3 3 0 100 6 3 3 0 000-6zm7-1l-2 2M5 7L3 9M12 3v2M12 17v2',
  arrive: 'M5 13l4 4L19 7',
  'arrive-left': 'M3 10h10M8 5v10M16 19l4-4',
  'arrive-right': 'M21 10H11M16 5v10M8 19l-4-4',
};

export default function NavigationManeuverIcon({ kind = 'straight', compact = false, className = '' }) {
  const path = MANEUVER_PATHS[kind] || MANEUVER_PATHS.straight;

  return (
    <span
      className={`delivery-nav-maneuver ${compact ? 'delivery-nav-maneuver--compact' : ''} ${className}`.trim()}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </span>
  );
}
