# Betting Dashboard - New UI (React/TypeScript)

Apple HIG-aligned betting dashboard frontend implementation. **READ-ONLY** connection to existing Flask betting dashboard.

## 🎯 Overview

- **Design System:** Apple Human Interface Guidelines (HIG)
- **Tech Stack:** React 18 + TypeScript + Tailwind CSS + Vite
- **Data:** Read-only access to existing betting dashboard API
- **Access:** Localhost (5173) + Tailscale
- **Separation:** Completely isolated from current betting system
- **Safety:** No modifications, writes, or deletes to existing data

## 📁 Project Structure

```
new-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Button.tsx      # Button component
│   │   ├── Card.tsx        # Card component
│   │   └── Dashboard.tsx   # Main dashboard
│   ├── styles/
│   │   ├── designTokens.ts # Design system tokens
│   │   └── globals.css     # Global styles
│   ├── utils/
│   │   └── api.ts          # API client (read-only)
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.cjs      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── .env.local              # Environment variables
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd new-dashboard
npm install
```

### Development

Make sure the Flask betting dashboard is running on localhost:5001, then:

```bash
npm run dev
```

The dashboard will be available at:
- **Localhost:** http://localhost:5173
- **Tailscale:** http://<your-tailscale-ip>:5173 (example: http://100.73.33.17:5173)

### Build for Production

```bash
npm run build
npm run preview
```

## 🔌 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and update values:

```env
VITE_API_URL=http://localhost:5001          # Flask dashboard API
VITE_API_TIMEOUT=10000                      # Request timeout (ms)
VITE_APP_NAME=Betting Dashboard             # App title
VITE_ENVIRONMENT=development                # development | production
VITE_ENABLE_MOCK_DATA=false                 # Use mock data if API unavailable
VITE_ENABLE_ANIMATIONS=true                 # Enable UI animations
```

## 📡 API Connection

This dashboard connects to the existing Flask betting dashboard on port **5001**:

- **Endpoint:** `/api/ranked-bets` - Get today's picks
- **Endpoint:** `/api/stats` - Get record and statistics
- **Endpoint:** `/healthcheck` - Verify API health

**Important:** All calls are **READ-ONLY**. No data is modified, written, or deleted.

## 🎨 Design System

### Colors

- **Primary:** #0A84FF (iOS Blue)
- **Success:** #34C759 (Green) - TOTAL bets
- **Caution:** #FF9500 (Orange) - SPREAD bets
- **Destructive:** #FF3B30 (Red) - MONEYLINE

### Typography

- **Font Family:** San Francisco (system stack)
- **Headlines:** 28px (H1), 22px (H2), 18px (H3)
- **Body:** 16px (large), 14px (standard)

### Spacing

- **Base Grid:** 8px
- **Values:** 4, 8, 12, 16, 20, 24, 32, 40, 48px

### Interactions

- **Modal Entrance:** 300ms spring animation
- **Button Press:** 200ms scale + bounce
- **Transitions:** 300ms standard easing
- **Hover Effects:** Subtle elevation + color shift

## 📊 Component Library

### Button

```tsx
<Button variant="primary" size="md">Get Started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn More</Button>
<Button variant="destructive">Delete</Button>
```

### Card

```tsx
<Card variant="default" padding="md">Content</Card>
<Card variant="featured" accentColor="#34C759">Featured pick</Card>
<Card variant="elevated">Elevated card</Card>
```

## ✅ Status

- ✅ Component library created
- ✅ Design system implemented
- ✅ API client configured
- ✅ Dashboard UI built
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Read-only data access
- ✅ Localhost + Tailscale access

## 🐛 Troubleshooting

### "Cannot connect to API"

**Problem:** Dashboard shows connection error

**Solution:**
1. Make sure Flask betting dashboard is running on port 5001
2. Check `.env.local` has `VITE_API_URL=http://localhost:5001`
3. Run `npm run dev` again
4. Check browser console for errors

### "Blank screen on load"

**Problem:** Dashboard doesn't display

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check for JavaScript errors in console (F12)
3. Verify Node.js is installed: `node --version`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### "Tailscale not working"

**Problem:** Cannot access via Tailscale IP

**Solution:**
1. Verify Vite is binding to `0.0.0.0`: Check vite.config.ts
2. Check Tailscale is connected: `tailscale status`
3. Use your Tailscale IP in browser: `http://100.73.33.17:5173`

## 📝 Notes

- **Separate Environment:** This is completely isolated from the current betting dashboard
- **Read-Only:** No data modifications occur
- **Data Sharing:** Reads live data from Flask API via HTTP
- **No Overwrites:** Current dashboard remains untouched
- **Auto-Refresh:** Dashboard refreshes every 30 seconds automatically

## 🔄 Next Steps

1. ✅ Start dev server
2. ✅ Test localhost access (http://localhost:5173)
3. ✅ Test Tailscale access (http://<tailscale-ip>:5173)
4. ⬜ Review UI and design
5. ⬜ Test data loading from API
6. ⬜ Add missing components/features
7. ⬜ Bug fixes and refinements
8. ⬜ Deploy to production

## 💬 Feedback

Ready for review and testing. Let me know what needs to be fixed or changed!

---

**Created:** February 20, 2026  
**Design:** Apple HIG-aligned  
**Status:** Development Ready
