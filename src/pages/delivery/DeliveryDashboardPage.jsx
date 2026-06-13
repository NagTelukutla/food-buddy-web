import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { deliveryApi } from '../../api/restaurantApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StaticMapPreview from '../../components/delivery/StaticMapPreview';
import { useAuth } from '../../context/AuthContext';
import { useDriverBrowseLocation, useDriverLocationTracker } from '../../hooks/useDriverLocation';
import { DELIVERY_PARTNER_ORDER_RADIUS_KM } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/format';
import { formatDistanceKm } from '../../utils/geo';
import { canNavigateTo, openNativeNavigation } from '../../utils/nativeMaps';
import { getDriverAction, normalizeOrderStatus } from '../../utils/orderWorkflow';

/** Which place the driver should head to next, based on delivery status. */
function getNavTarget(assignment) {
  const status = assignment.delivery_status;
  if (status === 'accepted') {
    return {
      kind: 'restaurant',
      label: 'Navigate to Restaurant',
      lat: assignment.restaurant_lat,
      lng: assignment.restaurant_lng,
      address: assignment.restaurant_address || assignment.restaurant_name,
    };
  }
  if (['out_for_delivery', 'picked_up', 'in_transit'].includes(status)) {
    return {
      kind: 'customer',
      label: 'Navigate to Customer',
      lat: assignment.delivery_lat,
      lng: assignment.delivery_lng,
      address: assignment.delivery_address,
    };
  }
  return null;
}

function NavigateButton({ assignment }) {
  const target = getNavTarget(assignment);
  if (!target || !canNavigateTo(target)) return null;

  return (
    <button
      type="button"
      onClick={() => openNativeNavigation(target)}
      className="delivery-btn-primary mb-2.5 flex items-center justify-center gap-2"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      {target.label}
    </button>
  );
}

function CustomerDeliveryCard({ assignment, compact = false, showPickup = false }) {
  const textSize = compact ? 'text-xs' : 'text-sm';
  const labelSize = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`delivery-glass-soft space-y-3 ${compact ? 'p-2.5' : 'p-3.5'}`}>
      {showPickup && (assignment.restaurant_name || assignment.restaurant_address) && (
        <div className={`${textSize} leading-snug`}>
          <p className={`delivery-section-title mb-1 ${labelSize}`}>Order from</p>
          {assignment.restaurant_name && (
            <p className="font-semibold text-stone-900">{assignment.restaurant_name}</p>
          )}
          {assignment.restaurant_address && (
            <p className="mt-0.5 text-stone-600">{assignment.restaurant_address}</p>
          )}
        </div>
      )}

      <div className={`${textSize} leading-snug ${showPickup ? 'border-t border-stone-200/60 pt-3' : ''}`}>
        <p className={`delivery-section-title mb-1 ${labelSize}`}>Order to</p>
        <p className="font-semibold text-stone-900">{assignment.customer_name}</p>
        <a href={`tel:${assignment.phone}`} className="mt-0.5 inline-block font-medium text-brand-600">
          {assignment.phone}
        </a>
        {assignment.delivery_address ? (
          <p className="mt-1.5 text-stone-600">{assignment.delivery_address}</p>
        ) : (
          <p className="mt-1.5 italic text-stone-400">Address not provided</p>
        )}
      </div>
    </div>
  );
}

const STATUS_META = {
  pending_acceptance: {
    label: 'Pending to accept',
    pill: 'border-amber-200/80 bg-amber-50/90 text-amber-800',
    accent: 'from-amber-400 to-orange-500',
  },
  accepted: {
    label: 'Head to restaurant',
    pill: 'border-blue-200/80 bg-blue-50/90 text-blue-800',
    accent: 'from-sky-400 to-blue-600',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    pill: 'border-violet-200/80 bg-violet-50/90 text-violet-800',
    accent: 'from-violet-400 to-purple-600',
  },
  delivered: {
    label: 'Delivered',
    pill: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800',
    accent: 'from-emerald-400 to-green-600',
  },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || {
    label: status.replace(/_/g, ' '),
    pill: 'border-stone-200/80 bg-stone-50/90 text-stone-700',
    accent: 'from-stone-400 to-stone-600',
  };

  return (
    <span className={`delivery-status-pill capitalize ${meta.pill}`}>
      {meta.label}
    </span>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="delivery-glass-soft p-2.5">
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 text-brand-600 shadow-sm">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="delivery-section-title mb-0.5">{label}</p>
          <div className="text-sm leading-snug text-stone-700">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PendingDot({ className = 'h-2.5 w-2.5', title = 'Pending to accept' }) {
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      aria-label={title}
      title={title}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
      <span className="relative inline-flex h-full w-full rounded-full bg-orange-500" />
    </span>
  );
}

function LiveLocationDot({ className = 'h-2.5 w-2.5', title = 'Live location sharing' }) {
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      aria-label={title}
      title={title}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500" />
    </span>
  );
}

const LIVE_TRACKING_STATUSES = new Set(['accepted', 'out_for_delivery', 'picked_up', 'in_transit']);

function DeliveryCard({
  assignment,
  acting,
  onAccept,
  onUpdateStatus,
  index = 0,
  compact = false,
  liveSharing = false,
  acceptDisabled = false,
  acceptDisabledReason = '',
}) {
  const orderStatus = normalizeOrderStatus(assignment.order_status);
  const driverAction = getDriverAction(assignment);
  const waitingForPrepared =
    assignment.delivery_status === 'accepted' && orderStatus === 'Driver Assigned';
  const isPendingAccept =
    assignment.delivery_status === 'pending_acceptance' && assignment.delivery_partner_id == null;
  const navTarget = getNavTarget(assignment);
  const hasNavTarget = !!navTarget && canNavigateTo(navTarget);
  const showRestaurantDetails = !!(assignment.restaurant_name || assignment.restaurant_address);
  const showStaticMap = compact && hasNavTarget;
  const showNavigateButton = !compact && hasNavTarget;

  return (
    <article
      className="delivery-glass delivery-rise relative overflow-hidden !p-0"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-sm font-bold tracking-wide text-stone-900">
            {assignment.order_id}
            {isPendingAccept && <PendingDot />}
            {liveSharing && <LiveLocationDot />}
          </p>
          {assignment.restaurant_name && !isPendingAccept && (
            <p className="mt-0.5 text-sm font-semibold text-brand-700">{assignment.restaurant_name}</p>
          )}
          {isPendingAccept && assignment.distance_km != null && (
            <p className="mt-0.5 text-xs font-medium text-stone-600">
              {formatDistanceKm(assignment.distance_km)} from pickup
              <span className="text-stone-400"> (approx.)</span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-stone-500">{formatDate(assignment.created_at)}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="delivery-status-pill border-stone-200/80 bg-white/70 text-stone-600">
            Order: {orderStatus}
          </span>
          <StatusPill status={assignment.delivery_status} />
        </div>
      </div>

      <div className="space-y-1.5 px-4 pb-4">
        {showStaticMap && (
          <StaticMapPreview
            latitude={navTarget.lat}
            longitude={navTarget.lng}
            address={navTarget.address}
            label={navTarget.label}
            className="w-full"
            height="8.5rem"
          />
        )}

        {(compact || isPendingAccept) ? (
          <CustomerDeliveryCard
            assignment={assignment}
            compact={compact}
            showPickup={showRestaurantDetails}
          />
        ) : (
          <>
            {showRestaurantDetails && (
              <InfoRow
                label="Restaurant"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                  </svg>
                }
              >
                {assignment.restaurant_name && (
                  <p className="font-semibold leading-tight text-stone-900">{assignment.restaurant_name}</p>
                )}
                {assignment.restaurant_address && (
                  <p className="leading-tight">{assignment.restaurant_address}</p>
                )}
              </InfoRow>
            )}

            <InfoRow
              label="Customer"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              <p className="font-semibold leading-tight text-stone-900">{assignment.customer_name}</p>
              <a href={`tel:${assignment.phone}`} className="inline-block font-medium leading-tight text-brand-600">
                {assignment.phone}
              </a>
            </InfoRow>

            <InfoRow
              label="Delivery address"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              {assignment.delivery_address ? (
                assignment.delivery_address
              ) : (
                <span className="italic text-stone-400">Address not provided</span>
              )}
            </InfoRow>
          </>
        )}

        <div className={`delivery-glass-soft ${compact ? 'p-2.5' : 'p-3.5'}`}>
          <div className="mb-1.5 flex items-center justify-between">
            <p className={`delivery-section-title ${compact ? 'text-[10px]' : ''}`}>Order items</p>
            <p className={`font-bold text-brand-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              {formatCurrency(assignment.total)}
            </p>
          </div>
          <ul className={`divide-y divide-stone-200/70 ${compact ? 'text-xs' : 'text-sm'}`}>
            {assignment.items?.map((item, idx) => (
              <li key={idx} className={`flex justify-between ${compact ? 'py-1.5' : 'py-2'} first:pt-0 last:pb-0`}>
                <span className="text-stone-700">{item.name} × {item.quantity}</span>
                <span className="font-medium text-stone-900">{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>
          {assignment.notes && (
            <p className={`mt-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-2.5 py-1.5 leading-relaxed text-amber-900 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {assignment.notes}
            </p>
          )}
        </div>
      </div>

      {(waitingForPrepared || driverAction || showNavigateButton) && (
        <div className="border-t border-white/50 bg-white/40 px-4 py-3 backdrop-blur-sm">
          {waitingForPrepared && (
            <p className="mb-2.5 rounded-xl border border-amber-200/50 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
              Accepted — head to the restaurant and wait until the order is marked Prepared.
            </p>
          )}
          {showNavigateButton && <NavigateButton assignment={assignment} />}
          {driverAction?.type === 'accept' && (
            <button
              type="button"
              disabled={acting === assignment.order_id || acceptDisabled}
              title={acceptDisabled ? acceptDisabledReason : undefined}
              onClick={() => onAccept(assignment.order_id)}
              className="delivery-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {acting === assignment.order_id ? 'Accepting…' : driverAction.label}
            </button>
          )}
          {driverAction?.type === 'status' && (
            <button
              type="button"
              disabled={acting === assignment.order_id}
              onClick={() => onUpdateStatus(assignment.order_id, driverAction.nextStatus)}
              className="delivery-btn-primary"
            >
              {acting === assignment.order_id ? 'Updating…' : driverAction.label}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function StatPill({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-stone-900',
    brand: 'text-brand-700',
    success: 'text-emerald-700',
  };

  return (
    <div className="delivery-stat-pill min-w-0 flex-1 !rounded-xl !px-2.5 !py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</p>
      <p className={`mt-0.5 text-lg font-bold leading-none tracking-tight ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function PremiumEmpty({ title, message }) {
  return (
    <div className="delivery-glass delivery-rise px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 ring-1 ring-brand-500/10">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 011 1v1a1 1 0 01-1 1h-1M13 16V9h4l2 3v4h-6z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">{message}</p>
    </div>
  );
}

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState(null);
  const refreshSpinTimerRef = useRef(null);
  const browseCoordsRef = useRef(null);

  const REFRESH_SPIN_MS = 1500;

  const load = useCallback((silent = false, coords = browseCoordsRef.current) => {
    if (!silent) setLoading(true);
    const params = coords
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : undefined;
    return deliveryApi
      .assignments(params)
      .then(({ data }) => setAssignments(data.items || []))
      .catch((err) => {
        if (!silent) toast.error(err.response?.data?.detail || 'Failed to load deliveries');
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  const handleBrowseLocationChange = useCallback((coords) => {
    browseCoordsRef.current = coords;
    load(true, coords);
  }, [load]);

  const {
    coords: browseCoords,
    error: browseLocationError,
    denied: locationDenied,
  } = useDriverBrowseLocation({
    enabled: true,
    onLocationChange: handleBrowseLocationChange,
  });

  useEffect(() => {
    browseCoordsRef.current = browseCoords;
  }, [browseCoords]);

  useEffect(() => { load(false); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true, browseCoordsRef.current), 12000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => () => {
    if (refreshSpinTimerRef.current) clearTimeout(refreshSpinTimerRef.current);
  }, []);

  const handleRefresh = () => {
    const startedAt = Date.now();
    setRefreshing(true);
    const params = browseCoordsRef.current
      ? {
          latitude: browseCoordsRef.current.latitude,
          longitude: browseCoordsRef.current.longitude,
        }
      : undefined;

    deliveryApi
      .assignments(params)
      .then(({ data }) => setAssignments(data.items || []))
      .catch((err) => toast.error(err.response?.data?.detail || 'Failed to refresh deliveries'))
      .finally(() => {
        const remaining = Math.max(0, REFRESH_SPIN_MS - (Date.now() - startedAt));
        if (refreshSpinTimerRef.current) clearTimeout(refreshSpinTimerRef.current);
        refreshSpinTimerRef.current = setTimeout(() => {
          setRefreshing(false);
          refreshSpinTimerRef.current = null;
        }, remaining);
      });
  };

  const availableOrders = useMemo(
    () => assignments
      .filter(
        (a) =>
          a.delivery_status === 'pending_acceptance'
          && a.delivery_partner_id == null
          && normalizeOrderStatus(a.order_status) === 'Accepted',
      )
      .sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity)),
    [assignments],
  );
  const myDeliveries = useMemo(
    () => assignments.filter(
      (a) => a.delivery_partner_id != null && a.delivery_status !== 'delivered',
    ),
    [assignments],
  );

  // Driver GPS is still shared so customers can follow the order on their
  // tracking screen — but the driver app itself hands navigation off to the
  // native Google Maps app (no embedded map / Directions API cost here).
  const { sharing, error: locationError } = useDriverLocationTracker(assignments);

  const firstName = user?.full_name?.split(' ')[0] || 'Driver';

  const runAction = async (orderId, action) => {
    setActing(orderId);
    try {
      await action();
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const acceptOrder = (orderId) =>
    runAction(orderId, () => {
      const coords = browseCoordsRef.current;
      return deliveryApi.accept(
        orderId,
        coords ? { latitude: coords.latitude, longitude: coords.longitude } : {},
      );
    });

  const pendingBlocked = locationDenied || (!browseCoords && !!browseLocationError);
  const acceptDisabledReason = pendingBlocked
    ? 'Enable location to accept orders'
    : `Outside your ${DELIVERY_PARTNER_ORDER_RADIUS_KM} km service area`;

  const isOutsideRadius = (assignment) =>
    assignment.distance_km != null && assignment.distance_km > DELIVERY_PARTNER_ORDER_RADIUS_KM;

  const updateStatus = (orderId, status) =>
    runAction(orderId, () => deliveryApi.updateStatus(orderId, { delivery_status: status }));

  return (
    <div className="delivery-shell mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5">
      <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-brand-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-32 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl" />

      <header className="delivery-rise relative mb-5">
        <div className="delivery-glass p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="delivery-section-title text-brand-600">Delivery Hub</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Hello, {firstName}
              </h1>
              <p className="mt-1 text-xs text-stone-500">Manage routes, accept orders, and stay on track.</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="delivery-icon-btn shrink-0"
              aria-label="Refresh deliveries"
              title="Refresh deliveries"
            >
              <svg
                className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <StatPill label="Available" value={availableOrders.length} tone="brand" />
            <StatPill label="Active" value={myDeliveries.length} tone="success" />
            <StatPill label="Queue" value={assignments.length} />
          </div>
        </div>
      </header>

      {(locationDenied || browseLocationError) && (
        <div className="delivery-rise delivery-glass-soft mb-4 border-amber-200/50 px-4 py-3 text-sm text-amber-900">
          {locationDenied
            ? 'Location access is required to see and accept nearby delivery orders. Enable GPS in your browser settings.'
            : browseLocationError}
        </div>
      )}

      {!pendingBlocked && browseCoords && (
        <div className="delivery-rise delivery-glass-soft mb-4 px-4 py-2.5 text-sm text-stone-600">
          Showing orders within <span className="font-semibold text-stone-800">{DELIVERY_PARTNER_ORDER_RADIUS_KM} km</span> of you
        </div>
      )}

      {locationError && (
        <div className="delivery-rise delivery-glass-soft mb-4 border-amber-200/50 px-4 py-3 text-sm text-amber-900">
          Enable location access so customers can follow your delivery on the map.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {myDeliveries.length === 0 && (
            <section className="delivery-rise">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="delivery-section-title">Opportunities</p>
                  <h2 className="text-lg font-bold text-stone-900 sm:text-xl">Available orders</h2>
                </div>
              </div>
              {pendingBlocked ? (
                <PremiumEmpty
                  title="Location required"
                  message="Enable GPS to see delivery orders near you. Active deliveries below will still appear once assigned."
                />
              ) : availableOrders.length === 0 ? (
                <PremiumEmpty
                  title="No orders right now"
                  message={`No delivery requests within ${DELIVERY_PARTNER_ORDER_RADIUS_KM} km. Pull refresh to check again.`}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {availableOrders.map((a, index) => (
                    <DeliveryCard
                      key={a.id}
                      assignment={a}
                      acting={acting}
                      onAccept={acceptOrder}
                      onUpdateStatus={updateStatus}
                      index={index}
                      acceptDisabled={pendingBlocked || isOutsideRadius(a)}
                      acceptDisabledReason={acceptDisabledReason}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {myDeliveries.length > 0 && (
            <section className="delivery-rise">
              <div className="mb-3">
                <p className="delivery-section-title">In progress</p>
                <h2 className="text-lg font-bold text-stone-900 sm:text-xl">Active deliveries</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {myDeliveries.map((a, index) => (
                  <DeliveryCard
                    key={a.id}
                    assignment={a}
                    acting={acting}
                    onAccept={acceptOrder}
                    onUpdateStatus={updateStatus}
                    index={index}
                    compact
                    liveSharing={sharing && LIVE_TRACKING_STATUSES.has(a.delivery_status)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
