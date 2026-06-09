import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { deliveryApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import LiveDeliveryMap from '../../components/delivery/LiveDeliveryMap';
import { useDriverLocationTracker } from '../../hooks/useDriverLocation';
import { formatCurrency, formatDate } from '../../utils/format';
import { getDriverAction, normalizeOrderStatus } from '../../utils/orderWorkflow';

const STATUS_LABELS = {
  pending_acceptance: 'Awaiting driver',
  accepted: 'Driver assigned — go to restaurant',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

function StatusBadge({ status }) {
  const styles = {
    pending_acceptance: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-stone-100'}`}>
      {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
      Order: {status}
    </span>
  );
}

function DeliveryCard({ assignment, acting, onAccept, onUpdateStatus }) {
  const orderStatus = normalizeOrderStatus(assignment.order_status);
  const driverAction = getDriverAction(assignment);
  const waitingForPrepared =
    assignment.delivery_status === 'accepted' && orderStatus === 'Driver Assigned';

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 bg-stone-50 px-4 py-3">
        <div>
          <p className="font-mono text-sm font-semibold">{assignment.order_id}</p>
          <p className="text-xs text-stone-500">{formatDate(assignment.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={orderStatus} />
          <StatusBadge status={assignment.delivery_status} />
        </div>
      </div>

      <div className="grid flex-1 gap-4 p-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Customer</h3>
          <p className="font-medium">{assignment.customer_name}</p>
          <a href={`tel:${assignment.phone}`} className="text-sm text-brand-600 hover:underline">{assignment.phone}</a>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Delivery address</h3>
          {assignment.delivery_address ? (
            <p className="text-sm leading-relaxed text-stone-700">{assignment.delivery_address}</p>
          ) : (
            <p className="text-sm italic text-stone-400">Address not provided</p>
          )}
        </div>
      </div>

      <div className="border-t border-stone-100 px-4 py-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Order items</h3>
        <ul className="divide-y text-sm">
          {assignment.items?.map((item, idx) => (
            <li key={idx} className="flex justify-between py-1.5">
              <span>{item.name} × {item.quantity}</span>
              <span className="text-stone-600">{formatCurrency(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(assignment.total)}</span>
        </div>
        {assignment.notes && (
          <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">
            Note: {assignment.notes}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-stone-100 bg-stone-50 px-4 py-3">
        {waitingForPrepared && (
          <p className="text-xs text-amber-800">
            You accepted this delivery. Head to the restaurant and wait until the admin marks it Prepared.
          </p>
        )}
        {driverAction?.type === 'accept' && (
          <button
            type="button"
            disabled={acting === assignment.order_id}
            onClick={() => onAccept(assignment.order_id)}
            className="btn-primary text-sm"
          >
            {acting === assignment.order_id ? 'Accepting...' : driverAction.label}
          </button>
        )}
        {driverAction?.type === 'status' && (
          <button
            type="button"
            disabled={acting === assignment.order_id}
            onClick={() => onUpdateStatus(assignment.order_id, driverAction.nextStatus)}
            className="btn-primary text-sm"
          >
            {acting === assignment.order_id ? 'Updating...' : driverAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DeliveryDashboardPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    deliveryApi
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
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <button type="button" onClick={load} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {sharing && (
        <div className="card mb-4 flex items-center gap-2 border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live location sharing ON — {activeCount} active delivery{activeCount !== 1 ? 'ies' : ''}
        </div>
      )}
      {locationError && (
        <div className="card mb-4 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Enable location access so customers can track you on the map.
        </div>
      )}
      {liveTrack?.live_tracking_enabled && (
        <div className="card mb-6 overflow-hidden p-0">
          <div className="border-b border-stone-100 px-4 py-3">
            <h2 className="font-semibold">Navigation map</h2>
            <p className="text-xs text-stone-500">Road-following route · updates automatically as you move</p>
          </div>
          <div className="bg-white p-3">
            <LiveDeliveryMap
              restaurant={liveTrack.restaurant}
              destination={liveTrack.destination}
              driver={liveTrack.driver}
              deliveryStatus={liveTrack.delivery_status}
              height="280px"
              followDriver
              framed
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {myDeliveries.length === 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Available orders</h2>
              <p className="mb-4 text-sm text-stone-500">
                Orders appear here after admin clicks <strong>Accept Order</strong> on a delivery order.
                Tap <strong>Accept Delivery</strong> to claim one.
              </p>
              {availableOrders.length === 0 ? (
                <EmptyState
                  icon="delivery"
                  title="No orders available"
                  message="Ask the restaurant admin to accept pending delivery orders. Then refresh this page."
                  compact
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableOrders.map((a) => (
                    <DeliveryCard
                      key={a.id}
                      assignment={a}
                      acting={acting}
                      onAccept={acceptOrder}
                      onUpdateStatus={updateStatus}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">My active deliveries</h2>
            {myDeliveries.length === 0 ? (
              <EmptyState
                icon="orders"
                title="No active deliveries"
                message="Accept an available order to start a delivery."
                compact
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myDeliveries.map((a) => (
                  <DeliveryCard
                    key={a.id}
                    assignment={a}
                    acting={acting}
                    onAccept={acceptOrder}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
}
