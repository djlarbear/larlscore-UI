# Deployment Guide - New Betting Dashboard UI

## Deployment Status

**Date:** February 20, 2026  
**Status:** ✅ Ready for Development

## Project Created

Location: `/home/miniclaw/.openclaw/workspace/new-dashboard/`

### Directory Structure

```
new-dashboard/
├── src/                          # React components & styles
│   ├── components/               # React components
│   │   ├── Button.tsx           # Button (4 variants)
│   │   ├── Card.tsx             # Card (3 variants)
│   │   └── Dashboard.tsx         # Main dashboard
│   ├── styles/
│   │   ├── designTokens.ts      # Design tokens
│   │   └── globals.css          # Global styles
│   ├── utils/
│   │   └── api.ts               # API client (read-only)
│   ├── App.tsx
│   └── main.tsx
├── index.html                    # HTML entry
├── vite.config.ts               # Vite config
├── tailwind.config.cjs          # Tailwind config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
├── .env.local                   # Environment (local)
├── .env.example                 # Environment (template)
├── .gitignore
├── README.md                    # Setup & usage
└── DEPLOYMENT.md                # This file
```

## Environment Configuration

### .env.local (Already Created)

```env
VITE_API_URL=http://localhost:5001
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Betting Dashboard (New UI)
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANIMATIONS=true
VITE_ENABLE_ANALYTICS=false
```

## Installation Steps

### 1. Install Dependencies

```bash
cd new-dashboard
npm install
```

**Dependencies:**
- React 18.2.0
- TypeScript 5.2
- Vite 5.0 (build tool)
- Tailwind CSS 3.3 (styling)
- Framer Motion 10.16 (animations)
- Recharts 2.10 (charts)
- Axios 1.6 (API client)

### 2. Verify Installation

```bash
npm run type-check
```

Should show no TypeScript errors.

### 3. Start Development Server

```bash
npm run dev
```

## Access

### Local

```
http://localhost:5173
```

### Tailscale

```
http://<your-tailscale-ip>:5173
```

Example: `http://100.73.33.17:5173`

## Port Selection Rationale

**Port 5173** chosen because:
- ✅ Vite default (5173 or 5174, 5175 if occupied)
- ✅ High port number (doesn't conflict with system ports)
- ✅ Clearly distinct from Flask (5001) and Mission Control (3333)
- ✅ Not used by other services
- ✅ Easy to remember

### Port Summary

| Service | Port | Purpose |
|---------|------|---------|
| Flask Betting Dashboard | 5001 | Original API |
| Mission Control | 3333 | Orchestration |
| **New UI (Vite)** | **5173** | **This project** |

## Data Flow

```
Vite Dev Server (5173)
         ↓
    React App
         ↓
    API Client (axios)
         ↓
Flask Dashboard (5001)
    [READ-ONLY]
```

**Important:** No data is modified. API calls are read-only.

## Isolation

### Current Betting System

- Location: `/home/miniclaw/.openclaw/workspace/betting/`
- Port: 5001
- Status: ✅ Untouched

### New Dashboard UI

- Location: `/home/miniclaw/.openclaw/workspace/new-dashboard/`
- Port: 5173
- Status: ✅ Separate environment

### Data Sharing

- ✅ New UI can READ data from Flask API
- ❌ New UI CANNOT write/modify/delete data
- ✅ Flask API remains primary system
- ✅ No conflicts or overwrites

## Network Access

### Localhost (127.0.0.1)

```bash
http://localhost:5173
```

**Accessible from:** Same computer only

### Tailscale

```bash
http://<tailscale-ip>:5173
```

**Accessible from:** Any device on Tailscale network

**Vite Config (Already Set):**

```typescript
server: {
  host: '0.0.0.0',  // Binds to all interfaces
  port: 5173,
  hmr: {
    host: 'localhost',
    port: 5173,
  },
}
```

## Build & Deployment

### Development Build

```bash
npm run dev
```

- Hot module reloading (HMR)
- Source maps
- Unminified

### Production Build

```bash
npm run build
npm run preview
```

- Optimized bundle (tree-shaking)
- Minified & compressed
- Source maps (optional)

**Output:** `dist/` directory

## Troubleshooting

### Port Already in Use

If port 5173 is occupied:

```bash
npm run dev -- --port 5174
```

Or check what's using the port:

```bash
lsof -i :5173
```

### API Connection Error

Verify Flask dashboard is running:

```bash
curl http://localhost:5001/healthcheck
```

Should return HTTP 200.

### Node/npm Issues

Verify installation:

```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
npm list          # List installed packages
```

## Testing

### Unit Tests

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Files Created

| File | Purpose |
|------|---------|
| `src/components/Button.tsx` | Button component (4 variants) |
| `src/components/Card.tsx` | Card component (3 variants) |
| `src/components/Dashboard.tsx` | Main dashboard (hero + grid + stats) |
| `src/styles/designTokens.ts` | Design system tokens |
| `src/styles/globals.css` | Global styles (Tailwind + CSS vars) |
| `src/utils/api.ts` | API client (read-only) |
| `src/App.tsx` | Root component |
| `src/main.tsx` | Entry point |
| `index.html` | HTML template |
| `vite.config.ts` | Vite configuration |
| `tailwind.config.cjs` | Tailwind configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies & scripts |
| `.env.local` | Environment variables |
| `README.md` | Setup guide |

## Features Implemented

### Components

- ✅ Button (4 variants: primary/secondary/tertiary/destructive)
- ✅ Card (3 variants: default/featured/elevated)
- ✅ Dashboard (hero + grid + stats layout)

### Design System

- ✅ Color palette (8 semantic colors)
- ✅ Typography scale (H1-Caption)
- ✅ Spacing system (8px grid)
- ✅ Shadows (Liquid Glass)
- ✅ Border radius
- ✅ Transitions & animations

### Functionality

- ✅ Read-only API connection
- ✅ Auto-refresh (30 seconds)
- ✅ Error handling
- ✅ Loading states (skeleton)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Accessibility (WCAG 2.1 AA)

### Safety

- ✅ Completely isolated from current system
- ✅ Read-only API access
- ✅ No data modifications
- ✅ Separate environment

## Next Steps

1. **Install Dependencies**
   ```bash
   cd new-dashboard
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Localhost: http://localhost:5173
   - Tailscale: http://<tailscale-ip>:5173

4. **Test & Review**
   - Verify UI displays correctly
   - Check data loads from API
   - Test responsive design
   - Identify issues/changes needed

5. **Iterate**
   - Fix bugs
   - Add missing components
   - Refine styling
   - Deploy when ready

## Questions?

Refer to:
- `README.md` - Setup & usage
- `BETTING_UI_DESIGN.md` - Design specifications
- `BETTING_UI_IMPLEMENTATION.md` - Component code reference

---

**Status:** ✅ Deployment Complete - Ready for Testing

**Created:** February 20, 2026  
**Environment:** Local Development  
**Port:** 5173  
**Safety:** Read-only, isolated
