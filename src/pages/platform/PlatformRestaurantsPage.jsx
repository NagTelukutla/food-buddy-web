import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi, usersApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import IconActionButton from '../../components/common/IconActionButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RestaurantAdminMapModal from '../../components/platform/RestaurantAdminMapModal';
import RestaurantFormModal from '../../components/platform/RestaurantFormModal';
import { PlatformPageHeader } from '../../layouts/PlatformLayout';

function matchesSearch(restaurant, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = [restaurant.name, restaurant.phone, restaurant.email, restaurant.address]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function PlatformRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminMapOpen, setAdminMapOpen] = useState(false);
  const [mappingRestaurant, setMappingRestaurant] = useState(null);
  const [adminCounts, setAdminCounts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [restRes, usersRes] = await Promise.all([restaurantApi.list(), usersApi.list()]);
      setRestaurants(restRes.data);
      const counts = {};
      (usersRes.data.items || [])
        .filter((u) => u.role === 'admin' && u.restaurant_id)
        .forEach((u) => {
          counts[u.restaurant_id] = (counts[u.restaurant_id] || 0) + 1;
        });
      setAdminCounts(counts);
    } catch {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => restaurants.filter((r) => matchesSearch(r, search)),
    [restaurants, search],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (restaurant) => {
    setEditing(restaurant);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const openAdminMap = (restaurant) => {
    setMappingRestaurant(restaurant);
    setAdminMapOpen(true);
  };

  const closeAdminMap = () => {
    setAdminMapOpen(false);
    setMappingRestaurant(null);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await restaurantApi.update(editing.id, {
          name: data.restaurant_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          tagline: data.tagline || null,
          cuisine_type: data.cuisine_type || null,
          working_hours: data.working_hours || null,
          is_active: !!data.is_active,
        });
        toast.success('Restaurant updated');
      } else {
        const { data: result } = await restaurantApi.onboard(data);
        toast.success(`Onboarded ${result.restaurant_name} — owner: ${result.owner_username}`);
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PlatformPageHeader
        title="Restaurant Onboarding"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            + Onboard Restaurant
          </button>
        }
      />

      <div className="card mb-4 p-4">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Search by name or phone
        </label>
        <input
          className="input-field"
          placeholder="Search restaurant name, phone, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <EmptyState
              icon="restaurant"
              title="No restaurants found"
              message="Onboard a restaurant or adjust your search."
            />
          )}
          {filtered.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-sm text-stone-500">{r.email} · {r.phone}</p>
                <p className="text-xs text-stone-400">{r.address}</p>
                <p className="mt-1 text-xs text-brand-700">
                  {adminCounts[r.id] || 0} admin{(adminCounts[r.id] || 0) !== 1 ? 's' : ''} mapped
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    r.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-200'
                  }`}
                >
                  {r.is_active ? 'Active' : 'Inactive'}
                </span>
                <IconActionButton
                  variant="settings"
                  label="Map admins to restaurant"
                  onClick={() => openAdminMap(r)}
                />
                <IconActionButton label="Edit restaurant" onClick={() => openEdit(r)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <RestaurantFormModal
        open={modalOpen}
        editing={editing}
        onClose={closeModal}
        onSubmit={onSubmit}
        submitting={submitting}
      />

      <RestaurantAdminMapModal
        open={adminMapOpen}
        restaurant={mappingRestaurant}
        onClose={closeAdminMap}
        onSaved={load}
      />
    </div>
  );
}
