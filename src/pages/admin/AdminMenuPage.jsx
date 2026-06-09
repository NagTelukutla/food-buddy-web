import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { menuApi } from '../../api/menuApi';
import MenuFormModal from '../../components/admin/MenuFormModal';
import EmptyState from '../../components/common/EmptyState';
import Toggle from '../../components/common/Toggle';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import { formatCurrency } from '../../utils/format';

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconActionButton({ label, onClick, variant = 'edit' }) {
  const styles =
    variant === 'delete'
      ? 'text-red-600 hover:bg-red-50'
      : 'text-brand-600 hover:bg-brand-50';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${styles}`}
    >
      {variant === 'delete' ? <DeleteIcon /> : <EditIcon />}
    </button>
  );
}

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await menuApi.list();
      setItems(data.items);
    } catch {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        available: !!formData.available,
      };
      if (editing) {
        await menuApi.update(editing.id, payload);
        toast.success('Menu item updated');
      } else {
        await menuApi.create(payload);
        toast.success('Menu item created');
      }
      setModalOpen(false);
      setEditing(null);
      fetchMenu();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await menuApi.delete(id);
      toast.success('Deleted');
      fetchMenu();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await menuApi.update(item.id, { available: !item.available });
      fetchMenu();
      toast.success(`Item ${item.available ? 'unavailable' : 'available'}`);
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Menu Management"
        breadcrumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Menu' }]}
        action={
          <button
            type="button"
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="btn-primary w-full py-2.5 sm:w-auto"
          >
            + Add Item
          </button>
        }
      />

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorState message={error} onRetry={fetchMenu} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon="menu" title="No menu items" message="Add your first dish to get started." />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="card">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="shrink-0 font-semibold text-brand-700">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="mb-3 text-sm text-stone-500">{item.category}</p>
                <div className="mb-3">
                  <Toggle
                    label="Available on menu"
                    checked={item.available}
                    onChange={() => toggleAvailability(item)}
                  />
                </div>
                <div className="flex justify-end gap-1 border-t border-stone-100 pt-3">
                  <IconActionButton
                    label="Edit item"
                    onClick={() => { setEditing(item); setModalOpen(true); }}
                  />
                  <IconActionButton
                    label="Delete item"
                    variant="delete"
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border border-stone-200 bg-white md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={item.available}
                        onChange={() => toggleAvailability(item)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconActionButton
                          label="Edit item"
                          onClick={() => { setEditing(item); setModalOpen(true); }}
                        />
                        <IconActionButton
                          label="Delete item"
                          variant="delete"
                          onClick={() => handleDelete(item.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalOpen && (
        <MenuFormModal
          item={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  );
}
