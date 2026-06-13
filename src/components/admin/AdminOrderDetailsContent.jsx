import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import { normalizeOrderStatus } from '../../utils/orderWorkflow';
import AdminOrderAction from './AdminOrderAction';

export default function AdminOrderDetailsContent({
  order,
  acting,
  onAction,
  showAction = true,
  showDeliveryInfo = true,
  compact = false,
}) {
  if (!order) return null;

  const textSize = compact ? 'text-xs' : 'text-sm';
  const rowGap = compact ? 'gap-1.5' : 'gap-2';

  return (
    <>
      <dl className={`mb-4 space-y-3 ${textSize}`}>
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Order ID</dt>
          <dd className="break-all text-right font-mono text-xs">{order.order_id}</dd>
        </div>
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Status</dt>
          <dd><StatusBadge status={normalizeOrderStatus(order.status)} /></dd>
        </div>
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Customer</dt>
          <dd className="text-right font-medium text-stone-900">{order.customer_name}</dd>
        </div>
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Phone</dt>
          <dd className="text-right">{order.phone}</dd>
        </div>
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Order type</dt>
          <dd>{order.order_type}</dd>
        </div>
        {showDeliveryInfo && order.order_type === 'Delivery' && order.delivery_address && (
          <div className={`flex flex-col ${rowGap}`}>
            <dt className="text-stone-500">Delivery</dt>
            <dd className="leading-relaxed text-stone-700">{order.delivery_address}</dd>
          </div>
        )}
        {(order.order_type === 'Pickup' || order.order_type === 'Dine In') && order.table_number && (
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">{order.order_type === 'Dine In' ? 'Table' : 'Pickup'}</dt>
            <dd>{order.table_number}</dd>
          </div>
        )}
        {order.assigned_driver_name && (
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">Driver</dt>
            <dd className="text-right">
              {order.assigned_driver_name}
              {order.assigned_driver_phone && (
                <span className="block text-xs text-stone-500">{order.assigned_driver_phone}</span>
              )}
            </dd>
          </div>
        )}
        {order.payment_status && (
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">Payment</dt>
            <dd className="capitalize">{order.payment_status}</dd>
          </div>
        )}
        <div className={`flex flex-wrap justify-between ${rowGap}`}>
          <dt className="text-stone-500">Placed</dt>
          <dd className="text-right">{formatDate(order.created_at)}</dd>
        </div>
        {order.updated_at && order.updated_at !== order.created_at && (
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">Updated</dt>
            <dd className="text-right">{formatDate(order.updated_at)}</dd>
          </div>
        )}
        <div className="space-y-1.5 border-t border-stone-100 pt-3">
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">Subtotal</dt>
            <dd>{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className={`flex flex-wrap justify-between ${rowGap}`}>
            <dt className="text-stone-500">Tax</dt>
            <dd>{formatCurrency(order.tax)}</dd>
          </div>
          <div className={`flex flex-wrap justify-between ${rowGap} font-bold text-stone-900`}>
            <dt>Total</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
        </div>
      </dl>

      {order.notes && (
        <p className={`glass-surface-soft mb-4 p-2.5 ${textSize} leading-relaxed text-stone-600`}>
          <span className="font-semibold text-stone-700">Note: </span>
          {order.notes}
        </p>
      )}

      <div>
        <p className={`mb-2 font-semibold text-stone-800 ${compact ? 'text-xs' : 'text-sm'}`}>
          Order items
        </p>
        <ul className={`divide-y border-t border-stone-100 ${textSize}`}>
          {order.items?.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-2">
              <span className="min-w-0 text-stone-700">
                {item.name}
                <span className="mt-0.5 block text-xs text-stone-500">Qty {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-stone-900">
                {formatCurrency(item.line_total)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showAction && (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <AdminOrderAction order={order} acting={acting} onAction={onAction} />
        </div>
      )}
    </>
  );
}
