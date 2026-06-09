import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="mb-3 text-sm text-stone-500 sm:mb-4" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <span className="text-stone-400">/</span>}
            {item.to && index < items.length - 1 ? (
              <Link to={item.to} className="hover:text-brand-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-stone-800">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
