import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { deliveryApi } from '../../api/restaurantApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LiveDeliveryMap from '../../components/delivery/LiveDeliveryMap';
import { useAuth } from '../../context/AuthContext';
import { useDriverLocationTracker } from '../../hooks/useDriverLocation';
import { formatCurrency, formatDate } from '../../utils/format';
import { getDriverAction, normalizeOrderStatus } from '../../utils/orderWorkflow';

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

function DeliveryCard({ assignment, acting, onAccept, onUpdateStatus, index = 0 }) {
  const orderStatus = normalizeOrderStatus(assignment.order_status);
  const driverAction = getDriverAction(assignment);
  const waitingForPrepared =
    assignment.delivery_status === 'accepted' && orderStatus === 'Driver Assigned';
  const isPendingAccept =
    assignment.delivery_status === 'pending_acceptance' && assignment.delivery_partner_id == null;

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
          </p>
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

        <div className="delivery-glass-soft p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="delivery-section-title">Order items</p>
            <p className="text-sm font-bold text-brand-700">{formatCurrency(assignment.total)}</p>
          </div>
          <ul className="divide-y divide-stone-200/70 text-sm">
            {assignment.items?.map((item, idx) => (
              <li key={idx} className="flex justify-between py-2 first:pt-0 last:pb-0">
                <span className="text-stone-700">{item.name} × {item.quantity}</span>
                <span className="font-medium text-stone-900">{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>
          {assignment.notes && (
            <p className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900">
              {assignment.notes}
            </p>
          )}
        </div>
      </div>

      {(waitingForPrepared || driverAction) && (
        <div className="border-t border-white/50 bg-white/40 px-4 py-3 backdrop-blur-sm">
          {waitingForPrepared && (
            <p className="mb-2.5 rounded-xl border border-amber-200/50 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
              Accepted — head to the restaurant and wait until the order is marked Prepared.
            </p>
          )}
          {driverAction?.type === 'accept' && (
            <button
              type="button"
              disabled={acting === assignment.order_id}
              onClick={() => onAccept(assignment.order_id)}
              className="delivery-btn-primary"
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
    <div className="delivery-stat-pill min-w-0 flex-1">
      <p className="delivery-section-title">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tracking-tight ${tones[tone]}`}>{value}</p>
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

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return deliveryApi
      .assignments()
      .then(({ data }) => setAssignments(data.items || []))
      .catch((err) => {
        if (!silent) toast.error(err.response?.data?.detail || 'Failed to load deliveries');
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true), 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    deliveryApi
      .assignments()
      .then(({ data }) => setAssignments(data.items || []))
      .catch((err) => toast.error(err.response?.data?.detail || 'Failed to refresh deliveries'))
      .finally(() => setRefreshing(false));
  };

  const availableOrders = useMemo(
    () => assignments.filter(
      (a) =>
        a.delivery_status === 'pending_acceptance'
        && a.delivery_partner_id == null
        && normalizeOrderStatus(a.order_status) === 'Accepted',
    ),
    [assignments],
  );
  const myDeliveries = useMemo(
    () => assignments.filter(
      (a) => a.delivery_partner_id != null && a.delivery_status !== 'delivered',
    ),
    [assignments],
  );

  const { sharing, activeCount, error: locationError } = useDriverLocationTracker(assignments);
  const primaryActive = useMemo(
    () => assignments.find((a) => ['accepted', 'out_for_delivery'].includes(a.delivery_status)),
    [assignments],
  );
  const [liveTrack, setLiveTrack] = useState(null);

  const firstName = user?.full_name?.split(' ')[0] || 'Driver';

  useEffect(() => {
    if (!primaryActive) {
      setLiveTrack(null);
      return undefined;
    }
    const fetchTrack = () => {
      deliveryApi.liveTrack(primaryActive.order_id).then(({ data }) => setLiveTrack(data)).catch(() => {});
    };
    fetchTrack();
    const interval = setInterval(fetchTrack, 5000);
    return () => clearInterval(interval);
  }, [primaryActive?.order_id, primaryActive?.delivery_status]);

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
    runAction(orderId, () => deliveryApi.accept(orderId));

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
              <p className="mt-1 text-sm text-stone-500">Manage routes, accept orders, and stay on track.</p>
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

          <div className="mt-4 flex gap-2.5">
            <StatPill label="Available" value={availableOrders.length} tone="brand" />
            <StatPill label="Active" value={myDeliveries.length} tone="success" />
            <StatPill label="Queue" value={assignments.length} />
          </div>
        </div>
      </header>

      {sharing && (
        <div className="delivery-rise delivery-glass-soft mb-4 flex items-center gap-3 border-emerald-200/50 px-4 py-3 text-sm text-emerald-800">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          Live location ON · {activeCount} active route{activeCount !== 1 ? 's' : ''}
        </div>
      )}

      {locationError && (
        <div className="delivery-rise delivery-glass-soft mb-4 border-amber-200/50 px-4 py-3 text-sm text-amber-900">
          Enable location access so customers can follow your delivery on the map.
        </div>
      )}

      {liveTrack?.live_tracking_enabled && (
        <section className="delivery-rise delivery-glass mb-5 overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-white/40 bg-white/30 px-4 py-3 backdrop-blur-md">
            <div>
              <h2 className="font-semibold text-stone-900">Live navigation</h2>
              <p className="text-xs text-stone-500">Road route · auto-updates as you move</p>
            </div>
            <span className="rounded-full border border-violet-200/70 bg-violet-50/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              Tracking
            </span>
          </div>
          <div className="bg-white/50 p-2.5">
            <div className="overflow-hidden rounded-[1.25rem] ring-1 ring-black/5">
              <LiveDeliveryMap
                restaurant={liveTrack.restaurant}
                destination={liveTrack.destination}
                driver={liveTrack.driver}
                deliveryStatus={liveTrack.delivery_status}
                deliveryAddress={liveTrack.delivery_address}
                height="360px"
                followDriver
                navigationMode
                framed
                statusLabel="Order is on the way"
              />
            </div>
          </div>
        </section>
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
              {availableOrders.length === 0 ? (
                <PremiumEmpty
                  title="No orders right now"
                  message="New delivery requests appear here once the restaurant admin accepts an order. Pull refresh to check again."
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
