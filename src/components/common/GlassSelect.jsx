import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function ChevronDown({ className = 'h-4 w-4 shrink-0 text-stone-500' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const GlassSelect = forwardRef(function GlassSelect(
  {
    id,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    options = [],
    placeholder = 'Select...',
    className = '',
    disabled = false,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const autoId = useId();
  const triggerId = id || autoId;
  const listboxId = `${triggerId}-listbox`;
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 110,
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    const handleResize = () => updateMenuPosition();
    const handleScroll = () => updateMenuPosition();
    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target)
        || event.target.closest('[data-glass-select-menu]')
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, updateMenuPosition]);

  const emitChange = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.({ target: { name, value: nextValue } });
  };

  const handleSelect = (nextValue) => {
    emitChange(nextValue);
    setOpen(false);
    onBlur?.({ target: { name, value: nextValue } });
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <>
      <input type="hidden" ref={ref} name={name} value={currentValue ?? ''} readOnly />
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={handleToggle}
        onBlur={(event) => {
          if (open || event.relatedTarget?.closest('[data-glass-select-menu]')) return;
          onBlur?.({ target: { name, value: currentValue } });
        }}
        className={`glass-select-trigger ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`.trim()}
      >
        <span className={`truncate ${selectedOption ? 'text-stone-900' : 'text-stone-500'}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && menuStyle && createPortal(
        <ul
          id={listboxId}
          role="listbox"
          data-glass-select-menu
          style={menuStyle}
          className="glass-select-menu"
        >
          {options.map((option) => {
            const isSelected = String(option.value) === String(currentValue);
            return (
              <li key={`${option.value}-${option.label}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`glass-select-option ${isSelected ? 'glass-select-option-active' : ''} ${
                    option.disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`.trim()}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </>
  );
});

export default GlassSelect;
