import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import { formatCurrency, formatDate } from '../../utils/format';
import { filterOrdersByPhone, formatPhoneDisplay } from '../../utils/phone';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([customerApi.profile(), customerApi.orders()])
      .then(([profileRes, ordersRes]) => {
        const profilePhone = profileRes.data.phone;
        setPhone(profilePhone);
        const items = ordersRes.data.items || [];
        setOrders(filterOrdersByPhone(items, profilePhone));
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadOrders(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const phoneLabel = useMemo(() => formatPhoneDisplay(phone), [phone]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Orders</h1>
          <p className="mt-1 text-sm text-stone-500">
            Only orders placed with your registered mobile number are shown here.
          </p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="orders"
            title={`No orders for ${phoneLabel}`}
            message="Place a new order using the same mobile number on your profile to see it in this list."
            action={
              <Link to="/menu" className="btn-primary px-6 py-2 text-sm">
                Browse Menu
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-order-card flex flex-wrap items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div>
                  <p className="font-semibold text-stone-800">{order.order_id}</p>
                  <p className="text-sm text-stone-500">
                    {order.order_type} · {formatCurrency(order.total)} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <Link
                    to={`/track-order/${order.order_id}`}
                    className="rounded-lg bg-white/50 px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-white/70 backdrop-blur-sm transition hover:bg-white/70"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
