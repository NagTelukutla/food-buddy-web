import { useCallback, useEffect, useState } from 'react';
import { menuApi } from '../api/menuApi';

export function useMenu(filters = {}) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await menuApi.list({
        search: filters.search || undefined,
        category: filters.category || undefined,
        available_only: filters.availableOnly || false,
      });
      setItems(data.items);
      setCategories(data.categories);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.availableOnly]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { items, categories, loading, error, refetch: fetchMenu };
}
