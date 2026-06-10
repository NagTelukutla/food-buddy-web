const ICONS = {
  default: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  cart: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  orders: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  menu: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  loyalty: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H5.5M12 8h4.5a2.5 2.5 0 010 5H12m0 0v5m0-5H8.5a2.5 2.5 0 000 5H12" />
    </svg>
  ),
  transactions: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  delivery: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 011 1v1a1 1 0 01-1 1h-1M13 16V9h4l2 3v4h-6z" />
    </svg>
  ),
  reviews: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  search: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  restaurant: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  campaign: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  chart: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  address: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const ICON_STYLES = {
  default: 'from-stone-100 to-stone-200 text-stone-500',
  cart: 'from-brand-100 to-brand-200 text-brand-600',
  orders: 'from-indigo-100 to-indigo-200 text-indigo-600',
  menu: 'from-amber-100 to-amber-200 text-amber-700',
  loyalty: 'from-amber-100 to-orange-200 text-orange-600',
  transactions: 'from-purple-100 to-purple-200 text-purple-600',
  delivery: 'from-emerald-100 to-emerald-200 text-emerald-600',
  reviews: 'from-yellow-100 to-yellow-200 text-yellow-600',
  search: 'from-stone-100 to-stone-200 text-stone-500',
  restaurant: 'from-brand-100 to-brand-200 text-brand-600',
  campaign: 'from-pink-100 to-pink-200 text-pink-600',
  chart: 'from-blue-100 to-blue-200 text-blue-600',
  address: 'from-teal-100 to-teal-200 text-teal-600',
};

export default function EmptyState({
  title,
  message,
  action,
  icon = 'default',
  compact = false,
  inline = false,
  className = '',
}) {
  const iconNode = ICONS[icon] || ICONS.default;
  const iconStyle = ICON_STYLES[icon] || ICON_STYLES.default;

  if (inline) {
    return (
      <div className={`glass-empty-inline ${className}`.trim()}>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br backdrop-blur-sm [&_svg]:h-5 [&_svg]:w-5 ${iconStyle}`}
        >
          {iconNode}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-700">{title}</p>
          {message && <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{message}</p>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-empty ${
        compact ? 'px-5 py-10' : 'px-6 py-14 sm:py-16'
      } ${className}`.trim()}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-200/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />

      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/70 sm:h-[4.5rem] sm:w-[4.5rem]">
        <span className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br backdrop-blur-sm ${iconStyle}`}>
          {iconNode}
        </span>
      </div>

      <h3 className={`relative font-semibold text-stone-800 ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>
        {title}
      </h3>
      {message && (
        <p className={`relative mx-auto mt-2 max-w-md leading-relaxed text-stone-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      )}
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
