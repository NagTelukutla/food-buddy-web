import { useCallback, useRef } from 'react';

const SWIPE_THRESHOLD = 48;

export function useSwipeCarousel(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const onTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }, []);

  const onTouchEnd = useCallback(
    (event) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touch = event.changedTouches[0];
      const deltaX = touchStartX.current - touch.clientX;
      const deltaY = touchStartY.current - touch.clientY;

      touchStartX.current = null;
      touchStartY.current = null;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX > 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}
