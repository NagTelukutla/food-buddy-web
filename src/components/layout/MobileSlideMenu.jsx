import { useRef } from 'react';
import { createPortal } from 'react-dom';
import useModalScrollLock from '../../hooks/useModalScrollLock';

export default function MobileSlideMenu({ open, onClose, children, footer, ariaLabel = 'Mobile navigation' }) {
  const scrollRef = useRef(null);
  useModalScrollLock(open, scrollRef);

  if (!open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="app-mobile-slide-backdrop"
        onClick={onClose}
        aria-label="Close menu"
      />
      <nav className="app-mobile-slide-menu" aria-label={ariaLabel}>
        <div ref={scrollRef} className="modal-scroll-area min-h-0 flex-1 space-y-1 p-3 pt-5">
          {children}
        </div>
        {footer}
      </nav>
    </>,
    document.body
  );
}
