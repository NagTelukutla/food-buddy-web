import { Link, useLocation, Navigate } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../utils/restaurantPaths';
import { formatCurrency, formatDate } from '../utils/format';

export default function OrderSuccessPage() {
  const location = useLocation();
  const { selectedRestaurant } = useSelectedRestaurant();
  const menuPath = getSelectedRestaurantMenuPath(selectedRestaurant);
  const order = location.state?.order;
  const payment = location.state?.payment;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer className="text-center">
      <div className="mb-6 text-5xl sm:text-6xl">✅</div>
      <h1 className="mb-2 text-2xl font-bold text-green-700 sm:text-3xl">
        {payment?.status === 'paid' ? 'Payment Successful!' : 'Order Placed!'}
      </h1>
      <p className="mb-6 text-stone-600">
        Thank you, {order.customer_name}. Your order has been received
        {payment?.status === 'paid' ? ' and payment is confirmed.' : '.'}
      </p>
      <div className="card mb-8 text-left">
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-500">Order ID</dt>
            <dd className="break-all font-mono font-semibold">{order.order_id}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-500">Total</dt>
            <dd className="font-bold text-brand-700">{formatCurrency(order.total)}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-500">Order Status</dt>
            <dd>{order.status}</dd>
          </div>
          {(order.payment_status || payment?.status) && (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-stone-500">Payment</dt>
              <dd className="capitalize text-green-700">
                {payment?.method
                  ? `${payment.status} (${payment.method.toUpperCase()})`
                  : order.payment_status || payment?.status}
              </dd>
            </div>
          )}
          {payment?.razorpay_payment_id && (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-stone-500">Transaction ID</dt>
              <dd className="break-all font-mono text-xs">{payment.razorpay_payment_id}</dd>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-500">Placed at</dt>
            <dd className="text-right">{formatDate(order.created_at)}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={`/track-order/${order.order_id}`} className="btn-primary w-full py-3 sm:w-auto">
          Track Order
        </Link>
        <Link to={menuPath} className="btn-secondary w-full py-3 sm:w-auto">
          Continue Shopping
        </Link>
      </div>
    </PageContainer>
  );
}
