import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../../api/restaurantApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ModalShell from '../common/ModalShell';
import RoundedCheckbox from '../common/RoundedCheckbox';

export default function RestaurantAdminMapModal({ open, restaurant, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!restaurant?.id) return;
    setLoading(true);
    try {
      const { data } = await restaurantApi.getAdmins(restaurant.id);
      setAdmins(data.items || []);
      setSelectedIds(new Set(data.mapped_admin_ids || []));
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  useEffect(() => {
    if (open && restaurant) {
      setSearch('');
      load();
    }
  }, [open, restaurant, load]);

  const filteredAdmins = useMemo(() => {
    if (!search.trim()) return admins;
    const q = search.trim().toLowerCase();
    return admins.filter((a) =>
      [a.full_name, a.username, a.email, a.phone].filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [admins, search]);

  const toggleAdmin = (adminId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(adminId);
      else next.delete(adminId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!restaurant?.id) return;
    setSubmitting(true);
    try {
      await restaurantApi.mapAdmins(restaurant.id, { admin_ids: [...selectedIds] });
      toast.success('Admin assignments saved');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save admin mapping');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !restaurant) return null;

  return (
    <ModalShell
      title={`Map admins — ${restaurant.name}`}
      onClose={onClose}
    >
      <p className="mb-4 text-sm text-stone-600">
        Select which admin accounts can manage orders, menu, deliveries, and all operations for this restaurant.
        Only Super Admin can change these assignments.
      </p>

      <div className="mb-4">
        <input
          className="input-field"
          placeholder="Search admins by name, username, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredAdmins.length === 0 ? (
        <p className="rounded-lg bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          {admins.length === 0
            ? 'No admin accounts found. Create admins from the Users screen first.'
            : 'No admins match your search.'}
        </p>
      ) : (
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {filteredAdmins.map((admin) => (
            <RoundedCheckbox
              key={admin.id}
              checked={selectedIds.has(admin.id)}
              disabled={!admin.is_active}
              onChange={(checked) => toggleAdmin(admin.id, checked)}
              label={admin.full_name}
              description={`${admin.username} · ${admin.email}${!admin.is_active ? ' · Inactive' : ''}`}
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <p className="text-sm text-stone-500">
          {selectedIds.size} admin{selectedIds.size !== 1 ? 's' : ''} selected
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={submitting || loading}>
            {submitting ? 'Saving…' : 'Save mapping'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
