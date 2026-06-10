import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function lockBodyScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const { body, documentElement: html } = document;

    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.dataset.scrollLocked = 'true';

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
  }

  lockCount += 1;
}

function unlockBodyScroll() {
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return;

  const { body, documentElement: html } = document;
  const scrollY = savedScrollY;

  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.overflow = '';
  delete body.dataset.scrollLocked;

  html.style.overflow = '';
  html.style.overscrollBehavior = '';

  window.scrollTo(0, scrollY);
}

/** Locks page scroll (iOS-safe). Supports nested locks via reference counting. */
export default function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [enabled]);
}
