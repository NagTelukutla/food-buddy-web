import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import PageContainer from '../../components/common/PageContainer';
import { useSelectedRestaurant } from '../../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../../utils/restaurantPaths';

export default function CustomerLoyaltyPage() {
  const { selectedRestaurant } = useSelectedRestaurant();
  const menuPath = getSelectedRestaurantMenuPath(selectedRestaurant);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi.loyalty().then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  const transactions = data?.transactions || [];
  const balance = data?.balance ?? 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Loyalty Rewards</h1>
          <p className="mt-1 text-sm text-stone-500">Earn points on every order and redeem exclusive rewards.</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-brand-700 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-100">Current balance</p>
              <p className="mt-1 font-display text-4xl font-bold sm:text-5xl">{balance}</p>
              <p className="mt-1 text-sm text-amber-100">loyalty points</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              🎁
            </div>
          </div>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-800">Transaction history</h2>
            {transactions.length > 0 && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon="transactions"
              title="No transactions yet"
              message="Place an order to start earning loyalty points. Your earn and redeem history will show up here."
              action={
                <Link to={menuPath} className="btn-primary px-6 py-2 text-sm">
                  {selectedRestaurant ? 'Order & earn points' : 'Discover Restaurants'}
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="card flex items-center justify-between gap-4 p-4 transition hover:border-brand-200 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium capitalize text-stone-800">{t.type.replace(/_/g, ' ')}</p>
                    <p className="truncate text-sm text-stone-500">{t.description || 'Loyalty activity'}</p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      Balance after: {t.balance_after} pts
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                      t.points > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {t.points > 0 ? '+' : ''}
                    {t.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
