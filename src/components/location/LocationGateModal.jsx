import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDeliveryLocation } from '../../context/DeliveryLocationContext';
import {
  buildSearchReference,
  formatSavedAddress,
  resolvePlaceSelection,
  saveRecentSearch,
  searchPlaces,
} from '../../utils/nominatim';
import { hasCustomerSession } from '../../utils/roles';
import LocationMiniMap from './LocationMiniMap';

const SEARCH_DEBOUNCE_MS = 800;
const MIN_SEARCH_LENGTH = 6;

// Routes where we must NOT block the customer with the location gate
// (post-order / informational screens that don't need a delivery address).
const EXEMPT_PREFIXES = [
  '/track-order',
  '/order-success',
  '/payment-failed',
  '/payment-cancelled',
  '/contact',
];

export default function LocationGateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeSessions } = useAuth();
  const customerSignedIn = hasCustomerSession(activeSessions);
  const {
    needsLocation,
    deliveryLocation,
    detecting,
    permissionDenied,
    savedAddresses,
    setDeliveryLocation,
    detectCurrentLocation,
    selectSavedAddress,
  } = useDeliveryLocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [preview, setPreview] = useState(null);

  const isExempt = EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const open = needsLocation && !isExempt;

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSuggestions([]);
      setPreview(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const trimmed = query.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const reference = buildSearchReference(deliveryLocation);
    const timer = window.setTimeout(() => {
      searchPlaces(trimmed, reference)
        .then((results) => setSuggestions(results))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query, deliveryLocation]);

  if (!open) return null;

  const confirmSelection = (location) => {
    setDeliveryLocation(location);
    saveRecentSearch(location);
    toast.success('Delivery location set');
  };

  const handleUseCurrentLocation = async () => {
    const location = await detectCurrentLocation({ forceFresh: true });
    if (location) {
      toast.success('Using your current location');
      return;
    }
    if (permissionDenied) {
      toast.error('Location permission denied. Search for an address instead.');
      return;
    }
    toast.error('Could not detect your location. Try searching manually.');
  };

  const handleSuggestionSelect = async (item) => {
    setResolving(true);
    try {
      const location = await resolvePlaceSelection(item);
      setPreview(location);
    } catch {
      toast.error('Could not load this place. Try another result.');
    } finally {
      setResolving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-stone-900/45 backdrop-blur-sm p-3 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose delivery location"
        className="card w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-stone-900">Where should we deliver?</h2>
          <p className="mt-1 text-sm text-stone-600">
            Set your delivery address to see restaurants that deliver to you. You can change it anytime.
          </p>
        </div>

        {!preview && (
          <>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detecting}
              className="btn-secondary mb-3 flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              {detecting ? 'Detecting…' : 'Use my current location'}
            </button>

            <div className="relative mb-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search area, street, landmark…"
                className="input-field w-full pl-9"
                autoComplete="off"
                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                autoFocus
              />
            </div>

            {query.trim().length >= MIN_SEARCH_LENGTH ? (
              <div className="mt-2">
                {searching || resolving ? (
                  <p className="px-1 py-2 text-sm text-stone-500">
                    {resolving ? 'Loading place…' : 'Searching…'}
                  </p>
                ) : suggestions.length === 0 ? (
                  <p className="px-1 py-2 text-sm text-stone-500">No places found. Try a different search.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={resolving}
                          onClick={() => handleSuggestionSelect(item)}
                          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50/60 disabled:opacity-60"
                        >
                          <span className="block truncate text-sm font-semibold text-stone-800">
                            {item.primaryLabel || item.label}
                          </span>
                          {(item.secondaryLabel || item.label) && (
                            <span className="mt-0.5 block truncate text-xs text-stone-500">
                              {item.secondaryLabel || item.label}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              customerSignedIn && savedAddresses.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                    Saved addresses
                  </p>
                  <ul className="space-y-1.5">
                    {savedAddresses.map((addr) => (
                      <li key={addr.id ?? addr.label}>
                        <button
                          type="button"
                          onClick={() => {
                            selectSavedAddress(addr);
                            toast.success('Delivery location set');
                          }}
                          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50/60"
                        >
                          <span className="block truncate text-sm font-semibold text-stone-800">
                            {addr.label || 'Saved address'}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-stone-500">
                            {formatSavedAddress(addr)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {!customerSignedIn && (
              <p className="mt-4 text-center text-xs text-stone-500">
                Have saved addresses?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  Sign in
                </button>
              </p>
            )}
          </>
        )}

        {preview && (
          <div className="space-y-3">
            <LocationMiniMap
              latitude={preview.latitude}
              longitude={preview.longitude}
              className="h-36 w-full"
            />
            <p className="text-sm text-stone-700">{preview.label}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-primary flex-1 py-2.5 text-sm"
                onClick={() => confirmSelection(preview)}
              >
                Deliver here
              </button>
              <button
                type="button"
                className="btn-secondary px-4 py-2.5 text-sm"
                onClick={() => setPreview(null)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
