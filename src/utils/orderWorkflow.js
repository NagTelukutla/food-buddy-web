export const ORDER_STATUSES = [
  'Pending',
  'Accepted',
  'Driver Assigned',
  'Prepared',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const DELIVERY_TRACKER_STEPS = [
  'Pending',
  'Accepted',
  'Driver Assigned',
  'Prepared',
  'Out for Delivery',
  'Delivered',
];

export const LEGACY_STATUS_MAP = {
  Preparing: 'Driver Assigned',
  Ready: 'Prepared',
  'Awaiting Driver Acceptance': 'Accepted',
  'Assigned to Driver': 'Driver Assigned',
  'Ready for Pickup': 'Prepared',
};

export function normalizeOrderStatus(status) {
  return LEGACY_STATUS_MAP[status] || status;
}

const ADMIN_TRANSITIONS = {
  'Pending|Delivery': 'Accepted',
  'Pending|Pickup': 'Accepted',
  'Pending|Dine In': 'Accepted',
  'Accepted|Pickup': 'Prepared',
  'Accepted|Dine In': 'Prepared',
  'Driver Assigned|Delivery': 'Prepared',
  'Prepared|Pickup': 'Delivered',
  'Prepared|Dine In': 'Delivered',
};

const ADMIN_ACTION_LABELS = {
  'Pending|Delivery': 'Accept Order',
  'Pending|Pickup': 'Accept Order',
  'Pending|Dine In': 'Accept Order',
  'Accepted|Pickup': 'Prepared',
  'Accepted|Dine In': 'Prepared',
  'Driver Assigned|Delivery': 'Prepared',
  'Prepared|Pickup': 'Mark Delivered',
  'Prepared|Dine In': 'Mark Delivered',
};

export function getAdminAction(order) {
  if (!order) return null;
  const status = normalizeOrderStatus(order.status);
  const key = `${status}|${order.order_type}`;
  const nextStatus = ADMIN_TRANSITIONS[key];
  if (!nextStatus) return null;
  return { label: ADMIN_ACTION_LABELS[key], nextStatus };
}

/** Admin action button — clickable transitions or read-only disabled states for delivery orders. */
export function getAdminStatusButton(order) {
  if (!order) return null;

  const action = getAdminAction(order);
  if (action) {
    return { ...action, disabled: false };
  }

  if (order.order_type !== 'Delivery') return null;

  const status = normalizeOrderStatus(order.status);
  if (status === 'Delivered') {
    return { label: 'Delivered', disabled: true };
  }
  if (status === 'Prepared' || status === 'Out for Delivery') {
    return { label: 'Picked', disabled: true };
  }

  return null;
}

export function getDriverAction(assignment) {
  if (!assignment) return null;
  const orderStatus = normalizeOrderStatus(assignment.order_status);
  const deliveryStatus = assignment.delivery_status;

  if (deliveryStatus === 'pending_acceptance' && !assignment.delivery_partner_id && orderStatus === 'Accepted') {
    return { label: 'Accept Delivery', type: 'accept' };
  }
  if (deliveryStatus === 'accepted' && orderStatus === 'Prepared') {
    return { label: 'Out for Delivery', type: 'status', nextStatus: 'out_for_delivery' };
  }
  if (
    (['out_for_delivery', 'picked_up', 'in_transit'].includes(deliveryStatus)
      || orderStatus === 'Out for Delivery')
    && deliveryStatus !== 'delivered'
  ) {
    return { label: 'Delivered', type: 'status', nextStatus: 'delivered' };
  }
  return null;
}

export function getTrackerSteps(orderType) {
  return orderType === 'Delivery'
    ? DELIVERY_TRACKER_STEPS
    : ['Pending', 'Accepted', 'Prepared', 'Delivered'];
}
