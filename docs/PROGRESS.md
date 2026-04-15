# LocalSite Pro — Build Progress

## Status: All 5 Phases Complete ✓

---

## What's Built

### Phase 1 — Foundation ✓
- Next.js 16 + React 19 + TypeScript + Tailwind v4
- Neon PostgreSQL + Drizzle ORM (4 tables: leads, business_profiles, sites, outreach)
- bcrypt cookie session auth (password-protected dashboard)
- Sidebar layout with Overview + Leads nav
- Leads table with status badges, sort by date
- Add Lead form (name, type, city, address, phone, website, notes)
- Lead detail page with Research / Site Builder / Outreach tabs
- Full CRUD API for leads

### Phase 2 — Research Flow ✓
- POST /api/research/[leadId] — Claude Haiku generates draft business profile
- Fields: services list, description, tagline, tone (professional/friendly/bold)
- Unverified banner (amber) until you approve
- All fields editable before approval (contact email always manual)
- Approve Profile → is_verified = true, lead status → "researched"
- Re-run research replaces the previous draft

### Phase 3 — Site Templates ✓
Three standalone Next.js apps at D:/vsc claude/templates/:

| Template | Target businesses | Design |
|---|---|---|
| bold/ | Barbers, construction, auto | Dark #0f0f0f, parallax hero w/ Framer Motion, geometric accents |
| clean/ | Clinics, dental, professional | White, sticky nav, trust stats, rounded cards |
| warm/ | Convenience, restaurants, retail | Cream bg, "Open Now" badge, hours card in hero |

Each reads site.config.json at build time. All 3 build clean.

### Phase 4 — Site Builder + Vercel Deploy ✓
- Template picker (visual previews of bold/clean/warm)
- POST /api/sites/generate — Haiku fills all SiteConfig fields from business profile
- Full content editor: headline, subheadline, CTA, about, services, colors (with color picker), SEO
- Deploy to Vercel button → uploads template files + custom site.config.json via Vercel REST API
- Polls every 6 seconds → shows preview URL when live
- Lead status → "deployed" on success

### Phase 5 — Outreach Email Drafts ✓
- Draft Email button → Claude Haiku writes a short personalized cold email (4-5 sentences)
- Includes preview URL, references business by name, no generic opener
- Editable subject, body, recipient email (all in-place)
- Copy to Clipboard (one click — pastes subject + body)
- Mark as Sent → lead status → "sent", timestamp recorded
- Multiple drafts supported per lead

---

## Full Lead Lifecycle

```
new → researched → site_ready → deployed → outreach_drafted → sent → converted
```

---

## What You Need to Do

### 1. Neon Database (REQUIRED to run)
1. Go to neon.tech → create a free project
2. Copy the connection string
3. Add to localsite-pro/.env.local:
   DATABASE_URL=postgres://...
4. Run: cd localsite-pro && npm run db:push
   (This creates all 4 tables automatically)

### 2. Anthropic API Key (REQUIRED for Research + Content + Outreach)
1. Go to console.anthropic.com → API Keys
2. Add to .env.local:
   ANTHROPIC_API_KEY=sk-ant-...

### 3. Vercel API Token (REQUIRED for site deployment)
1. Go to vercel.com → Settings → Tokens → Create token
2. Add to .env.local:
   VERCEL_API_TOKEN=...

### 4. Create 3 Vercel Template Projects (REQUIRED for deploy)
For each of the 3 templates, create a Vercel project and note its project ID:

Option A — Via Vercel dashboard (easiest):
1. vercel.com → New Project → import from GitHub
2. Push each template folder to GitHub first:
   - templates/bold → GitHub repo "localsite-bold"
   - templates/clean → GitHub repo "localsite-clean"
   - templates/warm → GitHub repo "localsite-warm"
3. Connect each repo to Vercel
4. Copy the project ID from each project's Settings page

Option B — Via Vercel CLI:
   cd "D:/vsc claude/templates/bold" && vercel --yes
   (follow prompts, note the project ID)

Then add to .env.local:
   VERCEL_PROJECT_BOLD=prj_xxxxxxxxxxxx
   VERCEL_PROJECT_CLEAN=prj_xxxxxxxxxxxx
   VERCEL_PROJECT_WARM=prj_xxxxxxxxxxxx

### 5. Set Your Login Password
Generate a bcrypt hash for your password:
   node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"

Add to .env.local:
   ADMIN_PASSWORD_HASH=$2b$10$...

(In dev without a hash, the password is "admin")

### 6. Optional — Email Sending via Resend
If you want to send emails directly from the app (vs copy/paste):
1. resend.com → create account → get API key
2. Add to .env.local:
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=you@yourdomain.com

---

## Running the App

```bash
# Dashboard
cd "D:/vsc claude/localsite-pro"
npm run dev
# → http://localhost:3000

# Preview templates locally (optional)
cd "D:/vsc claude/templates/bold" && npm run dev    # port 3000
cd "D:/vsc claude/templates/clean" && npm run dev   # port 3000
cd "D:/vsc claude/templates/warm" && npm run dev    # port 3002
```

---

## Minimal .env.local to get started

```bash
# Required for everything to work:
DATABASE_URL=
ANTHROPIC_API_KEY=
VERCEL_API_TOKEN=
VERCEL_PROJECT_BOLD=
VERCEL_PROJECT_CLEAN=
VERCEL_PROJECT_WARM=

# Dev login (no hash needed in dev):
ADMIN_PASSWORD=admin

# Optional:
RESEND_API_KEY=
RESEND_FROM_EMAIL=
VERCEL_TEAM_ID=
```

---

## File Structure

```
D:/vsc claude/
├── localsite-pro/          ← Main dashboard app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/dashboard/    ← Overview stats
│   │   │   ├── (dashboard)/leads/        ← Lead table + detail
│   │   │   ├── login/                    ← Auth page
│   │   │   └── api/
│   │   │       ├── auth/                 ← login / logout
│   │   │       ├── leads/                ← CRUD
│   │   │       ├── research/             ← Claude research + approve
│   │   │       ├── sites/                ← generate + deploy + status
│   │   │       └── outreach/             ← draft + mark-sent
│   │   ├── components/
│   │   │   ├── leads/                    ← Table, form, badge
│   │   │   ├── research/                 ← ResearchPanel
│   │   │   ├── sites/                    ← TemplateSelector, ContentEditor, SiteBuilderPanel
│   │   │   └── outreach/                 ← EmailDraftPanel
│   │   ├── db/                           ← Drizzle schema + client
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── claude.ts
│   │   │   ├── vercel-deploy.ts
│   │   │   └── prompts/                  ← research, content, outreach
│   │   └── types/index.ts
│   └── docs/
│       ├── PLAN.md
│       └── PROGRESS.md                   ← this file
│
└── templates/
    ├── bold/               ← Dark parallax template
    ├── clean/              ← White minimal template
    └── warm/               ← Warm community template
```

---

## V2 Ideas (not built, saved for later)
- Exa API for live web research on businesses
- Auto-find contact emails from Google / business listings
- Bulk research / generate for multiple leads at once
- Analytics dashboard — funnel chart by status
- Domain management for client sites
- Stripe payments + invoicing
- Client portal — share preview link with business owner
