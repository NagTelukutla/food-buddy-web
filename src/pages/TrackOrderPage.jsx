import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { deliveryApi } from '../api/restaurantApi';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import LiveDeliveryMap from '../components/delivery/LiveDeliveryMap';
import OrderTracker from '../components/order/OrderTracker';
import { formatCurrency, formatDate } from '../utils/format';

const DELIVERY_STATUS_LABELS = {
  pending_acceptance: 'Awaiting driver assignment',
  accepted: 'Driver assigned — heading to restaurant',
  out_for_delivery: 'On the way to you',
  delivered: 'Delivered',
};

export default function TrackOrderPage() {
  const { id } = useParams();
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

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />
      <PageTitle>Track Order</PageTitle>
      <p className="-mt-2 mb-6 break-all font-mono text-sm text-stone-500">Order ID: {id}</p>

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
              <div className="bg-white p-3">
                <LiveDeliveryMap
                  restaurant={liveTrack.restaurant}
                  destination={liveTrack.destination}
                  driver={liveTrack.driver}
                  deliveryStatus={liveTrack.delivery_status}
                  followDriver={!!liveTrack.driver}
                  framed
                />
              </div>
              {liveTrack.delivery_address && (
                <p className="border-t border-stone-100 px-4 py-2 text-xs text-stone-600">
                  Delivering to: {liveTrack.delivery_address}
                </p>
              )}
            </div>
          )}

          <div className="card">
            <OrderTracker status={order.status} orderType={order.order_type} />
            {order.delivery_status && (
              <p className="mt-3 text-sm text-stone-600">
                Delivery: <span className="font-medium capitalize">{order.delivery_status.replace(/_/g, ' ')}</span>
              </p>
            )}
          </div>
          <div className="card">
            <h3 className="mb-4 font-semibold">Order Details</h3>
            <dl className="mb-4 space-y-3 text-sm">
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
              <div className="flex flex-wrap justify-between gap-2 border-t border-stone-100 pt-3 font-bold">
                <dt>Total</dt>
                <dd className="text-brand-700">{formatCurrency(order.total)}</dd>
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
          </div>
        </div>
      )}
    </PageContainer>
  );
}
