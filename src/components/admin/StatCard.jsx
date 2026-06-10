import { DashboardStatIcon } from '../dashboard/dashboardStatIcons';
import { formatCurrency } from '../../utils/format';

export default function StatCard({ title, value, isCurrency = false, icon, action }) {
  const display = isCurrency ? formatCurrency(value) : value;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="glass-section-title">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900">{display}</p>
        </div>
        {icon && <DashboardStatIcon name={icon} />}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
