import { useEffect, useState } from 'react';
import { platformApi } from '../../api/restaurantApi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/format';

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
            <div className="card p-4"><p className="text-sm text-stone-500">Active restaurants</p><p className="text-2xl font-bold">{stats.active_restaurants}</p></div>
            <div className="card p-4"><p className="text-sm text-stone-500">Total orders</p><p className="text-2xl font-bold">{stats.total_orders}</p></div>
            <div className="card p-4"><p className="text-sm text-stone-500">GMV</p><p className="text-2xl font-bold">{formatCurrency(stats.total_gmv)}</p></div>
            <div className="card p-4"><p className="text-sm text-stone-500">Customers</p><p className="text-2xl font-bold">{stats.total_customers}</p></div>
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
