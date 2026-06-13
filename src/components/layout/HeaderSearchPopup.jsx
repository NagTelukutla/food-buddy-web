import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuApi } from '../../api/menuApi';
import { useSelectedRestaurant } from '../../context/SelectedRestaurantContext';
import { getSelectedRestaurantMenuPath } from '../../utils/restaurantPaths';
import { formatCurrency } from '../../utils/format';

export default function HeaderSearchPopup({ open, onClose }) {
  const { selectedRestaurant } = useSelectedRestaurant();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const restaurantId = selectedRestaurant?.id;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !restaurantId) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      menuApi
        .list({ search: trimmed, available_only: false, restaurant_id: restaurantId })
        .then(({ data }) => setResults(data.items || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, query, restaurantId]);

  const handleSelect = (searchTerm) => {
    if (!restaurantId) return;
    onClose();
    const basePath = getSelectedRestaurantMenuPath(selectedRestaurant);
    navigate(`${basePath}?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  if (!open || !restaurantId) return null;

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length > 0;

  return (
    <div ref={containerRef} className="header-search-overlay" role="search" aria-label="Search dishes">
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <span
            className="nav-icon-btn shrink-0 border-brand-300/60 text-brand-700"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${selectedRestaurant.name}...`}
              className="input-field pl-3 pr-3"
              aria-label="Search dishes"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="nav-icon-btn shrink-0"
            aria-label="Close search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showResults && (
          <div className="header-search-results" role="listbox" aria-label="Search results">
          {loading ? (
            <p className="px-3 py-4 text-sm text-stone-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-stone-500">No dishes found for &ldquo;{trimmedQuery}&rdquo;</p>
          ) : (
            <ul className="space-y-1 p-1">
              {results.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    className="header-search-result-item"
                    onClick={() => handleSelect(trimmedQuery)}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                        {item.name?.charAt(0) || '?'}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-stone-800">{item.name}</span>
                      <span className="block truncate text-xs text-stone-500">
                        {item.category || 'Menu'} · {formatCurrency(item.price)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && results.length > 0 && (
            <button
              type="button"
              className="header-search-view-all"
              onClick={() => handleSelect(trimmedQuery)}
            >
              View all results for &ldquo;{trimmedQuery}&rdquo;
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
