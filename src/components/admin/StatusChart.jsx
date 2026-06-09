import EmptyState from '../common/EmptyState';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatusChart({ data }) {
  if (!data?.length) {
    return (
      <EmptyState
        compact
        icon="orders"
        title="No order data"
        message="Order status breakdown will show up as orders come in."
      />
    );
  }
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const percent = total ? Math.round((item.count / total) * 100) : 0;
        const color = STATUS_COLORS[item.status]?.split(' ')[0] || 'bg-stone-200';
        return (
          <div key={item.status}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{item.status}</span>
              <span className="text-stone-500">
                {item.count} ({percent}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
