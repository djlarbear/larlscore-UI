# OPS — LarlScore UI (Cloudflare Pages)

Site: https://larlscore.pages.dev/

## Cloudflare Pages build settings
- Branch: `main`
- Build command: `cd new-dashboard && npm ci && npm run build`
- Output directory: `new-dashboard/dist`

### Node version
- Repo includes `.nvmrc` (Node 22). If Cloudflare build ever breaks, set Pages env var `NODE_VERSION=22`.

## What is allowed in this repo
Allowed:
- `new-dashboard/` source
- `new-dashboard/public/dashboard-data.json`
- `new-dashboard/public/dashboard-data-phase3.json`

Not allowed:
- API keys / tokens / secrets
- databases
- logs
- private system notes

## Updates
### Data (daily)
Data is updated by copying in new JSON snapshots and pushing a commit.

### UI changes
UI changes must be made here and pushed to deploy.
