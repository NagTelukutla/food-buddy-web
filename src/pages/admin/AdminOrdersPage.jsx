import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/format';
import { getAdminStatusButton, normalizeOrderStatus } from '../../utils/orderWorkflow';

function OrdersPagination({ page, totalPages, onPageChange, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary text-xs disabled:opacity-50 sm:flex-none sm:text-sm"
      >
        Previous
      </button>
      <span className="text-xs text-stone-500 sm:text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary text-xs disabled:opacity-50 sm:flex-none sm:text-sm"
      >
        Next
      </button>
    </div>
  );
}

function AdminOrderAction({ order, acting, onAction }) {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const { data } = await orderApi.list({
        page,
        page_size: 8,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setOrders(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      if (data.items.length > 0) {
        setSelected((prev) => {
          const match = prev ? data.items.find((o) => o.id === prev.id) : null;
          return match ?? data.items[0];
        });
      } else {
        setSelected(null);
      }
    } catch {
      if (!silent) setError('Failed to load orders');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAdminAction = async (orderPk, newStatus) => {
    setActing(orderPk);
    try {
      await orderApi.updateStatus(orderPk, newStatus);
      toast.success('Order updated');
      fetchOrders();
      if (selected?.id === orderPk) {
        const { data } = await orderApi.get(orderPk);
        setSelected(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order');
    } finally {
      setActing(null);
    }
  };

  const selectedStatusButton = selected ? getAdminStatusButton(selected) : null;

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        breadcrumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Orders' }]}
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="search"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="flex items-center text-sm text-stone-500 sm:col-span-2 lg:col-span-1">
          {total} order{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorState message={error} onRetry={fetchOrders} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState icon="orders" title="No orders found" message="Try adjusting your filters." />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex min-h-[32rem] flex-col lg:hidden">
            <div className="flex-1 space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelected(order)}
                  className={`card w-full text-left ${
                    selected?.id === order.id ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="break-all font-mono text-xs font-medium">{order.order_id}</span>
                    <StatusBadge status={normalizeOrderStatus(order.status)} />
                  </div>
                  <p className="text-sm font-medium">{order.customer_name}</p>
                  <p className="mt-1 text-sm text-brand-700">{formatCurrency(order.total)}</p>
                  {order.assigned_driver_name && (
                    <p className="mt-1 text-xs text-stone-500">Driver: {order.assigned_driver_name}</p>
                  )}
                  <div className="mt-3" onClick={(e) => e.stopPropagation()} role="presentation">
                    <AdminOrderAction order={order} acting={acting} onAction={handleAdminAction} />
                  </div>
                </button>
              ))}
            </div>
            <OrdersPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-auto shrink-0 border-t border-stone-200 bg-white px-1 pt-4 [&_button]:flex-1"
            />
          </div>

          <div className="hidden min-h-[32rem] flex-col overflow-hidden rounded-xl border bg-white lg:col-span-2 lg:flex">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`cursor-pointer hover:bg-stone-50 ${
                        selected?.id === order.id ? 'bg-brand-50' : ''
                      }`}
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{order.order_id}</td>
                      <td className="px-4 py-3">{order.customer_name}</td>
                      <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={normalizeOrderStatus(order.status)} />
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {order.assigned_driver_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <AdminOrderAction order={order} acting={acting} onAction={handleAdminAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <OrdersPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-auto shrink-0 border-t px-4 py-3"
            />
          </div>

          <div className={`card h-fit ${selected ? '' : 'hidden lg:block'}`}>
            {selected ? (
              <>
                <h3 className="mb-4 font-semibold">Order Details</h3>
                <dl className="mb-4 space-y-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">ID</dt>
                    <dd className="break-all text-right font-mono text-xs">{selected.order_id}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">Status</dt>
                    <dd><StatusBadge status={normalizeOrderStatus(selected.status)} /></dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">Customer</dt>
                    <dd>{selected.customer_name}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">Phone</dt>
                    <dd>{selected.phone}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">Type</dt>
                    <dd>{selected.order_type}</dd>
                  </div>
                  {selected.assigned_driver_name && (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-stone-500">Driver</dt>
                      <dd className="text-right">
                        {selected.assigned_driver_name}
                        {selected.assigned_driver_phone && (
                          <span className="block text-xs text-stone-500">{selected.assigned_driver_phone}</span>
                        )}
                      </dd>
                    </div>
                  )}
                  {selected.payment_status && (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-stone-500">Payment</dt>
                      <dd className="capitalize">{selected.payment_status}</dd>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-stone-500">Placed</dt>
                    <dd className="text-right">{formatDate(selected.created_at)}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 border-t border-stone-100 pt-2 font-bold">
                    <dt>Total</dt>
                    <dd>{formatCurrency(selected.total)}</dd>
                  </div>
                </dl>
                {selected.notes && (
                  <p className="mb-4 rounded bg-stone-50 p-2 text-sm text-stone-600">
                    Note: {selected.notes}
                  </p>
                )}
                <ul className="divide-y border-t text-sm">
                  {selected.items?.map((item) => (
                    <li key={item.id} className="flex justify-between py-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatCurrency(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
                {selectedStatusButton && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <AdminOrderAction
                      order={selected}
                      acting={acting}
                      onAction={handleAdminAction}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-stone-500">Select an order to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
