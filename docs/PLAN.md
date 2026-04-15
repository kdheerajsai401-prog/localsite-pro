# LocalSite Pro — V1 Plan
## Semi-Automated Lead-Gen Website Builder

---

## 1. Product Summary

A private dashboard where you enter a local business (by name, type, or address), research it, generate a polished demo website, deploy it to Vercel, and prepare a personalized email draft — all from one place. You remain in control at every step. The system assists; it does not replace your judgment.

---

## 2. What V1 Does

- Accept business input (name, type, location)
- Run an AI-assisted research step to build a business profile
- Generate a content-filled website from a pre-built template
- Preview the site before deploying
- Deploy the generated site to Vercel (unique preview URL per business)
- Draft a personalized outreach email (you review and send manually)
- Track all leads, sites, and outreach history in a central database

---

## 3. What V1 Explicitly Does Not Do

- No SMS outreach
- No bulk / automated sending of any kind
- No scraping of private contact data
- No complex multi-agent swarm systems
- No live web search or autonomous research agents
- No advanced analytics or charts
- No mandatory 3D or video for every template
- No per-client backend or database (one central backend only)
- No real-time streaming for every operation (polling is fine)

---

## 4. Recommended Architecture

```
You (browser)
    ↓
Next.js Dashboard App  (single app, all-in-one)
    ├── Dashboard UI (React, Tailwind, shadcn/ui)
    ├── API Routes (Next.js Route Handlers)
    │       ├── /api/leads/*        CRUD for leads
    │       ├── /api/research/*     Claude research call
    │       ├── /api/sites/*        generate + deploy
    │       └── /api/outreach/*     draft email
    ├── DB (Neon PostgreSQL via Drizzle ORM)
    └── Claude API (research + content generation)

Generated Sites (3 Vercel projects, one per template family)
    ├── localsite-bold / localsite-clean / localsite-warm
    ├── Each business = new deployment on its matching template project
    ├── Content (SiteConfig JSON) injected at deploy time
    └── Each deploy → unique Vercel preview URL for that business
Plus 1 separate Vercel project for the dashboard itself
```

No separate backend. No microservices. One app does everything.

---

## 5. Recommended Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | Matches your existing projects |
| Styling | Tailwind CSS v4 + shadcn/ui | Same as vapes and town-and-country |
| Database | Neon (serverless Postgres) | Better free tier than Supabase for a private tool; no connection pool headaches |
| ORM | Drizzle ORM | Lightweight, TypeScript-native, works perfectly with Neon |
| Auth | bcrypt cookie session | Same pattern as vapes — simple, proven, already works |
| AI | Claude claude-sonnet-4-6 (research), claude-haiku-4-5 (content) | Already in use |
| Email drafts | Resend (send only when you manually trigger) | Simple API; no spam risk since you review first |
| Site deployment | Vercel REST API | Programmatic deploys of generated template sites |
| Animations | Framer Motion | Already in all your sites; used for hero section only |

---

## 6. Database Design (Neon + Drizzle)

### `leads` table
```typescript
{
  id: uuid PK,
  business_name: text NOT NULL,
  business_type: text,           // 'barber' | 'clinic' | 'construction' | 'convenience' | 'other'
  address: text,
  city: text,
  phone: text,
  website_url: text,             // existing website if any (null = no website)
  status: text DEFAULT 'new',   // 'new' | 'researched' | 'site_ready' | 'deployed' | 'outreach_drafted' | 'sent' | 'converted' | 'lost'
  notes: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

### `business_profiles` table
```typescript
{
  id: uuid PK,
  lead_id: uuid FK → leads.id,
  contact_email: text,           // entered manually by you — never guessed
  services: text[],              // draft from Claude, you verify
  description: text,             // draft from Claude
  tagline: text,                 // draft from Claude
  tone: text,                    // 'professional' | 'friendly' | 'bold'
  is_verified: boolean DEFAULT false,  // you flip this once you've reviewed all fields
  verified_at: timestamp,              // null until you approve
  raw_output: jsonb,                   // full Claude response stored for reference/audit
  created_at: timestamp
}
// All fields except contact_email are treated as unverified drafts until is_verified = true.
// UI must display a "⚠ Unverified — review before using" banner until verified.
```

### `sites` table
```typescript
{
  id: uuid PK,
  lead_id: uuid FK → leads.id,
  template_id: text,             // 'bold' | 'clean' | 'warm'
  template_variant: text,        // optional label, e.g. 'bold-dark' or 'clean-blue' for future sub-variants
  content: jsonb,                // typed as SiteConfig (see below)
  preview_url: text,             // Vercel preview URL after deploy
  vercel_deploy_id: text,
  vercel_project_id: text,       // which of the 3 Vercel projects was used
  status: text DEFAULT 'draft', // 'draft' | 'deploying' | 'live' | 'failed'
  created_at: timestamp,
  updated_at: timestamp
}
```

### `SiteConfig` type (single source of truth — used by templates, API, and DB)
```typescript
interface SiteConfig {
  // Business identity
  businessName: string;
  city: string;
  phone: string;
  address: string;

  // Hero section
  headline: string;
  subheadline: string;
  cta: string;

  // Body
  about: string;                                    // 2–3 sentences
  services: Array<{ name: string; description: string }>;

  // Branding
  primaryColor: string;                             // hex
  accentColor: string;                              // hex

  // SEO
  metaTitle: string;
  metaDescription: string;
}
```

All template `site.config.json` files conform to this type. The content generation API returns this shape. The Vercel deploy function accepts this type. One type, used everywhere.

### `outreach` table
```typescript
{
  id: uuid PK,
  lead_id: uuid FK → leads.id,
  site_id: uuid FK → sites.id,
  recipient_email: text,
  subject: text,
  body: text,
  status: text DEFAULT 'draft',  // 'draft' | 'sent'
  send_method: text,             // 'copy_paste' | 'resend' — how it was sent
  template_label: text,          // e.g. 'cold_intro_v1' — for tracking what prompt/template was used
  sent_at: timestamp,
  created_at: timestamp
}
```

That's it. 4 tables. Clean and sufficient for V1.

---

## 7. Dashboard Pages

| Page | Route | Purpose |
|---|---|---|
| Login | `/login` | Simple password login |
| Overview | `/dashboard` | Counts by status, recent activity list |
| Leads | `/leads` | Table of all leads, add new lead, filter by status/type |
| Lead Detail | `/leads/[id]` | All info for one lead, with tabs: Research / Site Builder / Outreach |

5 pages total. Research, site building, and outreach all live as tabs inside the single lead detail page. No separate sub-routes needed.

---

## 8. Workflow: Lead Input → Deployed Preview

```
Step 1 — Add Lead
  /leads page → "Add Lead" form
  Fields: business name, type, city, phone (optional), existing website (optional)
  Saves to leads table with status = 'new'

Step 2 — Research
  /leads/[id] → Research tab → "Run Research" button
  Calls POST /api/research/[leadId]
  Claude generates a business profile draft: likely services, description, tagline, tone
  All Claude-generated fields are saved with is_verified = false
  UI shows a "⚠ Unverified" banner — you review and edit fields, then click "Approve Profile"
  On approval: is_verified = true, verified_at = now()
  Lead status → 'researched' only after you approve

Step 3 — Build Site
  /leads/[id] → Site Builder tab → select template → "Generate Content" button
  Calls POST /api/sites/generate
  Claude fills the template content fields (SiteConfig) based on the business profile
  Lead status → 'site_ready'
  You see all content fields — edit anything manually if needed
  Click "Deploy to Vercel" when happy
  Vercel API deploys to matching template project → unique preview URL saved to sites table
  Lead status → 'deployed'

Step 4 — Outreach Draft
  /leads/[id] → Outreach tab → "Draft Email" button
  Claude writes a short, personalized cold email referencing the preview URL
  You review and edit the email body
  Copy/paste to send manually (or use Resend send button if you want)
  Lead status → 'outreach_drafted' → 'sent' (when you mark it)
```

Total manual touchpoints: ~4 button clicks + review at each step. You never lose control.

---

## 9. How Website Generation Works (Practically)

### The approach: template-based, not code-generated

Instead of asking Claude to write Next.js code every time (fragile, slow, expensive), you maintain **3 pre-built Next.js template projects**. Each template has placeholder variables that get replaced with business-specific content. Start with 3 proven templates; add more in V2 based on what niches you're actually pitching.

The templates live in `D:\vsc claude\templates\`:
```
templates/
  bold/        ← dark, high-contrast — barbers, construction, auto shops
  clean/       ← white, minimal, trust-first — clinics, dental, professional services
  warm/        ← friendly, hours-forward — convenience stores, restaurants, local retail
```

Each template covers multiple business types. You pick the visual feel, not a rigid category.

Each template has a `site.config.json` that conforms to the shared `SiteConfig` type defined in section 6. That is the single source of truth — templates, the API, and the deploy function all use it.

**Claude's job**: take the business profile and fill in a valid `SiteConfig`. That's it.
This is reliable, fast, and cheap (Haiku can do this for ~$0.001 per site).

**Deployment**: You maintain one Vercel project per template family (`localsite-bold`, `localsite-clean`, `localsite-warm`). Each business deploy is a new deployment on the matching template project, not a new Vercel project. Vercel preview deployments are unique per deploy — each business gets its own shareable preview URL on the same project. This keeps Vercel project count at 3 total (plus 1 for the dashboard) and avoids hitting per-project limits.

### No generated code. Templates are tested and work every time.

---

## 10. How Outreach Works in V1

1. After a site is deployed, navigate to the outreach tab for that lead
2. Click "Draft Email"
3. Claude generates a short, natural cold email (3–5 sentences):
   - Addresses the business by name
   - Notes you built them a free demo site
   - Includes the Vercel preview URL
   - Ends with a soft CTA (reply to learn more / take it live for free this month)
4. You see the draft in an editable textarea
5. Edit as needed
6. Click **"Copy to Clipboard"** — paste into Gmail or any email client yourself
   - This is the default and requires no extra setup
   - Resend integration is optional: add `RESEND_API_KEY` to unlock "Send via App"
7. Mark as sent → lead status updates

**Copy-paste is the default. Resend is optional.** You review every email before it goes out.

---

## 11. Risks and Simplifications

| Risk | Simplification |
|---|---|
| Claude research has no live web access | Accept this limit in V1. Claude uses training knowledge. Most useful for generating copy and tone, not finding real contact info. Add Exa search in V2. |
| Template deploy on Vercel consumes your deployment quota | One Vercel project per template family (3 total). Each business site is a new deployment on the matching project — preview URL is unique per deploy. 100 deploys/day on free tier is plenty for V1. |
| Generated content is wrong or generic | You review content fields before deploying — edit anything that looks off. The system is a draft generator, not a final publisher. |
| Finding contact emails for cold outreach | V1 does not auto-find emails. You add the contact email manually on the lead page. Keep it simple and compliant. |
| Framer Motion 3D hero on every site | Not required. Each template decides its own hero. Only use parallax where it naturally fits (barber, construction). Clinic and convenience can be clean and minimal. |

---

## 12. Phased Implementation Plan

### Phase 1 — Foundation (build first)
**Goal**: Working app with auth, lead management, and the core DB.
- Init Next.js 16 app at `D:\vsc claude\localsite-pro\`
- Setup Neon DB + Drizzle ORM + schema migration
- Auth: login page + bcrypt cookie session (copy from vapes)
- Dashboard shell: sidebar, header, layout
- Leads page: table + add lead form
- Lead detail page: static layout with tabs
- `/api/leads` CRUD routes

**Done when**: You can log in, add a lead, see it in the table, open its detail page.

### Phase 2 — Research Flow
**Goal**: One-click business research via Claude.
- `POST /api/research/[leadId]` — Claude generates business profile JSON
- Research tab on Lead Detail page: "Run Research" button → loading state → display results with "⚠ Unverified" banner
- Editable fields for manual correction + "Approve Profile" button
- Saves to `business_profiles` table with `is_verified = false`; sets `is_verified = true` on approval; lead status → `researched`

**Done when**: Add a barber shop, click Research, see a realistic profile appear, approve it, watch status change to `researched`.

### Phase 3 — Site Templates
**Goal**: 3 working template projects you can deploy.
- Build 3 templates: `bold`, `clean`, `warm`
- Each accepts a `site.config.json` and renders the full site
- Test each template locally so they definitely build and look good
- `bold` gets the Framer Motion parallax hero; `clean` and `warm` get simple, polished hero sections
- Create the 3 Vercel template projects (`localsite-bold`, `localsite-clean`, `localsite-warm`) and note their project IDs

**Done when**: All 3 templates render correctly with placeholder data and are connected to Vercel projects.

### Phase 4 — Site Builder + Vercel Deploy
**Goal**: Generate content and deploy a template site from the dashboard.
- Site Builder tab on Lead Detail page: template picker + "Generate Content" button
- `POST /api/sites/generate` — Haiku fills SiteConfig fields; lead status → `site_ready`
- Display editable content fields (headline, services, colors, etc.)
- "Deploy to Vercel" button → `POST /api/sites/[id]/deploy`
- Vercel REST API deploys to the matching template project → preview URL saved; lead status → `deployed`

**Done when**: Pick a template, generate content, deploy, see a live preview URL.

### Phase 5 — Outreach Drafts
**Goal**: Generate and manage cold email drafts.
- Outreach tab on lead detail page
- "Draft Email" → Claude writes personalized cold email with preview URL
- Editable textarea + optional send via Resend
- Mark-as-sent button, history view

**Done when**: Full loop — lead → research → site → deployed → email drafted → marked sent.

---

## 13. Folder Structure

```
D:\vsc claude\localsite-pro\
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # sidebar + auth guard
│   │   │   ├── dashboard/page.tsx       # overview
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx             # leads table + add form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # lead detail with Research / Site Builder / Outreach tabs
│   │   └── api/
│   │       ├── auth/route.ts
│   │       ├── leads/route.ts           # GET list, POST create
│   │       ├── leads/[id]/route.ts      # GET, PATCH, DELETE
│   │       ├── research/[leadId]/route.ts
│   │       ├── sites/generate/route.ts
│   │       ├── sites/[id]/deploy/route.ts
│   │       └── outreach/[leadId]/route.ts
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── layout/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardHeader.tsx
│   │   ├── leads/
│   │   │   ├── LeadTable.tsx
│   │   │   ├── AddLeadForm.tsx
│   │   │   └── LeadStatusBadge.tsx
│   │   ├── research/
│   │   │   ├── ResearchPanel.tsx
│   │   │   └── ProfileEditor.tsx
│   │   ├── sites/
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   └── DeployButton.tsx
│   │   └── outreach/
│   │       ├── EmailDraftPanel.tsx
│   │       └── OutreachHistory.tsx
│   ├── db/
│   │   ├── index.ts                     # Neon + Drizzle client
│   │   ├── schema.ts                    # all 4 tables defined here
│   │   └── migrations/                  # Drizzle migration files
│   ├── lib/
│   │   ├── auth.ts                      # session cookie (from vapes)
│   │   ├── claude.ts                    # Anthropic SDK wrapper
│   │   ├── vercel-deploy.ts             # Vercel REST API client
│   │   ├── resend.ts                    # email sending
│   │   └── prompts/
│   │       ├── research.ts              # research system prompt
│   │       ├── content.ts               # content generation prompt
│   │       └── outreach.ts              # email draft prompt
│   └── types/index.ts
│
├── templates/                           # 3 pre-built Next.js template apps
│   ├── bold/                            # barbers, construction, auto shops
│   ├── clean/                           # clinics, dental, professional services
│   └── warm/                            # convenience stores, restaurants, local retail
│
└── .env.local
```

---

## 14. Environment Variables

```bash
# Database
DATABASE_URL=                  # Neon connection string

# Auth
ADMIN_PASSWORD_HASH=           # bcrypt hash of your password
ADMIN_SESSION_SECRET=          # 32-char random string

# AI
ANTHROPIC_API_KEY=

# Email (optional in V1 — manual copy/paste works too)
RESEND_API_KEY=
RESEND_FROM_EMAIL=you@yourdomain.com

# Vercel (for deploying generated sites)
VERCEL_API_TOKEN=
VERCEL_TEAM_ID=                # leave empty if personal account
VERCEL_PROJECT_BOLD=           # Vercel project ID for localsite-bold template
VERCEL_PROJECT_CLEAN=          # Vercel project ID for localsite-clean template
VERCEL_PROJECT_WARM=           # Vercel project ID for localsite-warm template
```

Only 11 env vars. Every one of them is necessary.

---

## 15. What to Build First vs What Can Wait

### Build in V1
- Auth + dashboard shell
- Lead CRUD + status tracking
- Claude research → business profile
- 3 site templates (bold, clean, warm — real, working, tested)
- Content generation → site deploy → Vercel preview URL
- Outreach email draft → manual send

### Wait for V2
- Live web search for research (Exa API integration)
- Auto-find contact emails from Google / business listings
- SMS outreach
- Bulk operations (batch research, batch generate)
- Analytics dashboard / funnel charts
- Client portal (share progress with the business)
- Automated follow-up sequences
- Domain management for client sites
- Stripe payments / invoicing

---

## 16. Files to Reuse From Existing Projects

| Existing File | Use in LocalSite Pro |
|---|---|
| `say my name vapes/.../lib/auth.ts` | Copy exactly, rename cookie to `localsite_session` |
| `say my name vapes/.../app/globals.css` | Copy design tokens, change brand color to indigo |
| `say my name vapes/.../components/layout/AdminSidebar.tsx` | Adapt nav items, same structure |
| `say my name vapes/.../app/(admin)/login/page.tsx` | Copy login page pattern |
| `say my name vapes/.../components/home/HeroSection.tsx` | Use as reference for barber + construction templates |
| `ai-website-cloner-template/package.json` | Match Next.js + React + shadcn versions |

---

## Why This Is the Right V1

This plan prioritizes what actually gets you clients:

1. **You can ship it**: 5 phases, each with a clear done condition, no dependency on unproven tech
2. **You control every step**: research, content, deploy, and email all require your approval before proceeding
3. **The templates are reliable**: pre-built sites deploy the same way every time; no risk of Claude writing broken code
4. **Low cost**: Haiku for content generation is ~$0.001 per site; Neon free tier handles hundreds of leads
5. **The workflow matches your actual pitch**: you build the site, then reach out — the tool makes that loop fast, not automatic

The goal of V1 is not to build an agency in a box. It is to make *you* faster and more credible when you knock on a business owner's door with a live website already built for them.
