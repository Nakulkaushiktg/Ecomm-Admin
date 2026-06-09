# Kirti Fabric Art — Admin Panel

Standalone admin dashboard for the Kirti Fabric Art store. Talks to the same
backend API as the storefront.

## Local development
```bash
npm install
npm run dev          # runs on http://localhost:5174
```
The dev server proxies `/api` and `/uploads` to the backend at
`http://localhost:8002` (see `vite.config.js`). Start the backend first.

Login at http://localhost:5174 (redirects to `/admin`).

## Deploy (Vercel)
1. Push this folder to its own GitHub repo.
2. Import the repo in Vercel (framework: Vite).
3. Edit `vercel.json` — replace `REPLACE-WITH-RENDER-URL.onrender.com` with your
   backend's Render URL. This proxies API calls to the backend.
4. (Optional) Set env var `VITE_STORE_URL` to your storefront URL so the
   "View Store" link works.

That's it — admin lives at its own URL (e.g. `divya-admin.vercel.app`).
