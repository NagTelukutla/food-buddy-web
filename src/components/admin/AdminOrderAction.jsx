import { getAdminStatusButton } from '../../utils/orderWorkflow';

export default function AdminOrderAction({ order, acting, onAction }) {
  const statusButton = getAdminStatusButton(order);
  if (!statusButton) {
    return <span className="text-xs text-stone-400">—</span>;
  }
  if (statusButton.disabled) {
    return (
      <button
        type="button"
        disabled
        className="cursor-not-allowed whitespace-nowrap rounded-lg border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-500"
      >
        {statusButton.label}
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={acting === order.id}
      onClick={(e) => {
        e.stopPropagation();
        onAction(order.id, statusButton.nextStatus);
      }}
      className="btn-primary whitespace-nowrap py-1.5 text-xs disabled:opacity-50"
    >
      {acting === order.id ? 'Updating...' : statusButton.label}
    </button>
  );
}
