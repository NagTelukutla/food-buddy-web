import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/restaurantApi';
import StatCard from '../../components/admin/StatCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import StatusBadge from '../../components/common/StatusBadge';
import { useSelectedRestaurant } from '../../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../../utils/restaurantPaths';
import { formatCurrency, formatDate } from '../../utils/format';
import { filterOrdersByPhone, formatPhoneDisplay } from '../../utils/phone';

const quickActions = [
  {
    id: 'menu',
    label: 'Browse Menu',
    desc: 'Order your favourites',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'from-brand-500 to-brand-700',
  },
  {
    to: '/customer/orders',
    label: 'Order History',
    desc: 'Track past orders',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    to: '/customer/loyalty',
    label: 'Loyalty Rewards',
    desc: 'Earn & redeem points',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H5.5M12 8h4.5a2.5 2.5 0 010 5H12m0 0v5m0-5H8.5a2.5 2.5 0 000 5H12" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
  },
  {
    to: '/customer/profile',
    label: 'My Profile',
    desc: 'Update your details',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-700',
  },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function CustomerDashboardPage() {
  const { selectedRestaurant } = useSelectedRestaurant();
  const menuPath = getSelectedRestaurantMenuPath(selectedRestaurant);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([customerApi.profile(), customerApi.orders()])
      .then(([profileRes, ordersRes]) => {
        const profile = profileRes.data;
        setProfile(profile);
        setOrders(filterOrdersByPhone(ordersRes.data.items || [], profile.phone));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }
  if (!profile) return null;

  const recentOrders = orders.slice(0, 3);
  const memberSince = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(profile.created_at)
  );

  return (
    <PageContainer>
    <div className="space-y-8">
      <section className="glass-hero-banner">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm ring-2 ring-white/30">
              {getInitials(profile.name)}
            </span>
            <div>
              <p className="text-sm font-medium text-brand-100">Welcome back</p>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{profile.name}</h1>
              <p className="mt-1 text-sm text-brand-100">
                {formatPhoneDisplay(profile.phone)} · Member since {memberSince}
              </p>
            </div>
          </div>
          <Link
            to={menuPath}
            className="btn-hero-primary shrink-0 px-5 py-2.5 text-sm"
          >
            {selectedRestaurant ? 'Order Now' : 'Discover Restaurants'}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Loyalty Points"
          value={profile.loyalty_points_balance}
          icon="loyalty"
          action={
            <Link to="/customer/loyalty" className="inline-block text-xs font-medium text-brand-600 hover:underline">
              View rewards →
            </Link>
          }
        />
        <StatCard
          title={`Orders on ${formatPhoneDisplay(profile.phone)}`}
          value={orders.length}
          icon="orders"
          action={
            <Link to="/customer/orders" className="inline-block text-xs font-medium text-indigo-600 hover:underline">
              View history →
            </Link>
          }
        />
        <StatCard
          title="Saved Addresses"
          value={profile.addresses?.length || 0}
          icon="addresses"
          action={
            <Link to="/customer/profile" className="inline-block text-xs font-medium text-emerald-600 hover:underline">
              Manage profile →
            </Link>
          }
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-800">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.id || action.to}
              to={action.id === 'menu' ? menuPath : action.to}
              className="group card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                {action.icon}
              </span>
              <div>
                <p className="font-semibold text-stone-800 group-hover:text-brand-700">{action.label}</p>
                <p className="mt-0.5 text-xs text-stone-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Recent Orders</h2>
            <p className="text-xs text-stone-500">Filtered by {formatPhoneDisplay(profile.phone)}</p>
          </div>
          {orders.length > 0 && (
            <Link to="/customer/orders" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon="orders"
            title="No orders yet"
            message="Start exploring our menu and place your first order."
            action={
              <Link to={menuPath} className="btn-primary px-6 py-2 text-sm">
                {selectedRestaurant ? 'Browse Menu' : 'Discover Restaurants'}
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-brand-200"
              >
                <div>
                  <p className="font-semibold text-stone-800">{order.order_id}</p>
                  <p className="text-sm text-stone-500">
                    {order.order_type} · {formatCurrency(order.total)} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <Link to={`/track-order/${order.order_id}`} className="text-sm font-medium text-brand-600 hover:underline">
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </PageContainer>
  );
}
