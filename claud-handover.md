# Calandr - Complete MVP Phase 1 Handover

## ✅ STATUS: PRODUCTION LIVE & VERIFIED

**Date:** June 10, 2026  
**Build:** b958f69  
**Frontend:** https://calandr.pages.dev (LIVE)  
**Backend:** https://calendar-scheduler-production.up.railway.app (LIVE)  
**Last Verified:** June 10, 2026 02:50 UTC

---

## 🎯 What's Shipped & Working

### Phase 1: Professional Management (COMPLETE)
✅ Professional registration + org creation  
✅ 4-step onboarding wizard with currency & VAT  
✅ Service management with unlimited variants  
✅ Service variant editor (name, price, duration, description, photos)  
✅ Professional dashboard with org switching  
✅ Team member invites  
✅ Premium glassmorphism UI redesign  
✅ E2E Puppeteer test suite (12 step journey)  
✅ **Cloudflare Pages deployment VERIFIED**  
✅ **Railway backend VERIFIED**  

---

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite 5 (pinned)
- Tailwind CSS + Material Design 3
- Deployed on Cloudflare Pages
- Auto-deploys from main branch

**Backend:**
- Node.js + Express
- PostgreSQL on Railway
- 16 auto-migrating database tables
- JWT authentication

**Deployment:**
```
GitHub (main) → Cloudflare Pages (frontend) → calandr.pages.dev
             → Railway (backend) → calendar-scheduler-production.up.railway.app
```

---

## 📊 Database Schema

```javascript
professionals {
  id, email (unique), password_hash, first_name, last_name, created_at
}

organizations {
  id, professional_id (fk), name, description, logo_url, theme, created_at
}

services {
  id, organization_id (fk), name, description
}

service_variants {
  id, service_id (fk), name, price, duration_minutes, description, photos (base64)
}

invites {
  token (unique), email, organization_id (fk), created_at, expires_at, status
}

// Plus: bookings, calendar_events, payments, reviews (future phases)
```

---

## 🔧 Environment Configuration

**Frontend (calandr.pages.dev):**
- No env vars needed
- API calls to `/api/*` routes to backend
- Axios client auto-adds JWT token

**Backend (Railway):**
- DATABASE_URL: PostgreSQL connection
- JWT_SECRET: Signing key for tokens
- NODE_ENV: production

**Cloudflare Pages:**
- Build command: `npm install && npm run build`
- Build directory: `dist/`
- Root directory: `/` (not subdirectory)
- Auto-deploy from main branch enabled

---

## ✅ Full E2E User Flow (Verified)

1. **Register** → POST /auth/register → User created, org created
2. **Create Org** → Select name, description, theme
3. **Onboarding Step 1** → Personal info (name, currency, VAT#)
4. **Onboarding Step 2** → Company info (address, phone, business reg)
5. **Onboarding Step 3** → Create first service
6. **Onboarding Step 4** → Upload logo + gallery photos
7. **Dashboard** → View org, services, and team
8. **Edit Profile** → Add/edit/delete services and variants
9. **Service Variant Details:**
   - Name (e.g., "Swedish Massage")
   - Price (manual entry)
   - Duration (15-480 min dropdown)
   - Description (rich text)
   - Photos (up to 3, base64 encoded)
10. **Save & Verify** → Dashboard updates correctly
11. **Logout** → Clear token, redirect to /login
12. **Login** → JWT verified, restored to dashboard

**Test Coverage:** Puppeteer E2E test + screenshots in `/scratch` folder

---

## 🎨 UI/UX Highlights

### Design System
- **Theme:** Premium glassmorphism, dark blue (rgba(16, 24, 48, 0.85))
- **Modals:** Max 910px width, full-height on mobile, rounded 28px
- **Inputs:** No number spinners, safe price/duration handling
- **Scrollbars:** Custom cyan color with hover effect
- **Transitions:** Smooth 0.2s color/opacity changes
- **Responsive:** Mobile-first (full-width → grid layout)

### Key Components
- `ProfileEditModal` — Service variant management (refactored)
- `Dashboard` — Org selection + service list (state fixed)
- `OnboardingWizard` — 4-step flow with validation
- `LoginPage` — JWT-based authentication

---

## 🐛 Bugs Fixed This Session

| Issue | Root Cause | Fix | Status |
|-------|-----------|-----|--------|
| Org dropdown reset on load | `setSelectedOrg` didn't preserve selection | Added `prev` check in useEffect | ✅ LIVE |
| Price rendering crash | `v.price?.toFixed(2)` on strings → TypeError | Use `parseFloat()` with validation | ✅ LIVE |
| 127.0.0.1 hitting production | Not in local hostname check | Added to api.js hostname detection | ✅ LIVE |
| Old code served after push | Frontend in subdirectory, Cloudflare ignored | Moved frontend to root, version bump | ✅ LIVE |

---

## 📁 Repository Structure

```
calendar-scheduler/
├── src/
│   ├── pages/
│   │   ├── auth/ (Login, Register)
│   │   ├── professional/ (Dashboard, ProfileEditModal, CreateOrganization)
│   │   └── professional/onboarding/ (OnboardingWizard)
│   ├── hooks/ (useAuth, useApi)
│   ├── utils/ (api.js, tokenStorage.js)
│   ├── config/ (theme.js)
│   ├── styles/ (index.css)
│   └── App.jsx (Router)
├── public/
│   └── _headers (Cloudflare cache control)
├── backend/
│   ├── src/
│   │   ├── routes/ (auth, organizations, professionals, services)
│   │   ├── db/ (migrations, queries)
│   │   └── middleware/ (jwt, error handling)
│   ├── test_api_flow.cjs
│   ├── test_db_patch.cjs
│   └── test_ui.cjs (Puppeteer E2E)
├── scratch/ (12 step UI screenshots)
├── package.json
├── vite.config.js
├── wrangler.toml
└── claud-handover.md (this file)
```

---

## 🚀 Next Phase: Client Marketplace

### Phase 2 Features (In Development)
1. **Client Booking Flow:**
   - Client text request → Claude API analyzes request
   - System finds 3 best available slots
   - Client selects slot → Booking created

2. **Public Professional Profiles:**
   - `/professionals/:id` page
   - Display services, variants, photos, pricing
   - Embedded booking form

3. **Email Reminders:**
   - 24h before appointment
   - Nodemailer + node-cron

4. **Client Portal:**
   - View bookings
   - Cancel/reschedule
   - Leave reviews

5. **Tech Debt:**
   - GCS migration (base64 → Cloud Storage)
   - Mobile device testing
   - Google Calendar OAuth

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install
cd backend && npm install

# Environment setup
# Backend: create .env with DATABASE_URL, JWT_SECRET

# Start frontend (port 5173)
npm run dev

# Start backend (port 5001 - not 5000 due to macOS AirPlay)
cd backend && npm start

# Run E2E tests
node backend/test_ui.cjs

# Production build
npm run build  # Frontend → dist/
cd backend && npm start  # Backend ready to deploy
```

---

## 📋 Deployment Checklist

- ✅ Frontend: npm run build → dist/
- ✅ Cloudflare Pages: Auto-deploy from main
- ✅ Backend: Node.js + Express running on Railway
- ✅ Database: PostgreSQL on Railway
- ✅ API routing: Axios → https://calendar-scheduler-production.up.railway.app/api
- ✅ Authentication: JWT tokens in localStorage
- ✅ Cache control: _headers configured (no-cache for HTML, max-age for /assets)
- ✅ SSL/HTTPS: Enabled
- ✅ Custom domain: calandr.pages.dev
- ✅ E2E tests: Puppeteer verified

---

## 🎓 Key Learnings

### Cloudflare Pages
- **Subdirectory Problem:** Frontend in `frontend/` was ignored despite wrangler.toml
- **Solution:** Move frontend to repo root, Cloudflare auto-detects package.json
- **Deployment:** Version bump + full rebuild cycle (30-60 sec)
- **_headers:** Configure cache control in public/_headers, auto-served by Cloudflare

### Vite + React
- **Module Evaluation:** Vite v8 breaks this setup, must stay on v5
- **Pinning:** Lock version in package.json
- **Build Output:** dist/ directory, hashed assets for cache busting

### State Management (React)
- **Org Selection:** Use `prev =>` in setState to preserve current selection
- **Price Rendering:** Always validate/parse strings before calling `.toFixed()`
- **API Loading:** Axios interceptors for request/response lifecycle

---

## 📞 Support Notes

**If deployment breaks:**
1. Check Cloudflare Pages build logs (Deployments tab)
2. Verify main branch has latest code
3. Check vite.config.js for proxy config
4. Verify _headers file exists in public/

**If backend not responding:**
1. Check Railway service logs
2. Verify DATABASE_URL is set
3. Check JWT_SECRET is set
4. Verify backend is on port 5000 (Railway) or 5001 (local dev)

**If API calls fail:**
1. Check browser console for CORS errors
2. Verify api.js is pointing to correct endpoint
3. Check JWT token is being sent (Authorization header)
4. Check backend routes are defined

---

## ✨ Final Notes

**This MVP is production-ready.** Professional onboarding, service management, and dashboard are fully functional and deployed. UI is premium and intuitive. E2E flow is verified.

**Ready for Phase 2:** Client booking, marketplace profiles, and integration with Claude API for intelligent slot-finding.

---

**Handoff Complete:** June 10, 2026  
**Next Owner:** Phase 2 development or live user testing  
**Status:** 🟢 LIVE & VERIFIED
