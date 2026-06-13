import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi';
import AdminOrderAction from '../../components/admin/AdminOrderAction';
import AdminOrderDetailsContent from '../../components/admin/AdminOrderDetailsContent';
import GlassSelect from '../../components/common/GlassSelect';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ModalShell from '../../components/common/ModalShell';
import StatusBadge from '../../components/common/StatusBadge';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/format';
import { normalizeOrderStatus } from '../../utils/orderWorkflow';

const PAGE_SIZE = 8;

function mergeOrders(existing, incoming) {
  const ids = new Set(existing.map((order) => order.id));
  return [...existing, ...incoming.filter((order) => !ids.has(order.id))];
}

function syncSelection(items, setSelected, setMobileDetailOrder) {
  if (items.length === 0) {
    setSelected(null);
    setMobileDetailOrder(null);
    return;
  }
  setSelected((prev) => {
    const match = prev ? items.find((order) => order.id === prev.id) : null;
    return match ?? items[0];
  });
  setMobileDetailOrder((prev) => {
    if (!prev) return prev;
    return items.find((order) => order.id === prev.id) ?? prev;
  });
}

function OrderInfoButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-icon-btn !h-5 !w-5 shrink-0 !rounded-lg text-stone-500 hover:text-brand-700 ${className}`}
      aria-label="View order details"
      title="Order details"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
}

function LoadMoreIndicator({ loadingMore, hasMore, loadedCount, total }) {
  if (loadingMore) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  if (!hasMore && loadedCount > 0) {
    return (
      <p className="py-3 text-center text-xs text-stone-400">
        Showing all {total} order{total !== 1 ? 's' : ''}
      </p>
    );
  }
  return <div className="h-2" aria-hidden />;
}

function InfiniteScrollFooter({ hasMore, loading, loadingMore, onLoadMore, loadedCount, total }) {
  const sentinelRef = useInfiniteScroll(onLoadMore, {
    enabled: hasMore && !loading && !loadingMore,
  });

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
      <LoadMoreIndicator
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadedCount={loadedCount}
        total={total}
      />
    </>
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mobileDetailOrder, setMobileDetailOrder] = useState(null);
  const [acting, setActing] = useState(null);

  const hasMore = page < totalPages;

  const listParams = useCallback(
    (pageNum, pageSize = PAGE_SIZE) => ({
      page: pageNum,
      page_size: pageSize,
      status: statusFilter || undefined,
      search: search || undefined,
    }),
    [search, statusFilter],
  );

  const fetchFirstPage = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const { data } = await orderApi.list(listParams(1));
      setOrders(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(1);
      syncSelection(data.items, setSelected, setMobileDetailOrder);
    } catch {
      if (!silent) setError('Failed to load orders');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [listParams]);

  const refreshLoadedOrders = useCallback(async () => {
    try {
      const pageSize = PAGE_SIZE * page;
      const { data } = await orderApi.list(listParams(1, pageSize));
      setOrders(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      syncSelection(data.items, setSelected, setMobileDetailOrder);
    } catch {
      /* ignore background refresh errors */
    }
  }, [listParams, page]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data } = await orderApi.list(listParams(nextPage));
      setOrders((prev) => mergeOrders(prev, data.items));
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(nextPage);
    } catch {
      toast.error('Failed to load more orders');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, listParams, loading, loadingMore, page]);

  const closeMobileDetail = useCallback(() => {
    if (window.history.state?.adminOrderModal) {
      window.history.back();
      return;
    }
    setMobileDetailOrder(null);
  }, []);

  const openMobileDetail = useCallback((order) => {
    setMobileDetailOrder(order);
  }, []);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshLoadedOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshLoadedOrders]);

  useEffect(() => {
    if (!mobileDetailOrder) return undefined;

    const onPopState = () => setMobileDetailOrder(null);
    window.history.pushState({ adminOrderModal: true }, '');
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [mobileDetailOrder]);

  const handleAdminAction = async (orderPk, newStatus) => {
    setActing(orderPk);
    try {
      await orderApi.updateStatus(orderPk, newStatus);
      toast.success('Order updated');
      await refreshLoadedOrders();
      if (selected?.id === orderPk) {
        const { data } = await orderApi.get(orderPk);
        setSelected(data);
      }
      if (mobileDetailOrder?.id === orderPk) {
        const { data } = await orderApi.get(orderPk);
        setMobileDetailOrder(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order');
    } finally {
      setActing(null);
    }
  };

  const loadedSummary = useMemo(
    () => ({ loadedCount: orders.length, total, hasMore }),
    [orders.length, total, hasMore],
  );

  return (
    <div>
      <AdminPageHeader title="Order Management" />

      <div className="card mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="search"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
        <GlassSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <p className="flex items-center text-sm text-stone-500 sm:col-span-2 lg:col-span-1">
          {loadedSummary.loadedCount} of {total} order{total !== 1 ? 's' : ''} shown
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorState message={error} onRetry={fetchFirstPage} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState icon="orders" title="No orders found" message="Try adjusting your filters." />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col lg:hidden">
            <div className="space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="card relative w-full pr-8 text-left">
                  <OrderInfoButton
                    onClick={() => openMobileDetail(order)}
                    className="absolute right-2.5 top-2.5"
                  />
                  <div className="mb-2 flex items-start justify-between gap-2 pr-1">
                    <span className="break-all font-mono text-xs font-medium">{order.order_id}</span>
                    <StatusBadge status={normalizeOrderStatus(order.status)} />
                  </div>
                  <p className="text-sm font-medium">{order.customer_name}</p>
                  <p className="mt-1 text-xs text-stone-500">{formatDate(order.created_at)}</p>
                  <p className="mt-1 text-sm text-brand-700">{formatCurrency(order.total)}</p>
                  {order.assigned_driver_name && (
                    <p className="mt-1 text-xs text-stone-500">Driver: {order.assigned_driver_name}</p>
                  )}
                  <div className="mt-3">
                    <AdminOrderAction order={order} acting={acting} onAction={handleAdminAction} />
                  </div>
                </article>
              ))}
            </div>
            <InfiniteScrollFooter
              hasMore={hasMore}
              loading={loading}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              loadedCount={loadedSummary.loadedCount}
              total={loadedSummary.total}
            />
          </div>

          <div className="glass-table-wrap hidden flex-col overflow-hidden lg:col-span-2 lg:flex">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="glass-table-head">
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
                      className={`glass-table-row-hover cursor-pointer ${
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
            <InfiniteScrollFooter
              hasMore={hasMore}
              loading={loading}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              loadedCount={loadedSummary.loadedCount}
              total={loadedSummary.total}
            />
          </div>

          <div className="card hidden h-fit lg:block">
            {selected ? (
              <>
                <h3 className="mb-4 font-semibold">Order Details</h3>
                <AdminOrderDetailsContent
                  order={selected}
                  acting={acting}
                  onAction={handleAdminAction}
                />
              </>
            ) : (
              <p className="text-sm text-stone-500">Select an order to view details</p>
            )}
          </div>
        </div>
      )}

      {mobileDetailOrder && (
        <ModalShell title="Order Details" onClose={closeMobileDetail} centered compact>
          <AdminOrderDetailsContent
            order={mobileDetailOrder}
            compact
            showAction={false}
            showDeliveryInfo={false}
          />
        </ModalShell>
      )}
    </div>
  );
}
