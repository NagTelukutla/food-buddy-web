export default function RoundedRadio({
  checked,
  onChange,
  name,
  value,
  label,
  description,
  disabled = false,
  id,
}) {
  const inputId = id || `rounded-radio-${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-200 hover:bg-brand-50/40'
      } ${checked ? 'border-brand-300/60 bg-brand-50/50 shadow-sm' : 'border-white/55 bg-white/45'}`}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="peer sr-only"
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
            checked
              ? 'border-brand-600 bg-brand-600'
              : 'border-stone-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400'
          }`}
          aria-hidden
        >
          {checked && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-900">{label}</span>
        {description && <span className="mt-1 block text-sm text-stone-600">{description}</span>}
      </span>
    </label>
  );
}
