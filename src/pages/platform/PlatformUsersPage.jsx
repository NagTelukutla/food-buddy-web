import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi, usersApi } from '../../api/restaurantApi';
import IconActionButton from '../../components/common/IconActionButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PlatformUserFormModal from '../../components/platform/PlatformUserFormModal';
import { PlatformPageHeader } from '../../layouts/PlatformLayout';
import { ROLES, normalizeRole } from '../../utils/roles';

const TABS = [
  { id: ROLES.ADMIN, label: 'Admins' },
  { id: ROLES.DRIVER, label: 'Delivery Partners' },
  { id: ROLES.CUSTOMER, label: 'Customers' },
];

function matchesSearch(user, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = [user.full_name, user.username, user.phone, user.email]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(ROLES.ADMIN);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, restRes] = await Promise.all([usersApi.list(), restaurantApi.list()]);
      setUsers(usersRes.data.items || []);
      setRestaurants(restRes.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => normalizeRole(u.role) === activeTab)
        .filter((u) => matchesSearch(u, search)),
    [users, activeTab, search],
  );

  const restaurantName = (user) => {
    if (normalizeRole(user.role) === ROLES.ADMIN && !user.restaurant_id) return 'Not mapped';
    const id = user.restaurant_id;
    return restaurants.find((r) => r.id === id)?.name || (id ? `#${id}` : '—');
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const isStaffTab = activeTab === ROLES.ADMIN || activeTab === ROLES.DRIVER;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const role = isStaffTab ? normalizeRole(data.role) : ROLES.CUSTOMER;
      const payload = {
        ...data,
        role,
        restaurant_id:
          role === ROLES.DRIVER && data.restaurant_id ? Number(data.restaurant_id) : null,
        branch_id: role === ROLES.DRIVER && data.branch_id ? Number(data.branch_id) : null,
        is_active: !!data.is_active,
      };
      if (editing) {
        const updatePayload = { ...payload };
        if (!updatePayload.password) delete updatePayload.password;
        delete updatePayload.username;
        await usersApi.update(editing.id, updatePayload);
        toast.success('User updated');
      } else {
        await usersApi.create(payload);
        toast.success(role === ROLES.CUSTOMER ? 'Customer created' : 'Staff onboarded');
      }
      if (!editing && role !== activeTab && isStaffTab) {
        setActiveTab(role);
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
        title="Users"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            {isStaffTab ? '+ Onboard staff' : '+ Add customer'}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card mb-4 p-4">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Search by name or mobile
        </label>
        <input
          className="input-field"
          placeholder="Search name, username, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Restaurant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No users found in this tab.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-stone-500">{u.username} · {u.email}</p>
                    </td>
                    <td className="px-4 py-3">{u.phone || '—'}</td>
                    <td className="px-4 py-3">{restaurantName(u)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <IconActionButton label="Edit user" onClick={() => openEdit(u)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <PlatformUserFormModal
        open={modalOpen}
        editing={editing}
        restaurants={restaurants}
        defaultRole={activeTab}
        showStaffTypeSelector={isStaffTab}
        onClose={closeModal}
        onSubmit={onSubmit}
        submitting={submitting}
      />
    </div>
  );
}
