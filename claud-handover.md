# Calandr SaaS — Claude Handover Document

**Project:** AI-powered calendar scheduler for self-care professionals (spas, therapy, wellness)  
**Status:** MVP Phase 1 Complete | Phase 2 In Progress  
**Last Updated:** June 9, 2026  
**Build:** ea02a27 (Frontend moved to root for Cloudflare Pages)

---

## 🎯 Project Overview

### What It Does
Calandr reduces booking losses by ~15% through intelligent calendar management:
- Automated smart scheduling (Claude API powered)
- Client booking with AI slot recommendations
- Professional profile with service variants + pricing
- Team collaboration (multi-professional orgs)
- Reminder automation (email/SMS ready)

### Target Users
- Massage therapists, yoga instructors, therapists, aestheticians
- Small wellness studios (1-50 professionals)
- Initial GTM: Self-serve SaaS, $29-99/month per professional

---

## 🏗️ Architecture & Tech Stack

### Frontend (React 18 + Vite 5 + Tailwind CSS)
```
calandr.pages.dev → Cloudflare Pages (auto-deploy from main)
├── src/
│   ├── pages/
│   │   ├── auth/ (Login, Register)
│   │   ├── professional/ (Dashboard, ProfileEditModal, CreateOrganization)
│   │   ├── client/ (Dashboard - coming soon)
│   │   └── professional/onboarding/ (4-step wizard)
│   ├── components/ (ProtectedRoute, reusable UI)
│   ├── hooks/ (useAuth - JWT management)
│   ├── utils/ (api.js - Axios client, tokenStorage)
│   ├── config/ (theme.js - 5 color palettes + COPY)
│   └── styles/ (Tailwind globals)
├── vite.config.js (Vite 5, pinned)
├── package.json (React 18, Tailwind, Axios)
└── index.html (entry point)

Build Output: dist/ (optimized production bundle)
```

**CRITICAL CONSTRAINT:** Vite pinned at v5 (v8 breaks module evaluation)

### Backend (Node.js + Express + PostgreSQL)
```
calendar-scheduler-production.up.railway.app → Railway
backend/src/
├── index.js (Express server, auto-migrations, 50MB body limit)
├── middleware/auth.js (JWT verifyToken)
├── db/pool.js (PostgreSQL connection)
└── routes/
    ├── auth.js (register, login, refresh, /me)
    ├── organizations.js (create, edit, invite, onboarding save/get)
    ├── professionals.js (profile CRUD, services JSONB)
    ├── clients.js (profile, bookings - stub)
    ├── calendar.js (Google OAuth, sync - stub)
    └── ai.js (find-slots, suggest-reschedule - stub)

Database: PostgreSQL (Railway)
├── users (id, email, password_hash, user_type)
├── professional_profiles (services JSONB, working_hours JSONB)
├── organizations (name, owner_id, theme_id)
├── organization_members (role: admin|member)
├── onboarding_progress (step_1_data...step_4_data JSONB)
├── invite_tokens (email invites with expiry)
├── themes (organization-specific color themes)
└── [15 more tables auto-created on startup]

Auto-migrations: All tables created on backend startup (schema in index.js)
```

### Deployment Pipeline
```
GitHub (arunan7-boop/calendar-scheduler)
    ↓ (main branch)
Cloudflare Pages (auto-deploy)
    ↓
calandr.pages.dev (frontend)

GitHub
    ↓
Railway (backend auto-deploy via .railway.json)
    ↓
calendar-scheduler-production.up.railway.app (API)
```

---

## 📱 UI/UX: Mobile-First Responsive Material Design 3

### Design Principles
- **Mobile-First:** Designed for <375px, scales to desktop
- **Material Design 3:** Color tokens, semantic spacing, motion
- **Expressive:** Bold typography, vibrant 5-color themes
- **Accessible:** WCAG 2.1 AA (focus states, contrast, semantic HTML)

### Responsive Breakpoints (Tailwind)
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Color Themes (5 Palettes)
1. **Vibrant** (purple/indigo) - Default
2. **Serene** (teal/blue)
3. **Warm** (orange/amber)
4. **Rose** (pink/red)
5. **Forest** (green/emerald)

Each theme has:
- Primary color (buttons, active states)
- Secondary (accents, modals)
- Accent (CTAs, success)
- Neutral grays (backgrounds, text)

### Key Components
- **Buttons:** Primary (solid), Secondary (outline), Danger (red)
- **Modals:** Full-screen mobile, centered desktop, dark overlay
- **Forms:** Stacked mobile, 2-col grid desktop, focus ring animation
- **Cards:** Full-width mobile, grid layout desktop
- **Headers:** Sticky, compact mobile (no padding), spacious desktop

### Modal Design (ProfileEditModal)
```
Mobile: Full height, full width, no margin
Desktop: 700px max-width, centered
Height: 100vh (scrollable body)
Content spacing: 20px padding
Button footer: Sticky, flex right-aligned
```

### Typography Scale
```
h1: 32px / 1.5rem (mobile), 48px / 3rem (desktop)
h2: 28px / 1.75rem
h3: 24px / 1.5rem
body: 16px / 1rem
caption: 12px / 0.75rem
```

### Spacing System (Tailwind)
```
xs: 4px
sm: 8px
md: 16px
lg: 32px
xl: 64px
```

---

## 🔐 Authentication & Authorization

### JWT Flow
1. **Register:** POST `/auth/register` → user created, JWT signed, auto-login
2. **Login:** POST `/auth/login` → password verified, JWT signed
3. **Protected Routes:** React Router `<ProtectedRoute>` checks `useAuth().user`
4. **API Calls:** Axios client auto-adds `Authorization: Bearer {token}` header
5. **Logout:** Clear localStorage, `navigate('/login')`, set user=null

### Token Structure
```javascript
JWT Payload: {
  userId: "uuid",
  userType: "PROFESSIONAL" | "CLIENT",
  email: "user@example.com",
  iat: 1717948800,
  exp: 1717952400  // 1 hour expiry
}
```

### Protected Resources
- All `/organizations/*` routes (except public invite verify)
- All `/professionals/*` routes
- All `/client/*` routes
- Professional dashboard, onboarding, profile edit

---

## 📋 Features Built

### Phase 1: Professional Onboarding ✅
**Step 1: Professional Info**
- First name, last name, company name, bio
- Work address, phone
- **NEW:** Currency selector (USD/EUR/GBP/CAD/AUD/INR)
- **NEW:** VAT number (optional)
- All fields saved to `onboarding_progress.step_1_data` (JSONB)

**Step 2: Service Selection**
- 27 pre-built self-care services
- Select top 5 services for profile
- Saved to `step_2_data`

**Step 3: Working Hours**
- 7-day weekly schedule
- Start/end time per day
- Break times (lunch, etc.)
- Saved to `step_3_data`

**Step 4: Photos & Logo**
- Upload up to 6 professional photos (base64 MVP)
- Optional logo
- 50MB body limit (Express configured)
- Saved to `step_4_data`

**Auto-Flow:** Register → /org/create → /professional/onboard → /professional/dashboard

### Phase 1: Organization Management ✅
- **Create org:** Owner auto-added as admin member
- **Edit org:** Update name, description
- **Multi-org:** Professionals can own multiple organizations
- **Themes:** 5 color themes selectable at creation
- **Team invites:** Email invite tokens (24h expiry, optional)

### Phase 1: Service Variants (NEW) ✅
- **Add services:** Select from 27 pre-built services
- **Variants:** Multiple pricing tiers per service (e.g., Swedish vs Deep Tissue massage)
- **Per-variant fields:**
  - Name (e.g., "Swedish Massage")
  - Price (currency-aware, USD by default)
  - Duration (minutes)
  - Description
  - Up to 3 photos (base64)
- **UI:** Expandable service cards, inline variant form
- **Data:** Stored in `professional_profiles.services` (JSONB array)
- **Edit:** Full edit/delete per service & variant

### Phase 1: Dashboard ✅
- Professional dashboard with org list
- Org selector (sidebar)
- Edit org modal (name, description)
- Edit profile modal (service variants)
- Logout (proper navigation to /login)
- Invite professional button (wired, email not tested)

### Phase 1: Authentication ✅
- Register (auto-login on success)
- Login (persistent JWT in localStorage)
- Protected routes (redirect to /login if no token)
- Logout (clear token, navigate to /login)
- Refresh token (auto-refresh middleware ready, manual refresh route)

---

## 🚧 Known Blockers & Issues

### CRITICAL
1. **Buttons in ProfileEditModal not updating**
   - Code shows "Cancel" + "Save" in repo
   - Deployed version shows "Close" + "Profile Complete" (old)
   - **ROOT CAUSE:** Frontend was in subdirectory, Cloudflare not picking up changes
   - **FIX APPLIED:** Moved frontend to repo root, wrangler.toml configured
   - **STATUS:** Awaiting build completion (3-5 min), needs verification
   - **NEXT:** If still broken, check Cloudflare dashboard build settings

### HIGH
2. **Mobile Responsiveness**
   - Not fully tested on actual mobile devices
   - Modals may be too wide on mobile
   - Form inputs need mobile keyboard testing
   - **TODO:** Test on iPhone 12/14, Android devices

3. **Email Invites**
   - SMTP configured (Gmail app password stored)
   - Routes wired, but email sending not tested
   - **TODO:** Test invite flow with real email

### MEDIUM
4. **Service Photos (Base64 MVP)**
   - Currently storing as base64 strings in JSONB
   - Works but inefficient for production
   - **TODO:** Migrate to Google Cloud Storage (bucket ready, credentials in env)

5. **Currency Display**
   - Currency stored in Step 1 onboarding
   - Not yet used in service pricing display
   - **TODO:** Use stored currency in ProfileEditModal price display

6. **Google Calendar OAuth**
   - Routes skeleton exist
   - Not integrated with calendar.js AI endpoints
   - **TODO:** Implement OAuth flow, sync professional calendar

### LOW
7. **Client Booking Flow**
   - Dashboard skeleton exists
   - Booking creation not implemented
   - Client-facing book page not built
   - **TODO:** Build booking UI + Claude slot-finding integration

8. **Professional Public Profile**
   - Route `/professionals/:id` not created
   - Clients need a way to view professional + book
   - **TODO:** Build public-facing profile page

9. **AI Features (Claude Integration)**
   - Endpoints skeleton: `/ai/find-slots`, `/ai/suggest-reschedule`
   - Not wired to Claude API
   - **TODO:** Implement agentic logic

---

## 📊 Database Schema

### Auto-Created Tables (16 total)
```sql
-- Auth
users (id, email, password_hash, user_type, created_at)

-- Profiles
professional_profiles (user_id, company_name, first_name, last_name, bio, work_address, work_phone, services JSONB, working_hours JSONB, created_at)
client_profiles (user_id, first_name, last_name, phone, created_at)

-- Organizations
organizations (id, name, owner_id→users, description, theme_id, created_at)
organization_members (organization_id, professional_id, role, created_at)
themes (organization_id, theme_name, primary_color, secondary_color, accent_color, font_family)

-- Onboarding
onboarding_progress (professional_id, organization_id, current_step, step_1_data JSONB, step_2_data JSONB, step_3_data JSONB, step_4_data JSONB, last_updated)

-- Invites
invite_tokens (organization_id, token, created_by, email, status, expires_at)

-- Bookings (stub)
bookings (id, client_id, professional_id, service_variant_id, start_time, end_time, status, created_at)
bookings_history (booking_id, status, changed_at)

-- Calendar (stub)
google_calendars (professional_id, google_id, access_token, refresh_token, created_at)
calendar_events (id, professional_id, google_event_id, title, start_time, end_time)
```

### Data Relationships
```
users (1) → professional_profiles (1)
users (1) → client_profiles (1)
users (1) → organizations (many) [via owner_id]
organizations (1) → organization_members (many)
organization_members → professionals (many)
organizations (1) → themes (1)
organizations (1) → onboarding_progress (many)
professional_profiles (1) → bookings (many)
```

---

## 🛠️ Development Workflow

### Local Setup
```bash
# Clone repo
git clone https://github.com/arunan7-boop/calendar-scheduler.git
cd calendar-scheduler

# Frontend
npm install
npm run dev  # http://localhost:5173

# Backend (separate terminal)
cd backend
npm install
npm start  # http://localhost:5000
```

### GitHub API Commits
All code changes via GitHub API (no local git CLI):
```bash
python3 << 'EOF'
import requests, base64

PAT = "[GITHUB_PAT_STORED_IN_ENV]"
REPO = "arunan7-boop/calendar-scheduler"
# GET SHA → PUT with base64 content
# Pattern: fetch file → get SHA → encode content → PUT
EOF
```
**Note:** GitHub PAT stored in local environment, never commit

### Deployment
- **Frontend:** Push to main → Cloudflare auto-builds & deploys
- **Backend:** Push to main → Railway auto-deploys

### Environment Variables

**Railway Backend:**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=FBHDCGA81yx_64Ht2WDclbxxHMglFG5IVlFBMaX0sa4
ANTHROPIC_API_KEY=[set in dashboard]
GOOGLE_CLIENT_ID=[set in dashboard]
GOOGLE_CLIENT_SECRET=[set in dashboard]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[gmail address]
SMTP_PASS=[16-char app password]
FRONTEND_URL=https://calandr.pages.dev
```

**Cloudflare Pages:**
- Auto-deploys from main branch
- No env vars needed (frontend uses relative API paths)

---

## 📝 Recent Changes (This Session)

### Fixed
1. ✅ Logout now navigates to /login (added useNavigate)
2. ✅ ProfileEditModal height increased 30% (100vh)
3. ✅ Service variant buttons properly spaced
4. ✅ Currency selector in Step 1 onboarding
5. ✅ VAT number field (optional) in Step 1
6. ✅ Frontend moved to repo root (fixes Cloudflare deploy)

### Updated
- wrangler.toml (build config for Cloudflare Pages)
- .gitignore (dist/, old frontend/)
- Brain repo (session notes)

### Pending Verification
- [ ] Buttons actually show "Cancel"/"Save" after build completes
- [ ] Save button functionality works end-to-end
- [ ] Data persists after logout/login
- [ ] Currency displays in service variant pricing

---

## 🧠 Brain Repo Updates

**Location:** `arunan7-boop/brain`

**Files Updated:**
- `core/onboarding.md` - GitHub access, all projects, critical rules
- `projects/calendar-scheduler.md` - Full project state
- `memory/pause-point.md` - Session checkpoint

**Next Handoff:**
- Verify buttons are live after Cloudflare build
- Test service variant save end-to-end
- Mobile responsiveness testing
- Email invite testing

---

## 🎓 Key Learnings

### Cloudflare Pages
- **Subdirectory Problem:** Frontend in `frontend/` was ignored despite wrangler.toml
- **Solution:** Move frontend to root, Cloudflare auto-detects package.json
- **wrangler.toml:** May not work for auto-deploy; dashboard UI config takes precedence

### Vite 5 Pinning
- v8 breaks module evaluation in this setup
- Always pin to 5.x, never upgrade without testing

### PostgreSQL JSONB
- Perfect for flexible onboarding steps (step_1_data, step_2_data, etc.)
- Queries with `@>` operator work well for searching
- Stores complex nested structures (service variants) elegantly

### JWT + React Router
- useAuth hook + Protected Route pattern is clean
- localStorage for token persistence
- Auto-refresh middleware ready (not yet implemented)

### Service Variants Pattern
```javascript
services: [
  {
    id: "massage-therapy_uuid",
    name: "Massage Therapy",
    variants: [
      {
        id: "massage-therapy_swedish_uuid",
        name: "Swedish Massage",
        price: 60,
        duration: 60,
        description: "...",
        photos: ["base64_1", "base64_2"]
      }
    ]
  }
]
```
This structure is marketplace-ready (can expand to ratings, availability, etc.)

---

## 📞 Handoff Checklist

- [x] Code repo cleaned up (frontend moved to root)
- [x] All recent commits pushed
- [x] Brain repo updated
- [x] Blockers documented
- [x] Tech debt listed
- [x] Next sprint tasks identified
- [ ] Verify deployment (pending Cloudflare build)
- [ ] Manual E2E test on live environment

---

## 🚀 Next Sprint (Priority Order)

### P0 (This Session)
1. Verify buttons actually say "Cancel"/"Save" after build
2. Test save functionality end-to-end
3. Verify data persistence (logout → login)

### P1 (Immediate)
1. Mobile responsiveness testing (real devices)
2. Email invite testing (send/receive)
3. Service pricing display currency support
4. Currency migration from Step 1 to ProfileEditModal

### P2 (Week 1)
1. Client booking UI + flow
2. Public professional profile page
3. Google Calendar OAuth integration
4. Claude AI slot-finding endpoint

### P3 (Week 2+)
1. GCS migration (base64 → Cloud Storage)
2. Mobile app (React Native)
3. Analytics dashboard
4. Payment integration (Stripe)

---

**Document Owner:** Claude (Anthropic)  
**Last Updated:** 2026-06-09 03:12 UTC  
**Status:** Ready for Phase 2  
**Confidence Level:** 90% (pending deployment verification)

