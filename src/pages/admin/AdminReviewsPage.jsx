import { useEffect, useState } from 'react';
import { reviewApi } from '../../api/restaurantApi';
import { AdminPageHeader } from '../../layouts/AdminLayout';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useRestaurantId } from '../../hooks/useRestaurantId';

export default function AdminReviewsPage() {
  const restaurantId = useRestaurantId();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    reviewApi.list(restaurantId).then(({ data }) => setReviews(data.items || [])).finally(() => setLoading(false));
  }, [restaurantId]);

  const respond = async (id) => {
    const text = prompt('Your response:');
    if (!text) return;
    await reviewApi.respond(id, { owner_response: text });
    const { data } = await reviewApi.list(restaurantId);
    setReviews(data.items || []);
  };

  return (
    <div>
      <AdminPageHeader title="Reviews" />
      {loading ? <LoadingSpinner /> : reviews.length === 0 ? (
        <EmptyState
          icon="reviews"
          title="No reviews yet"
          message="Customer reviews will show up here once diners rate their orders."
        />
      ) : reviews.map((r) => (
        <div key={r.id} className="card mb-3 p-4">
          <div className="flex justify-between">
            <span className="font-medium">{'★'.repeat(r.rating)}</span>
            <span className="text-xs text-stone-400">{r.order_id}</span>
          </div>
          <p className="mt-2 text-sm">{r.comment}</p>
          {r.owner_response ? <p className="mt-2 text-sm text-brand-700">Reply: {r.owner_response}</p> : (
            <button type="button" onClick={() => respond(r.id)} className="mt-2 text-sm text-brand-600">Respond</button>
          )}
        </div>
      ))}
    </div>
  );
}
