import { formatCurrency } from '../../utils/format';

export default function StatCard({ title, value, isCurrency = false, icon }) {
  const display = isCurrency ? formatCurrency(value) : value;
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{display}</p>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  );
}
