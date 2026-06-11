import { useEffect, useState } from 'react';

const DEFAULT_DURATION = 320;

/**
 * Keeps an overlay mounted while exit animations play.
 * Returns phase: 'enter' | 'visible' | 'exit'
 */
export default function useOverlayTransition(open, duration = DEFAULT_DURATION) {
  const [isMounted, setIsMounted] = useState(open);
  const [phase, setPhase] = useState(open ? 'enter' : 'exit');

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setPhase('enter');
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('visible'));
      });
      return () => cancelAnimationFrame(raf);
    }

    if (isMounted) {
      setPhase('exit');
      const timer = setTimeout(() => setIsMounted(false), duration);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [open, duration, isMounted]);

  return { isMounted, phase };
}
