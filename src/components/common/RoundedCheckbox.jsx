export default function RoundedCheckbox({ checked, onChange, label, description, disabled = false, id }) {
  const inputId = id || `rounded-checkbox-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label
      htmlFor={inputId}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-200 hover:bg-brand-50/40'
      } ${checked ? 'border-brand-300 bg-brand-50/60' : 'border-stone-200 bg-white'}`}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
            checked
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-stone-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400'
          }`}
          aria-hidden
        >
          {checked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-stone-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-stone-500">{description}</span>}
      </span>
    </label>
  );
}
