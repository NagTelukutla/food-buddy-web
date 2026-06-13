import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import StatusBadge from '../../components/common/StatusBadge';
import ProfileLogoutButton from '../../components/layout/ProfileLogoutButton';
import { customerIcons } from '../../utils/navLinks';
import { formatCurrency, formatDate } from '../../utils/format';
import { useSelectedRestaurant } from '../../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../../utils/restaurantPaths';
import { filterOrdersByPhone, formatPhoneDisplay } from '../../utils/phone';

const quickActions = [
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
    to: '/customer/addresses',
    label: 'Saved Addresses',
    desc: 'View delivery locations',
    icon: <span className="[&_svg]:h-6 [&_svg]:w-6">{customerIcons.location}</span>,
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

export default function CustomerProfilePage() {
  const { selectedRestaurant } = useSelectedRestaurant();
  const menuPath = getSelectedRestaurantMenuPath(selectedRestaurant);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loadProfile = () => {
    setLoading(true);
    Promise.all([customerApi.profile(), customerApi.orders()])
      .then(([profileRes, ordersRes]) => {
        const profileData = profileRes.data;
        setProfile(profileData);
        setOrders(filterOrdersByPhone(ordersRes.data.items || [], profileData.phone));
        reset({
          name: profileData.name,
          email: profileData.email || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { data: updated } = await customerApi.updateProfile({
        name: data.name,
        email: data.email || null,
      });
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="card overflow-hidden p-0">
          <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25 hover:ring-white/40"
                aria-label="Edit profile"
                title="Edit profile"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold ring-2 ring-white/30">
                {getInitials(profile.name)}
              </span>

              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 w-full max-w-md space-y-4 text-left">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brand-50">Full Name</label>
                    <input
                      className="input-field"
                      {...register('name', { required: 'Name is required', minLength: 2 })}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-200">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brand-50">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-200">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brand-50">Mobile Number</label>
                    <p className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-brand-50">
                      {formatPhoneDisplay(profile.phone)}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        reset({
                          name: profile.name,
                          email: profile.email || '',
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 w-full min-w-0 max-w-md">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <p className="mt-1 truncate text-sm text-brand-100" title={profile.email || 'No email added'}>
                    {profile.email || 'No email added'}
                  </p>
                  <p className="mt-1 text-sm text-brand-50">{formatPhoneDisplay(profile.phone)}</p>
                  <p className="mt-2 text-xs text-brand-200">Member since {formatDate(profile.created_at)}</p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {profile.loyalty_points_balance} loyalty points
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-800">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="group card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
              >
                {action.icon && (
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                    {action.icon}
                  </span>
                )}
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
                  className="glass-order-card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
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

        <ProfileLogoutButton />
      </div>
    </PageContainer>
  );
}
