import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'bg-stone-100 text-stone-800';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}
