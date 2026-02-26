# Larlbot Static Dashboard

This repo contains **only** the Vite/React dashboard UI in **static mode**.

## How it works
- The app is built from `new-dashboard/`.
- Static data lives at `new-dashboard/public/dashboard-data.json`.
- When deployed, the app fetches `/dashboard-data.json` (bundled from `public/`).

## Local dev
```bash
cd new-dashboard
npm install
npm run dev -- --port 5173
```

## Build
```bash
cd new-dashboard
npm ci
npm run build
```
Output: `new-dashboard/dist`

## Cloudflare Pages settings
- **Framework preset:** Vite
- **Build command:** `cd new-dashboard && npm ci && npm run build`
- **Build output directory:** `new-dashboard/dist`

## Updating data
A separate cron (run on the OpenClaw host) should:
1) run the export job that writes `new-dashboard/public/dashboard-data.json` (in the betting workspace)
2) copy that file into this repo
3) commit + push once per day to trigger Cloudflare Pages rebuild
