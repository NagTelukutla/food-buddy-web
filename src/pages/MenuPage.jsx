import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import SkeletonCard from '../components/common/SkeletonCard';
import MenuCard from '../components/menu/MenuCard';
import MenuFilters from '../components/menu/MenuFilters';
import { useMenu } from '../hooks/useMenu';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';

export default function MenuPage() {
  const { selectedRestaurant } = useSelectedRestaurant();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const { items, loading, error, refetch } = useMenu({ search, category, availableOnly, restaurantId: selectedRestaurant?.id });

  if (!selectedRestaurant) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearch(query);
  }, [searchParams]);

  return (
    <PageContainer>
      <PageTitle>Our Menu</PageTitle>

      <MenuFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        availableOnly={availableOnly}
        onAvailableOnlyChange={setAvailableOnly}
      />

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="search"
          title="No dishes found"
          message="Try adjusting your search or filters."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
