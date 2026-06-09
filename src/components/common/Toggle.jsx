export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) {
  const switchId = id || label?.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <label htmlFor={switchId} className="block text-sm font-medium text-stone-800">
              {label}
            </label>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-stone-500">{description}</p>
          )}
        </div>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-brand-600' : 'bg-stone-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">{label || 'Toggle'}</span>
      </button>
    </div>
  );
}
