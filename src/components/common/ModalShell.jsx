import { useRef } from 'react';
import { createPortal } from 'react-dom';
import useModalScrollLock from '../../hooks/useModalScrollLock';

export default function ModalShell({ title, children, onClose, compact = false }) {
  const scrollRef = useRef(null);
  useModalScrollLock(true, scrollRef);

  return createPortal(
    <div
      className="glass-modal-backdrop animate-fade-in-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`glass-modal-panel ${compact ? '!p-3 sm:!p-4' : 'p-4 sm:p-5'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`flex shrink-0 items-start justify-between gap-3 ${compact ? 'mb-2' : 'mb-4'}`}>
          <h2 id="modal-title" className="text-lg font-bold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="glass-icon-btn h-9 w-9 text-stone-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div ref={scrollRef} className="modal-scroll-area">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
