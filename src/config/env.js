/** Centralized frontend environment configuration (Vite `VITE_*` variables). */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const OSRM_BASE_URL =
  import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org/route/v1/driving';

export const IS_PRODUCTION = import.meta.env.PROD;

export const IS_DEV = import.meta.env.DEV;

if (IS_PRODUCTION && !API_BASE_URL) {
  console.error(
    '[Food Buddy] VITE_API_URL is not set. Add it in the Vercel project Environment variables.',
  );
}