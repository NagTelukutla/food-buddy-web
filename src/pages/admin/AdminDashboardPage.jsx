import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import RevenueChart from '../../components/admin/RevenueChart';
import StatCard from '../../components/admin/StatCard';
import StatusChart from '../../components/admin/StatusChart';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import { formatCurrency } from '../../utils/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, revenueRes, statusRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.revenue(7),
        dashboardApi.ordersByStatus(),
      ]);
      setStats(statsRes.data);
      setRevenue(revenueRes.data.data);
      setStatusData(statusRes.data.orders_by_status);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Dashboard' }]}
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Today's Orders" value={stats.today_orders} icon="📋" />
        <StatCard title="Today's Revenue" value={stats.today_revenue} isCurrency icon="💰" />
        <StatCard title="Pending" value={stats.pending_orders} icon="⏳" />
        <StatCard title="Completed" value={stats.completed_orders} icon="✅" />
        <StatCard title="Avg Order Value" value={stats.average_order_value} isCurrency icon="📈" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">Daily Revenue (7 days)</h3>
          <RevenueChart data={revenue} />
        </div>
        <div className="card">
          <h3 className="mb-4 font-semibold">Orders by Status</h3>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold">Popular Menu Items Today</h3>
        {stats.popular_items?.length ? (
          <ul className="divide-y">
            {stats.popular_items.map((item) => (
              <li key={item.name} className="flex justify-between py-2 text-sm">
                <span>{item.name}</span>
                <span className="font-medium">{item.quantity} sold</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon="chart"
            title="No sales data for today"
            message="Popular items will appear here once orders start coming in."
          />
        )}
      </div>
    </div>
  );
}
