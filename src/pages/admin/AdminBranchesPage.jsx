import { useEffect, useState } from 'react';
import { restaurantApi } from '../../api/restaurantApi';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useRestaurantId } from '../../hooks/useRestaurantId';

export default function AdminBranchesPage() {
  const restaurantId = useRestaurantId();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const load = () => {
    if (!restaurantId) return;
    restaurantApi.branches(restaurantId).then(({ data }) => setBranches(data.items || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [restaurantId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    await restaurantApi.createBranch(restaurantId, { ...form, restaurant_id: restaurantId });
    setForm({ name: '', address: '', phone: '' });
    load();
  };

  return (
    <div>
      <AdminPageHeader title="Branches" breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Branches' }]} />
      <form onSubmit={handleCreate} className="card mb-6 grid gap-3 p-4 sm:grid-cols-4">
        <input className="input-field" placeholder="Branch name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-field sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <button type="submit" className="btn-primary">Add Branch</button>
      </form>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className="card p-4">
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-stone-500">{b.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
