import { useEffect, useState } from 'react';
import { settingsApi } from '../api/settingsApi';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    settingsApi
      .get()
      .then(({ data }) => setSettings(data))
      .catch((err) => setError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading, error };
}
