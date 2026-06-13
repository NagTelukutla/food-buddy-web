import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDeliveryLocation } from '../../context/DeliveryLocationContext';
import { customerIcons } from '../../utils/navLinks';
import {
  buildSearchReference,
  loadRecentSearches,
  resolvePlaceSelection,
  saveRecentSearch,
  searchPlaces,
} from '../../utils/nominatim';
import { hasCustomerSession } from '../../utils/roles';
import LocationMiniMap from '../location/LocationMiniMap';

const PANEL_MAX_WIDTH = 384;
const RECENT_SEARCH_LIMIT = 1;
const PANEL_GAP = 8;
const VIEWPORT_PADDING = 12;
const SEARCH_DEBOUNCE_MS = 800;
const MIN_SEARCH_LENGTH = 6;

function clampPanelPosition(anchorRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const panelWidth = Math.min(PANEL_MAX_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);
  const top = anchorRect.bottom + PANEL_GAP;
  const maxLeft = viewportWidth - panelWidth - VIEWPORT_PADDING;
  const left = Math.max(VIEWPORT_PADDING, Math.min(anchorRect.left, maxLeft));
  const maxHeight = Math.max(200, viewportHeight - top - VIEWPORT_PADDING);

  return {
    top,
    left,
    width: panelWidth,
    maxHeight,
  };
}

function HeaderLocationPanel({ open, onClose, anchorRef }) {
  const navigate = useNavigate();
  const { activeSessions } = useAuth();
  const customerSignedIn = hasCustomerSession(activeSessions);
  const {
    deliveryLocation,
    permissionDenied,
    detecting,
    setDeliveryLocation,
    detectCurrentLocation,
  } = useDeliveryLocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolvingSelection, setResolvingSelection] = useState(false);
  const [preview, setPreview] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [panelStyle, setPanelStyle] = useState(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const activeAddress = deliveryLocation?.address || deliveryLocation?.label || '';

  const updatePanelPosition = () => {
    if (!anchorRef?.current) return;
    setPanelStyle(clampPanelPosition(anchorRef.current.getBoundingClientRect()));
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSuggestions([]);
      setPreview(null);
      return;
    }

    setRecentSearches(loadRecentSearches());
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const searchReference = buildSearchReference(deliveryLocation);
    const timer = window.setTimeout(() => {
      searchPlaces(trimmed, searchReference)
        .then((results) => setSuggestions(results))
        .catch((error) => {
          setSuggestions([]);
          if (import.meta.env.DEV) {
            console.error('[Location search]', error?.message || error);
          }
        })
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query, deliveryLocation]);

  const confirmSelection = (location) => {
    setDeliveryLocation(location);
    saveRecentSearch(location);
    toast.success('Delivery location updated');
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    const location = await detectCurrentLocation({ forceFresh: true });
    if (location) {
      toast.success('Using your current location');
      onClose();
      return;
    }

    if (permissionDenied) {
      toast.error('Location permission denied. Search for an address instead.');
      return;
    }

    toast.error('Could not detect your location. Try searching manually.');
  };

  const handleSuggestionSelect = async (item) => {
    setResolvingSelection(true);
    try {
      const location = await resolvePlaceSelection(item);
      setPreview(location);
    } catch {
      toast.error('Could not load this place. Try another result.');
    } finally {
      setResolvingSelection(false);
    }
  };

  const handleViewSavedAddresses = () => {
    onClose();
    navigate(customerSignedIn ? '/customer/addresses' : '/login');
  };

  if (!open || !panelStyle) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="header-location-panel"
      style={{
        top: panelStyle.top,
        left: panelStyle.left,
        width: panelStyle.width,
        maxHeight: panelStyle.maxHeight,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose delivery location"
    >
      <div
        className="header-location-panel-inner flex max-h-[inherit] flex-col overflow-hidden"
        style={{ maxHeight: panelStyle.maxHeight }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/40 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-900">Choose delivery location</p>
            {activeAddress ? (
              <p className="truncate text-[11px] text-brand-700" title={activeAddress}>
                Active: {activeAddress}
              </p>
            ) : (
              <p className="text-[11px] text-stone-500">Search for your delivery area</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="glass-icon-btn h-7 w-7 shrink-0 text-stone-500" aria-label="Close">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="header-location-search">
            <span className="header-location-search-icon" aria-hidden>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPreview(null);
              }}
              placeholder="Search area, street, landmark..."
              className="header-location-search-input"
              autoComplete="off"
            />
            <span className="header-location-search-divider" aria-hidden />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detecting}
              className="header-location-current-pill"
              aria-label="Use current location"
            >
              <span className="header-location-current-pill-icon">{customerIcons.location}</span>
              <span>{detecting ? '…' : 'Current'}</span>
            </button>
          </div>

          {!preview && query.trim().length < MIN_SEARCH_LENGTH && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleViewSavedAddresses}
                className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 transition hover:text-brand-800"
              >
                View Saved Addresses
              </button>
            </div>
          )}

          {recentSearches.length > 0 && !preview && query.trim().length < MIN_SEARCH_LENGTH && (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">Recent searches</p>
              <ul>
                {recentSearches.slice(0, RECENT_SEARCH_LIMIT).map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() =>
                        item.latitude != null && item.longitude != null
                          ? setPreview(item)
                          : confirmSelection(item)
                      }
                      className="header-location-result-item w-full text-left"
                    >
                      <span className="line-clamp-1 text-xs text-stone-800">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.trim().length >= MIN_SEARCH_LENGTH && !preview && (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">Suggestions</p>
              {searching || resolvingSelection ? (
                <p className="px-1 py-1.5 text-xs text-stone-500">
                  {resolvingSelection ? 'Loading place…' : 'Searching...'}
                </p>
              ) : suggestions.length === 0 ? (
                <p className="px-1 py-1.5 text-xs text-stone-500">No places found. Try a different search.</p>
              ) : (
                <ul className="space-y-1.5">
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={resolvingSelection}
                        onClick={() => handleSuggestionSelect(item)}
                        className="header-location-result-item w-full text-left disabled:opacity-60"
                      >
                        <span className="block truncate text-xs font-semibold text-stone-800">
                          {item.primaryLabel || item.label}
                        </span>
                        {(item.secondaryLabel || item.label) && (
                          <span className="mt-0.5 block truncate text-[11px] text-stone-500">
                            {item.secondaryLabel || item.label}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {preview && (
            <div className="mt-3 space-y-2">
              <LocationMiniMap
                latitude={preview.latitude}
                longitude={preview.longitude}
                className="h-28 w-full"
              />
              <p className="line-clamp-2 text-xs text-stone-700">{preview.label}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={() => confirmSelection(preview)}>
                  Confirm location
                </button>
                <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setPreview(null)}>
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function HeaderLocationPicker({ className = '' }) {
  const { displayLabel, detecting } = useDeliveryLocation();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const locationText = detecting ? 'Detecting...' : displayLabel;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`header-location-trigger ${className}`.trim()}
        aria-label={`Deliver to ${locationText}`}
        aria-expanded={open}
        title={locationText}
      >
        <span className="header-location-trigger-icon">{customerIcons.location}</span>
        <span className="header-location-trigger-label">{locationText}</span>
      </button>
      <HeaderLocationPanel open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} />
    </>
  );
}
