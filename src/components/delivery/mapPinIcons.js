import L from 'leaflet';

const PIN_COLORS = {
  restaurant: { fill: '#22c55e', stroke: '#15803d' },
  destination: { fill: '#ef4444', stroke: '#b91c1c' },
  driver: { fill: '#3b82f6', stroke: '#1d4ed8' },
};

function createPinIcon(type) {
  const { fill, stroke } = PIN_COLORS[type] || PIN_COLORS.driver;

  return L.divIcon({
    className: 'delivery-map-pin-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" aria-hidden="true">
      <path d="M14 0C6.82 0 1 5.82 1 13c0 10.5 13 27 13 27s13-16.5 13-27C27 5.82 21.18 0 14 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="14" cy="13" r="5.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    tooltipAnchor: [0, -36],
  });
}

export const restaurantPinIcon = createPinIcon('restaurant');
export const destinationPinIcon = createPinIcon('destination');
export const driverPinIcon = createPinIcon('driver');
