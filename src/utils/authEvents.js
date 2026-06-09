export const AUTH_SESSION_EXPIRED = 'auth:session-expired';

export function notifySessionExpired(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED, { detail }));
}
