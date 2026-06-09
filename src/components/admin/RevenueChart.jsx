import EmptyState from '../common/EmptyState';

export default function RevenueChart({ data }) {
  if (!data?.length) {
    return (
      <EmptyState
        compact
        icon="chart"
        title="No revenue data"
        message="Revenue trends will appear here once orders are placed."
      />
    );
  }
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((point) => {
        const height = Math.max((point.revenue / maxRevenue) * 100, 4);
        return (
          <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-brand-500 transition-all"
              style={{ height: `${height}%` }}
              title={`₹${point.revenue}`}
            />
            <span className="text-[10px] text-stone-500">
              {point.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
