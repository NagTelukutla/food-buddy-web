import { useEffect, useState } from 'react';
import { settingsApi } from '../api/settingsApi';

let cachedSettings = null;
let settingsRequest = null;

function fetchSettings() {
  if (!settingsRequest) {
    settingsRequest = settingsApi
      .get()
      .then(({ data }) => {
        cachedSettings = data;
        return data;
      })
      .catch((err) => {
        settingsRequest = null;
        throw err;
      });
  }
  return settingsRequest;
}

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let active = true;

    fetchSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load settings');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, error };
}
