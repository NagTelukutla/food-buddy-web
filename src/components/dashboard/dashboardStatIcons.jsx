const svgProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 2,
};

export const DASHBOARD_STAT_TONES = {
  orders: 'from-brand-500/20 to-brand-600/10 text-brand-600 ring-brand-500/15',
  revenue: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600 ring-emerald-500/15',
  pending: 'from-amber-500/20 to-orange-500/10 text-amber-600 ring-amber-500/15',
  completed: 'from-green-500/20 to-emerald-600/10 text-green-600 ring-green-500/15',
  average: 'from-violet-500/20 to-purple-600/10 text-violet-600 ring-violet-500/15',
  available: 'from-brand-500/20 to-brand-600/10 text-brand-600 ring-brand-500/15',
  active: 'from-emerald-500/20 to-teal-600/10 text-emerald-600 ring-emerald-500/15',
  queue: 'from-indigo-500/20 to-blue-600/10 text-indigo-600 ring-indigo-500/15',
  loyalty: 'from-amber-500/20 to-orange-500/10 text-amber-600 ring-amber-500/15',
  addresses: 'from-teal-500/20 to-emerald-600/10 text-teal-600 ring-teal-500/15',
  restaurants: 'from-brand-500/20 to-brand-600/10 text-brand-600 ring-brand-500/15',
  customers: 'from-sky-500/20 to-blue-600/10 text-sky-600 ring-sky-500/15',
  gmv: 'from-emerald-500/20 to-green-600/10 text-emerald-600 ring-emerald-500/15',
};

export const DASHBOARD_STAT_ICONS = {
  orders: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  revenue: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  completed: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  average: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  available: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  active: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 011 1v1a1 1 0 01-1 1h-1M13 16V9h4l2 3v4h-6z" />
    </svg>
  ),
  queue: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  loyalty: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H5.5M12 8h4.5a2.5 2.5 0 010 5H12m0 0v5m0-5H8.5a2.5 2.5 0 000 5H12" />
    </svg>
  ),
  addresses: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  restaurants: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  customers: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  gmv: (className) => (
    <svg className={className} {...svgProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export function DashboardStatIcon({ name, className = 'h-5 w-5', size = 'md' }) {
  const render = DASHBOARD_STAT_ICONS[name];
  if (!render) return null;

  const tone = DASHBOARD_STAT_TONES[name] || DASHBOARD_STAT_TONES.orders;
  const sizes = {
    sm: 'h-8 w-8 rounded-xl [&_svg]:h-4 [&_svg]:w-4',
    md: 'h-11 w-11 rounded-2xl [&_svg]:h-5 [&_svg]:w-5',
  };

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 ${tone} ${sizes[size] || sizes.md}`}
    >
      {render(className)}
    </span>
  );
}
