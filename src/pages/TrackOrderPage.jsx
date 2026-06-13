import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { deliveryApi } from '../api/restaurantApi';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import OrderTracker from '../components/order/OrderTracker';
import { formatCurrency, formatDate } from '../utils/format';
import { useDeliveryLocation } from '../context/DeliveryLocationContext';

const LiveDeliveryMap = lazy(() => import('../components/delivery/LiveDeliveryMap'));

const DELIVERY_STATUS_LABELS = {
  pending_acceptance: 'Awaiting driver assignment',
  accepted: 'Driver assigned — heading to restaurant',
  out_for_delivery: 'On the way to you',
  delivered: 'Delivered',
};

export default function TrackOrderPage() {
  const { id } = useParams();
  const { deliveryLocation } = useDeliveryLocation();
  const [order, setOrder] = useState(null);
  const [liveTrack, setLiveTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(() => {
    setError(null);
    return orderApi
      .track(id)
      .then(({ data }) => {
        setOrder(data);
        return data;
      })
      .catch(() => {
        setError('Order not found. Please check your order ID.');
        return null;
      });
  }, [id]);

  const fetchLiveTrack = useCallback(() => {
    return deliveryApi
      .liveTrack(id)
      .then(({ data }) => setLiveTrack(data))
      .catch(() => setLiveTrack(null));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOrder(), fetchLiveTrack()]).finally(() => setLoading(false));
  }, [fetchOrder, fetchLiveTrack]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder().then((data) => {
        if (data?.order_type === 'Delivery') fetchLiveTrack();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder, fetchLiveTrack]);

  const showLiveMap =
    order?.order_type === 'Delivery' &&
    (liveTrack?.live_tracking_enabled || liveTrack?.driver);

  const orderSubtotal = order?.items?.reduce((sum, item) => sum + item.line_total, 0) ?? 0;
  const orderTax =
    order?.tax ?? Math.max(0, Math.round((order?.total - orderSubtotal) * 100) / 100);
  const restaurantName = order?.restaurant_name || liveTrack?.restaurant_name;

  return (
    <PageContainer>
      <PageTitle>Track Order</PageTitle>
      {restaurantName && (
        <p className="-mt-2 text-sm font-semibold text-brand-700">{restaurantName}</p>
      )}
      <p className={`${restaurantName ? 'mt-1' : '-mt-2'} mb-6 break-all font-mono text-sm text-stone-500`}>
        Order ID: {id}
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorState message={error} onRetry={() => { setLoading(true); Promise.all([fetchOrder(), fetchLiveTrack()]).finally(() => setLoading(false)); }} />}
      {order && (
        <div className="space-y-6">
          {showLiveMap && liveTrack && (
            <div className="card overflow-hidden p-0">
              <div className="border-b border-stone-100 px-4 py-3">
                <h3 className="font-semibold text-stone-900">Live delivery map</h3>
                <p className="text-xs text-stone-500">
                  {liveTrack.driver
                    ? `${liveTrack.driver.partner_name || 'Driver'} is on the way · updates every 5s`
                    : 'Waiting for driver location… Allow location on driver device.'}
                </p>
                {liveTrack.delivery_status && (
                  <p className="mt-1 text-sm font-medium text-brand-700">
                    {DELIVERY_STATUS_LABELS[liveTrack.delivery_status] || liveTrack.delivery_status}
                  </p>
                )}
              </div>
              <div className="glass-surface-soft p-3">
                <Suspense
                  fallback={
                    <div className="flex min-h-[220px] items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  <LiveDeliveryMap
                    restaurant={liveTrack.restaurant}
                    destination={
                      (deliveryLocation?.latitude && deliveryLocation?.longitude)
                        ? {
                            latitude: deliveryLocation.latitude,
                            longitude: deliveryLocation.longitude,
                            label: deliveryLocation.address || 'Delivery address',
                          }
                        : liveTrack.destination
                    }
                    driver={liveTrack.driver}
                    deliveryStatus={liveTrack.delivery_status}
                    deliveryAddress={deliveryLocation?.address || liveTrack.delivery_address}
                    followDriver={!!liveTrack.driver}
                    statusLabel={
                      DELIVERY_STATUS_LABELS[liveTrack.delivery_status] || 'Order is on the way'
                    }
                    framed
                  />
                </Suspense>
              </div>
              {(deliveryLocation?.address || liveTrack.delivery_address) && (
                <p className="border-t border-white/35 px-4 py-2 text-xs text-stone-600">
                  Delivering to: {deliveryLocation?.address || liveTrack.delivery_address}
                </p>
              )}
            </div>
          )}

          <div className="card">
            <OrderTracker status={order.status} orderType={order.order_type} />
          </div>
          <div className="card">
            <h3 className="mb-4 font-semibold">Order Details</h3>
            <dl className="mb-4 space-y-3 text-sm">
              {restaurantName && (
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-stone-500">Restaurant</dt>
                  <dd className="text-right font-medium">{restaurantName}</dd>
                </div>
              )}
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-stone-500">Customer</dt>
                <dd className="text-right font-medium">{order.customer_name}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-stone-500">Type</dt>
                <dd>{order.order_type}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-stone-500">Placed</dt>
                <dd className="text-right">{formatDate(order.created_at)}</dd>
              </div>
            </dl>
            <ul className="divide-y border-t border-stone-100 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <span className="min-w-0 flex-1">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">{formatCurrency(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-3 border-t border-stone-100 pt-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-stone-500">Subtotal</dt>
                <dd className="font-medium">{formatCurrency(orderSubtotal)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-stone-500">Tax</dt>
                <dd className="font-medium">{formatCurrency(orderTax)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-t border-stone-100 pt-3 text-base font-bold">
                <dt>Total Amount</dt>
                <dd className="text-brand-700">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
