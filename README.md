# LocalSite Pro

A private, AI-powered dashboard that turns a business name into a live demo website — and a cold outreach email — in minutes.

Built as a personal sales tool: add a local business, let Claude research it, pick a template, deploy a real site to Vercel, then send the owner a personalized pitch with the live preview link.

---

## What It Does

```
Add lead → AI research → pick template → edit content → deploy → cold email → close
```

**Five automated phases, one clean workflow:**

1. **Lead tracking** — add any local business (barber, clinic, restaurant, contractor) with name, type, city, and notes
2. **AI research** — Claude Haiku generates a business profile: services, tagline, tone, description — all editable before you approve
3. **Site generation** — Claude fills a fully-typed `SiteConfig` JSON from the profile, populating every field in the chosen template
4. **One-click deploy** — uploads template files + custom config to Vercel via REST API, polls until live, shows preview URL
5. **Outreach draft** — Claude writes a short personalized cold email referencing the business by name and linking to the live demo

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| Database | Neon PostgreSQL (serverless) + Drizzle ORM |
| AI | Anthropic Claude Haiku (research, content, outreach) |
| Deploy | Vercel REST API (programmatic deployments) |
| Auth | bcrypt cookie sessions (httpOnly, secure) |
| Icons | Lucide React |

---

## Site Templates

Three standalone Next.js apps — each reads a `site.config.json` at build time. Completely independent from the dashboard.

| Template | Best For | Design |
|----------|----------|--------|
| **bold** | Barbers, auto shops, contractors | Dark `#0f0f0f`, 3D parallax hero (Framer Motion), geometric accent rings |
| **clean** | Clinics, dental, law firms | Pure white, sticky nav, trust stats bar, soft card grid |
| **warm** | Restaurants, cafes, retail | Cream background, "Open Now" badge, hours card in hero section |

---

## Lead Lifecycle

```
new → researched → site_ready → deployed → outreach_drafted → sent → converted
```

Each status is tracked in the database and reflected as a colored badge in the leads table.

---

## Project Structure

```
localsite-pro/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/        # Overview stats
│   │   │   └── leads/            # Lead table + [id] detail page
│   │   ├── login/                # Auth page
│   │   └── api/
│   │       ├── auth/             # login / logout
│   │       ├── leads/            # full CRUD
│   │       ├── research/         # AI research + approve
│   │       ├── sites/            # generate + deploy + status polling
│   │       └── outreach/         # draft email + mark-sent
│   ├── components/
│   │   ├── leads/                # LeadTable, AddLeadForm, LeadStatusBadge
│   │   ├── research/             # ResearchPanel
│   │   ├── sites/                # TemplateSelector, ContentEditor, SiteBuilderPanel
│   │   └── outreach/             # EmailDraftPanel
│   ├── db/                       # Drizzle schema + lazy-init client
│   ├── lib/
│   │   ├── auth.ts               # bcrypt + cookie session
│   │   ├── claude.ts             # Anthropic SDK client
│   │   ├── vercel-deploy.ts      # Vercel REST API (upload → deploy → poll)
│   │   └── prompts/              # research.ts, content.ts, outreach.ts
│   └── types/index.ts            # SiteConfig + all shared types
├── templates/
│   ├── bold/                     # Dark parallax template
│   ├── clean/                    # White minimal template
│   └── warm/                     # Warm community template
└── docs/
    ├── PLAN.md
    └── PROGRESS.md
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/kdheerajsai401-prog/localsite-pro.git
cd localsite-pro
npm install
```

### 2. Create `.env.local`

```bash
# Database — Neon (free tier works fine)
DATABASE_URL=postgres://...

# AI — Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Vercel — for programmatic deployments
VERCEL_API_TOKEN=...
VERCEL_TEAM_ID=team_...          # optional, only if on a Vercel team

# One project ID per template (create these in vercel.com → New Project)
VERCEL_PROJECT_BOLD=prj_...
VERCEL_PROJECT_CLEAN=prj_...
VERCEL_PROJECT_WARM=prj_...

# Auth — set this to your desired password
ADMIN_PASSWORD=yourpassword
# OR use a bcrypt hash (recommended for any hosted deploy):
# ADMIN_PASSWORD_HASH=$2b$10$...
```

**Generate a bcrypt hash:**
```bash
node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"
```

### 3. Push the database schema

```bash
npm run db:push
```

Creates all 4 tables: `leads`, `business_profiles`, `sites`, `outreach`

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Setting Up Vercel Template Projects

The dashboard deploys to three separate Vercel projects (one per template). You need to create those projects once:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy each template to create the Vercel project
cd templates/bold && vercel --yes
cd ../clean && vercel --yes
cd ../warm && vercel --yes
```

Copy each project ID from `.vercel/project.json` or from the Vercel dashboard (Settings → General → Project ID) and add to `.env.local`.

---

## Deploying the Dashboard to Vercel

```bash
vercel --prod
```

Then push all env vars:
```bash
# From the localsite-pro directory
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  echo "$value" | vercel env add "$key" production
done < .env.local
```

---

## Database Schema

```
leads              — business name, type, city, address, phone, website, notes, status
business_profiles  — services[], tagline, description, tone, contact_email, is_verified
sites              — template_id, site_config JSON, deploy_id, deploy_url, deploy_status
outreach           — subject, body, recipient_email, sent_at, is_sent
```

All tables are linked by `lead_id`.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET/POST` | `/api/leads` | List all leads / create new |
| `GET/PATCH/DELETE` | `/api/leads/[id]` | Single lead operations |
| `POST` | `/api/research/[leadId]` | Run AI research, save profile |
| `POST` | `/api/research/[leadId]/approve` | Approve profile, update status |
| `POST` | `/api/sites/generate` | AI-fill SiteConfig from profile |
| `GET/PATCH` | `/api/sites/[id]` | Get / update site config |
| `POST` | `/api/sites/[id]/deploy` | Upload files + trigger Vercel deploy |
| `GET` | `/api/sites/[id]/status` | Poll deployment status |
| `GET/POST` | `/api/outreach/[leadId]` | Get drafts / generate new email |
| `POST` | `/api/outreach/[leadId]/mark-sent` | Mark as sent, record timestamp |
| `POST` | `/api/auth/login` | Authenticate, set session cookie |
| `POST` | `/api/auth/logout` | Clear session |

---

## How the Vercel Deploy Works

Instead of pushing to GitHub and waiting for CI, the dashboard deploys directly via Vercel's REST API:

1. Reads all template source files from `templates/<id>/` (bundled into the serverless function via `outputFileTracingIncludes`)
2. Injects the AI-generated `site.config.json`
3. Uploads every file to Vercel's file store (`POST /v2/files`)
4. Creates a deployment (`POST /v13/deployments`) pointing to those files
5. Polls `GET /v13/deployments/:id` every 6 seconds until `readyState === "READY"`
6. Returns the live preview URL

The whole process typically takes 60–90 seconds.

---

## Roadmap

- [ ] Exa API integration for live web research (pull real data about each business)
- [ ] Auto-detect contact emails from Google Business / website scraping
- [ ] Bulk research — queue multiple leads at once
- [ ] Analytics — funnel chart (new → sent → converted)
- [ ] Domain management for client sites
- [ ] Stripe invoicing — charge clients from inside the dashboard
- [ ] Client portal — shareable link for business owners to preview their site
- [ ] Resend integration for in-app email sending (no copy/paste)

---

## License

Private project. Not open for contributions.
