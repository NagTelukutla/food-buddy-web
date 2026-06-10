import { useEffect, useState } from 'react';
import GlassSelect from '../../components/common/GlassSelect';
import { deliveryApi } from '../../api/restaurantApi';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useRestaurantId } from '../../hooks/useRestaurantId';

const VEHICLE_OPTIONS = [
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'car', label: 'Car' },
];

export default function AdminDeliveryPage() {
  const restaurantId = useRestaurantId();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', vehicle_type: 'bike' });

  const load = () => {
    if (!restaurantId) return;
    deliveryApi.partners(restaurantId).then(({ data }) => setPartners(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [restaurantId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    await deliveryApi.createPartner({ ...form, restaurant_id: restaurantId });
    setForm({ name: '', phone: '', vehicle_type: 'bike' });
    load();
  };

  return (
    <div>
      <AdminPageHeader title="Delivery Partners" />
      <form onSubmit={handleCreate} className="card mb-6 grid gap-3 p-4 sm:grid-cols-4">
        <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <GlassSelect
          value={form.vehicle_type}
          onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
          options={VEHICLE_OPTIONS}
        />
        <button type="submit" className="btn-primary">Add Partner</button>
      </form>
      {loading ? (
        <LoadingSpinner />
      ) : partners.length === 0 ? (
        <EmptyState
          icon="delivery"
          title="No delivery partners yet"
          message="Add your first driver using the form above to start fulfilling deliveries."
        />
      ) : (
        partners.map((p) => (
          <div key={p.id} className="card mb-2 flex justify-between p-4">
            <span>{p.name} · {p.phone}</span>
            <span className="text-sm capitalize text-stone-500">{p.status}</span>
          </div>
        ))
      )}
    </div>
  );
}
