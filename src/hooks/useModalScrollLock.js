import { useEffect } from 'react';
import useBodyScrollLock from './useBodyScrollLock';

/**
 * Prevents rubber-band scroll chaining at the top/bottom of a scroll container.
 * Required on iOS where overscroll-behavior alone is unreliable.
 */
function usePreventScrollChaining(scrollRef, enabled = true) {
  useEffect(() => {
    const element = scrollRef?.current;
    if (!enabled || !element) return undefined;

    let lastTouchY = 0;

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      lastTouchY = event.touches[0].clientY;
    };

    const onTouchMove = (event) => {
      if (event.touches.length !== 1) return;

      const touchY = event.touches[0].clientY;
      const deltaY = touchY - lastTouchY;
      lastTouchY = touchY;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        event.preventDefault();
      }
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
    };
  }, [scrollRef, enabled]);
}

/**
 * Locks background scroll and confines touch scrolling to the modal content area.
 */
export default function useModalScrollLock(active, scrollRef) {
  useBodyScrollLock(active);

  useEffect(() => {
    if (!active) return undefined;

    const onDocumentTouchMove = (event) => {
      const scrollEl = scrollRef?.current;
      if (scrollEl && scrollEl.contains(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', onDocumentTouchMove);
  }, [active, scrollRef]);

  usePreventScrollChaining(scrollRef, active);
}
