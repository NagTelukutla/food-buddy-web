export { ORDER_STATUSES } from './orderWorkflow';

/** Main application brand shown in the site header and browser title. */
export const APP_NAME = 'Food Buddy';

export const ORDER_TYPES = ['Delivery', 'Pickup'];

export const CATEGORIES = [
  'Starters',
  'Soups',
  'Main Course',
  'Biryani',
  'Beverages',
  'Desserts',
];

export const TAX_RATE = 0.05;

export const CART_STORAGE_KEY = 'restaurant_cart';

export const DELIVERY_LOCATION_STORAGE_KEY = 'food_buddy_delivery_location';
export const RECENT_LOCATION_SEARCHES_KEY = 'food_buddy_recent_location_searches';

export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-blue-100 text-blue-800',
  'Driver Assigned': 'bg-indigo-100 text-indigo-800',
  Prepared: 'bg-green-100 text-green-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
  'Awaiting Driver Acceptance': 'bg-amber-100 text-amber-800',
  'Assigned to Driver': 'bg-indigo-100 text-indigo-800',
  'Ready for Pickup': 'bg-green-100 text-green-800',
  Preparing: 'bg-purple-100 text-purple-800',
  Ready: 'bg-green-100 text-green-800',
};
