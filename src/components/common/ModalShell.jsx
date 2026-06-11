import { useRef } from 'react';
import { createPortal } from 'react-dom';
import useModalScrollLock from '../../hooks/useModalScrollLock';

export default function ModalShell({
  title,
  children,
  onClose,
  compact = false,
  centered = false,
  confirmCentered = false,
}) {
  const scrollRef = useRef(null);
  useModalScrollLock(true, scrollRef);
  const isConfirmDialog = centered && confirmCentered;

  return createPortal(
    <div
      className={`glass-modal-backdrop animate-fade-in-backdrop ${
        centered ? 'items-center p-4' : ''
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`glass-modal-panel ${compact ? '!p-3 sm:!p-4' : 'p-4 sm:p-5'} ${
          centered ? 'max-w-md rounded-[1.75rem]' : ''
        } ${isConfirmDialog ? 'min-h-[15.5rem]' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`relative flex shrink-0 items-start justify-between gap-3 ${
            isConfirmDialog ? 'mb-1' : compact ? 'mb-2' : 'mb-4'
          }`}
        >
          <h2 id="modal-title" className="text-lg font-bold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`glass-icon-btn text-stone-500 ${
              isConfirmDialog ? 'absolute right-0 top-0 h-7 w-7' : 'h-9 w-9'
            }`}
            aria-label="Close"
          >
            <svg
              className={isConfirmDialog ? 'h-3.5 w-3.5' : 'h-5 w-5'}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          ref={scrollRef}
          className={`modal-scroll-area ${isConfirmDialog ? 'flex min-h-[9.5rem] flex-col' : ''}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
