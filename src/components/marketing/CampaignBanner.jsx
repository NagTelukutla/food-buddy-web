import { useEffect, useState } from 'react';
import { campaignApi } from '../../api/restaurantApi';
import { useSettings } from '../../hooks/useSettings';

export default function CampaignBanner() {
  const { settings } = useSettings();
  const restaurantId = settings?.restaurant_id ?? 1;
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    campaignApi.active(restaurantId).then(({ data }) => {
      if (data.items?.length) setCampaign(data.items[0]);
    }).catch(() => {});
  }, [restaurantId]);

  if (!campaign) return null;

  return (
    <div className="mb-4 rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-center text-sm text-brand-900">
      <strong>{campaign.title}</strong>
      {campaign.promo_code && <span className="ml-2">Use code: {campaign.promo_code}</span>}
      {!campaign.promo_code && (
        <span className="ml-2">
          {campaign.discount_type === 'percentage' ? `${campaign.discount_value}% off` : `₹${campaign.discount_value} off`}
        </span>
      )}
    </div>
  );
}
