import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { customerApi } from '../api/restaurantApi';
import { DELIVERY_LOCATION_STORAGE_KEY } from '../utils/constants';
import { getAccuratePosition } from '../utils/geolocation';
import { formatSavedAddress, reverseGeocode } from '../utils/nominatim';
import { hasCustomerSession } from '../utils/roles';
import { useAuth } from './AuthContext';

const DeliveryLocationContext = createContext(null);

function readStoredLocation() {
  try {
    const raw = localStorage.getItem(DELIVERY_LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredLocation(location) {
  if (!location) {
    localStorage.removeItem(DELIVERY_LOCATION_STORAGE_KEY);
    return;
  }
  localStorage.setItem(DELIVERY_LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function DeliveryLocationProvider({ children }) {
  const { activeSessions } = useAuth();
  const customerSignedIn = hasCustomerSession(activeSessions);
  const [deliveryLocation, setDeliveryLocationState] = useState(() => readStoredLocation());
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const setDeliveryLocation = useCallback((location) => {
    setDeliveryLocationState(location);
    writeStoredLocation(location);
  }, []);

  const detectCurrentLocation = useCallback(({ forceFresh = true } = {}) => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return Promise.resolve(null);
    }

    setDetecting(true);
    setPermissionDenied(false);

    return getAccuratePosition({ forceFresh, timeout: forceFresh ? 18000 : 12000 })
      .then(async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          const location = {
            label: result.label,
            address: result.label,
            latitude: result.latitude,
            longitude: result.longitude,
            city: result.city,
            state: result.state,
            suburb: result.suburb,
            accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
            source: 'gps',
          };
          setDeliveryLocation(location);
          return location;
        } catch {
          return null;
        }
      })
      .catch((error) => {
        if (error?.code === 1) {
          setPermissionDenied(true);
        }
        return null;
      })
      .finally(() => {
        setDetecting(false);
      });
  }, [setDeliveryLocation]);

  useEffect(() => {
    if (deliveryLocation) return;
    detectCurrentLocation({ forceFresh: true });
  }, [deliveryLocation, detectCurrentLocation]);

  useEffect(() => {
    if (!customerSignedIn) {
      setSavedAddresses([]);
      return;
    }

    customerApi
      .profile()
      .then(({ data }) => setSavedAddresses(data.addresses || []))
      .catch(() => setSavedAddresses([]));
  }, [customerSignedIn]);

  const displayLabel = useMemo(() => {
    if (detecting) return 'Detecting location...';
    if (deliveryLocation?.address) return deliveryLocation.address;
    if (deliveryLocation?.label) return deliveryLocation.label;
    if (permissionDenied) return 'Select delivery location';
    return 'Select delivery location';
  }, [deliveryLocation, detecting, permissionDenied]);

  const value = useMemo(
    () => ({
      deliveryLocation,
      displayLabel,
      detecting,
      permissionDenied,
      savedAddresses,
      setDeliveryLocation,
      detectCurrentLocation,
      selectSavedAddress: (addr) => {
        const location = {
          label: addr.label,
          address: formatSavedAddress(addr),
          latitude: null,
          longitude: null,
          city: addr.city,
          state: null,
          suburb: null,
          source: 'saved',
        };
        setDeliveryLocation(location);
        return location;
      },
    }),
    [
      deliveryLocation,
      displayLabel,
      detecting,
      permissionDenied,
      savedAddresses,
      setDeliveryLocation,
      detectCurrentLocation,
    ]
  );

  return (
    <DeliveryLocationContext.Provider value={value}>{children}</DeliveryLocationContext.Provider>
  );
}

export function useDeliveryLocation() {
  const context = useContext(DeliveryLocationContext);
  if (!context) {
    throw new Error('useDeliveryLocation must be used within DeliveryLocationProvider');
  }
  return context;
}
