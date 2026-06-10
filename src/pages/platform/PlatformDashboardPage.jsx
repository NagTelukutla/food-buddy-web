import { useEffect, useState } from 'react';
import { platformApi } from '../../api/restaurantApi';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PlatformDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.stats().then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Super Admin Dashboard</h1>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active restaurants" value={stats.active_restaurants} icon="restaurants" />
            <StatCard title="Total orders" value={stats.total_orders} icon="orders" />
            <StatCard title="GMV" value={stats.total_gmv} isCurrency icon="gmv" />
            <StatCard title="Customers" value={stats.total_customers} icon="customers" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/platform/restaurants" className="card p-4 hover:border-brand-300">
              <p className="font-semibold">Onboard Restaurant</p>
              <p className="text-sm text-stone-500">Create restaurant, owner account & default branch</p>
            </Link>
            <Link to="/platform/users" className="card p-4 hover:border-brand-300">
              <p className="font-semibold">Manage Users</p>
              <p className="text-sm text-stone-500">Admins, delivery partners, and customers</p>
            </Link>
            <Link to="/platform/rbac" className="card p-4 hover:border-brand-300">
              <p className="font-semibold">RBAC Policies</p>
              <p className="text-sm text-stone-500">Role permissions and access rules</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
