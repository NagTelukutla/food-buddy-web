import { useEffect, useState } from 'react';
import { campaignApi } from '../../api/restaurantApi';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useRestaurantId } from '../../hooks/useRestaurantId';

export default function AdminCampaignsPage() {
  const restaurantId = useRestaurantId();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    campaignApi.list(restaurantId).then(({ data }) => setCampaigns(data.items || [])).finally(() => setLoading(false));
  }, [restaurantId]);

  const handleCreate = async () => {
    if (!restaurantId) return;
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 86400000);
    await campaignApi.create({
      restaurant_id: restaurantId,
      title: 'Weekend Special',
      discount_type: 'percentage',
      discount_value: 10,
      target_segment: 'all',
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      status: 'active',
    });
    const { data } = await campaignApi.list(restaurantId);
    setCampaigns(data.items || []);
  };

  return (
    <div>
      <AdminPageHeader title="Campaigns" action={<button type="button" onClick={handleCreate} className="btn-primary">Create sample campaign</button>} />
      {loading ? (
        <LoadingSpinner />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon="campaign"
          title="No campaigns yet"
          message="Create your first promotion to attract more customers."
          action={
            <button type="button" onClick={handleCreate} className="btn-primary px-6 py-2 text-sm">
              Create sample campaign
            </button>
          }
        />
      ) : (
        campaigns.map((c) => (
          <div key={c.id} className="card mb-2 p-4">
            <p className="font-semibold">{c.title}</p>
            <p className="text-sm text-stone-500">{c.discount_type} {c.discount_value} · {c.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
