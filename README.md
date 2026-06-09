# Food Buddy — Frontend

React 18 single-page application built with Vite, Tailwind CSS, and React Router.

## Tech stack

- React 18, Vite 6, Tailwind CSS
- React Router, Axios, React Hook Form, React Hot Toast
- Leaflet / React-Leaflet (live delivery maps)

## Project structure

```
├── public/           Static assets (logo, slides, illustrations)
├── src/
│   ├── api/          HTTP clients (Axios)
│   ├── components/   UI components
│   ├── config/       Environment (`env.js`)
│   ├── context/      Auth & cart state
│   ├── hooks/        Shared hooks
│   ├── layouts/      Page shells (admin, customer, platform, delivery)
│   ├── pages/        Route pages
│   ├── routes/       React Router config
│   ├── services/     Razorpay checkout helper
│   └── utils/        Helpers (auth, formatting, maps)
├── .env.example      Local env template
├── .env.production   Production env template
├── vercel.json       SPA routing + Vite build config
└── vite.config.js    Dev server + API proxy
```

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux
```

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (no trailing slash) | Production only |
| `VITE_DEV_PORT` | Dev server port | Optional (default `5173`) |
| `VITE_DEV_PROXY_TARGET` | Backend URL for `/api` proxy in dev | Optional (default `http://127.0.0.1:8080`) |
| `VITE_OSRM_URL` | Map routing API base URL | Optional |

In local development, leave `VITE_API_URL` empty — Vite proxies `/api` to the backend.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest tests |

Or use `.\start.ps1` (installs deps if needed, then `npm run dev`).

## Deploy to Vercel

This is a **standalone frontend project** — deploy the repository root directly to Vercel (no subdirectory / root-directory setting required).

1. Import this repo in [Vercel](https://vercel.com).
2. Framework: **Vite** (auto-detected from `vercel.json`).
3. Add environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com` (your Render backend URL, no trailing slash)
4. Deploy. `vercel.json` handles client-side routing.

After deploy, ensure your Render backend has `CORS_ORIGINS` set to your Vercel URL.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/menu` | Menu |
| `/cart` | Cart |
| `/checkout` | Checkout + Razorpay |
| `/track-order/:id` | Order tracking |
| `/login`, `/register` | Auth (all roles — customer, admin, driver, platform) |
| `/customer/*` | Customer dashboard |
| `/admin/*` | Restaurant admin |
| `/delivery/*` | Delivery partner |
| `/platform/*` | Platform super admin |

## API connection

The frontend talks to the backend over HTTP only. Configure `VITE_API_URL` in production or use the dev proxy locally. No backend code lives in this folder.
