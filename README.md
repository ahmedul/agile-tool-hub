# AgileToolHub

**[agiletoolhub.com](https://agiletoolhub.com)** — Free Agile, Scrum, and software delivery templates and tools for engineering teams.

---

## What it is

AgileToolHub is a free, SEO-driven content site with browser-based tools for software teams. The goal is to rank for high-intent search terms like "Jira bug report template", "planning poker free", "sprint retrospective template" — and convert that traffic with genuinely useful tools that don't require a login.

No accounts. No paywalls. No fluff.

---

## Vision

Become the go-to free resource for Agile practitioners — the place teams bookmark for quick templates, reach for before sprint ceremonies, and share with new hires who need to learn the fundamentals. Revenue will come through non-intrusive ads (once traffic warrants it) and potentially a Pro tier for saved sessions, custom team settings, or export features.

The three pillars:

1. **Content** — High-quality MDX pages that rank. Templates, guides, examples, reference docs. Internal linking makes every page stronger.
2. **Tools** — Free, no-login browser tools that solve a real ceremony pain point. Real-time tools (Supabase) drive return visits.
3. **SEO compounding** — Each page links to related tools and content. More pages → more internal authority → higher rankings across the board.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Content | MDX + gray-matter (file-based, no CMS) |
| Real-time | Supabase Realtime (broadcast + presence) |
| Analytics | Google Analytics 4 |
| Sitemap | next-sitemap (auto on build) |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Domain | agiletoolhub.com (Route53 → Vercel) |

---

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + sitemap
```

Environment variables needed in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://ewwqajzsdcebvrynplkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_GA_ID=G-0J6N159QGS
OPENAI_API_KEY=<key>
```

---

## Content inventory

Adding a `.mdx` file to `src/content/{type}/` automatically adds it to the listing page. No code changes needed.

### Templates (15)

| Slug | URL |
|---|---|
| jira-bug-report-template | /templates/jira-bug-report-template |
| user-story-template | /templates/user-story-template |
| acceptance-criteria-template | /templates/acceptance-criteria-template |
| sprint-retrospective-template | /templates/sprint-retrospective-template |
| incident-postmortem-template | /templates/incident-postmortem-template |
| feature-request-template | /templates/feature-request-template |
| qa-test-case-template | /templates/qa-test-case-template |
| technical-debt-ticket-template | /templates/technical-debt-ticket-template |
| change-request-template | /templates/change-request-template |
| sprint-planning-template | /templates/sprint-planning-template |
| daily-standup-template | /templates/daily-standup-template |
| kanban-board-template | /templates/kanban-board-template |
| complete-jira-ticket-template | /templates/complete-jira-ticket-template |
| api-requirements-jira-template | /templates/api-requirements-jira-template |
| definition-of-ready-template | /templates/definition-of-ready-template |

### Guides (10)

| Slug | URL |
|---|---|
| how-to-write-a-good-jira-ticket | /guides/how-to-write-a-good-jira-ticket |
| bug-report-vs-jira-ticket | /guides/bug-report-vs-jira-ticket |
| how-to-write-acceptance-criteria | /guides/how-to-write-acceptance-criteria |
| acceptance-criteria-patterns-and-examples | /guides/acceptance-criteria-patterns-and-examples |
| how-to-run-a-sprint-retrospective | /guides/how-to-run-a-sprint-retrospective |
| how-to-write-a-feature-request | /guides/how-to-write-a-feature-request |
| agile-vs-waterfall | /guides/agile-vs-waterfall |
| kanban-vs-scrum | /guides/kanban-vs-scrum |
| api-requirements-for-jira-tickets | /guides/api-requirements-for-jira-tickets |
| user-story-examples-for-different-domains | /guides/user-story-examples-for-different-domains |

### Examples (7)

| Slug | URL |
|---|---|
| bug-report-example-for-web-application | /examples/bug-report-example-for-web-application |
| bug-report-example-for-mobile-app | /examples/bug-report-example-for-mobile-app |
| user-story-examples-for-login-page | /examples/user-story-examples-for-login-page |
| user-story-examples-for-dashboard | /examples/user-story-examples-for-dashboard |
| user-story-examples-for-mobile-app | /examples/user-story-examples-for-mobile-app |
| acceptance-criteria-examples-for-api | /examples/acceptance-criteria-examples-for-api |
| acceptance-criteria-examples-for-checkout | /examples/acceptance-criteria-examples-for-checkout |

### Docs (5)

| Slug | URL |
|---|---|
| agile-glossary | /docs/agile-glossary |
| story-points-explained | /docs/story-points-explained |
| scrum-ceremonies-explained | /docs/scrum-ceremonies-explained |
| definition-of-done-explained | /docs/definition-of-done-explained |
| kanban-explained | /docs/kanban-explained |

---

## Tools inventory

| Tool | URL | Type | Status |
|---|---|---|---|
| Planning Poker | /tools/planning-poker | Real-time (Supabase) | ✅ Live |
| Retrospective Board | /tools/retro-board | Real-time (Supabase) | ✅ Live |
| Sprint Capacity Calculator | /tools/sprint-capacity-calculator | Client-side | ✅ Live |
| User Story Generator | /tools/user-story-generator | AI (OpenAI) | ✅ Live |
| Acceptance Criteria Generator | /tools/acceptance-criteria-generator | AI (OpenAI) | ✅ Live |
| Bug Report Converter | /tools/bug-report-to-jira-ticket-converter | AI (OpenAI) | ✅ Live |

---

## Roadmap — ~2 hrs/day, May–Aug 2026

**Strategic Focus:** SEO & organic traffic first. Defer Stripe billing & Pro features to Q3 2026.

Progress key: ✅ Done · ⏳ Planned

### Positioning update (added May 24, 2026)

Primary wedge for this project:

- Jira-ready ticket quality toolkit for software teams.
- Keep Agile/Scrum coverage, but prioritize bug reports, user stories, acceptance criteria, QA handoff, and API requirements.
- Win with practical output quality, not broad generic Agile content.

### SEO Strategy: High-Intent Keywords

**Biggest opportunities (US search volume):**
- "Jira ticket template" — 1,200+/mo ✅ (Complete Jira Ticket Template done)
- "API requirements template" — 300+/mo ✅ (API Requirements template done)
- "QA handoff template" — 100+/mo ⏳ (Phase 2)
- "Epic template" — 150+/mo ⏳ (Phase 2)
- "Definition of ready" — 200+/mo ✅ (DoR Template done)

### Priority fixes before judging 3-month results

| Item | Status |
|---|---|
| Fix context-mismatched CTAs on template/doc pages | ✅ (contextual CTA inference system) |
| Add one-click copy buttons (Markdown/Jira/GitHub/Linear where relevant) | ✅ (TemplateCopyActions on high-intent pages) |
| Add About page with builder credibility and background | ✅ |
| Add Privacy page (Local mode vs AI mode data handling) | ✅ |
| Add ticket quality scoring for Bug Report Converter | ✅ (quality score v1 with 7 criteria + GA event) |
| Add analytics events (copy, generate, session created, feedback click) | ✅ (8 event types: generator_run, output_copy, session_created, template_copy, output_feedback, feedback_text_submitted) |
| Add output usefulness feedback prompt | ✅ (Yes/No buttons + free-text "What was missing?" form) |
| Search title polish pass (remove duplicated brand patterns) | ✅ |
| Google Search Console setup & monitoring | ⏳ (Priority for June) |
| Bing Webmaster Tools setup | ⏳ (Priority for June) |

### Month 1 — May 2026 (Foundation + first tools)

| Week | Goal | Status |
|---|---|---|
| May 1–7 | Project setup, deploy to Vercel, 8 core templates | ✅ |
| May 8–14 | 5 guides, 4 examples, 5 docs pages, internal linking | ✅ |
| May 15–21 | AI tools: User Story Generator, AC Generator, Bug Report Converter | ✅ |
| May 24 | Planning Poker, Sprint Capacity Calculator, Retrospective Board (real-time) | ✅ |
| May 24 | AI mode foundation with monthly quota + pricing page | ✅ |
| May 24 | Contextual CTAs, copy buttons, About/Privacy pages, GA4 tracking, feedback forms | ✅ |
| May 25–31 | Complete Jira Ticket Template, API Requirements Template, Definition of Ready Template (SEO priority) | ✅ |
| May 25–31 | Planning Poker session persistence fix (localStorage restore on refresh) | ✅ |
| May 25–31 | Measurement setup: Google Search Console, Bing Webmaster Tools, event tracking review, sitemap checks | ⏳ |

### Month 2 — June 2026 (SEO content sprint + tool pairing)

| Week | Goal | Status |
|---|---|---|
| Jun 1–7 | **QA Content Phase:** QA to Dev Handoff Template, QA Handoff Guide, Bug Severity & Priority Guide | ⏳ |
| Jun 8–14 | **Epic & Planning Phase:** Epic Template + Breakdown Guide, Backlog Refinement Template | ⏳ |
| Jun 15–21 | **Tool Building:** Daily Standup Generator (pair with template), Velocity Tracker tool | ⏳ |
| Jun 22–30 | **SEO Setup:** Google Search Console verification, Bing Webmaster setup, internal linking audit, meta description optimization | ⏳ |

### Month 3 — July 2026 (Double down on winners + content depth)

| Week | Goal | Status |
|---|---|---|
| Jul 1–7 | GA4 analysis: identify top-performing tool/page by CTR, session duration, copy rate | ⏳ |
| Jul 8–14 | Expand winner content: add 3 new guides/examples for top 2 keywords; improve existing weak pages | ⏳ |
| Jul 15–21 | **Export Formats:** Add Jira, GitHub Issues, Linear export for top tools (Bug Report Converter, User Story Generator) | ⏳ |
| Jul 22–31 | Backlink outreach + LinkedIn/Twitter launch push for standout tool | ⏳ |

### August 2026 onwards — Growth & scale

| Item | Status |
|---|---|
| Reach 1k+ daily sessions target (trigger for AdSense) | ⏳ |
| Stripe billing + server-side plan enforcement for AI mode | ⏳ (deferred to Q3) |
| Pro tier design (saved sessions, team settings, export) | ⏳ (deferred to Q3) |
| Email list / newsletter (Agile tip of the week) | ⏳ |
| LinkedIn + Twitter presence for tool launches | ⏳ |

---

## Next 14 Days Execution Checklist (May 27-Jun 9)

Goal: ship high-intent SEO pages in clusters (template + guide + examples), then tighten internal linking and indexation.

### Week 1 (May 27-Jun 2): QA + Bug Workflow Cluster ✅ COMPLETE

| Day | Deliverables (publish order) | File targets | Status |
|---|---|---|---|
| Day 1 | QA to Dev Handoff template | `src/content/templates/qa-to-dev-handoff-template.mdx` | ✅ Done |
| Day 2 | QA handoff implementation guide | `src/content/guides/qa-handoff-checklist-for-jira-teams.mdx` | ✅ Done |
| Day 3 | Bug severity vs priority guide | `src/content/guides/bug-severity-vs-priority-jira-guide.mdx` | ✅ Done |
| Day 4 | API bug ticket example | `src/content/examples/api-bug-ticket-example.mdx` | ✅ Done (replaced with mobile-crash) |
| Day 5 | Mobile crash bug example | `src/content/examples/mobile-crash-jira-ticket-example.mdx` | ✅ Done |
| Day 6 | Internal linking pass for new QA pages (8 links/page) | All QA pages | ✅ Done |
| Day 7 | Metadata/title optimization + final proof pass | All QA frontmatter | ✅ Done |

**Results**: 5 new pages published, 37 → 42 total pages, +7 keywords per page, 8 relatedLinks per page

### Week 2 (Jun 3-Jun 9): Epic + Planning Cluster ✅ COMPLETE

| Day | Deliverables (publish order) | File targets | Status |
|---|---|---|---|
| Day 8 | Epic template for Jira | `src/content/templates/epic-template-jira.mdx` | ✅ Done |
| Day 9 | Task breakdown template | `src/content/templates/task-breakdown-template.mdx` | ✅ Done |
| Day 10 | Backlog refinement template | `src/content/templates/backlog-refinement-template.mdx` | ✅ Done |
| Day 11 | Epic breakdown guide | `src/content/guides/how-to-break-down-epics-into-user-stories.mdx` | ✅ Done |
| Day 12 | Story estimation guide (advanced) | `src/content/guides/story-point-estimation-guide-with-examples.mdx` | ✅ Done |
| Day 13 | Sprint goal examples | `src/content/examples/sprint-goal-examples-for-product-teams.mdx` | ✅ Done |
| Day 14 | Indexation + measurement pass: verify sitemap, GSC submission, GA4 baseline | See Day 14 section below | 🔄 In Progress |

**Results**: 6 new pages published, 42 → 48 total pages, all in sitemap, build passing

### Done Criteria (for each published page)

- Primary keyword in title, H1, intro paragraph, and slug
- Meta description includes concrete outcome and CTA to a related tool
- At least 8 internal links: 3 templates, 3 guides/examples, 2 tool links
- One copy action or tool CTA above the fold
- Included in listing pages and sitemap after deployment

## Day 14: Indexation & Measurement Checklist

### Phase 1: Verify Sitemap ✅

**Status**: Sitemap auto-generated and includes all 48 pages
- Sitemap location: `https://agiletoolhub.com/sitemap.xml`
- Sitemap index: `https://agiletoolhub.com/sitemap-0.xml`
- Last updated: 2026-05-27 (auto-updated on each deployment)
- Total URLs: 48 pages

**New pages added** (confirmed in sitemap):
- `/templates/epic-template-jira` ✅
- `/templates/task-breakdown-template` ✅
- `/templates/backlog-refinement-template` ✅
- `/guides/how-to-break-down-epics-into-user-stories` ✅
- `/guides/story-point-estimation-guide-with-examples` ✅
- `/examples/sprint-goal-examples-for-product-teams` ✅

### Phase 2: Submit to Google Search Console

**Steps**:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property: `agiletoolhub.com` (or add if not exist)
3. Navigate to **Sitemaps** (left sidebar under "Index")
4. Enter URL: `https://agiletoolhub.com/sitemap.xml`
5. Click "Submit"
6. Verify "Success" status appears

**Individual URL Inspection** (for new pages):
1. Go to **URL Inspection** (left sidebar)
2. For each new page, enter URL and press Enter:
   - `https://agiletoolhub.com/templates/epic-template-jira`
   - `https://agiletoolhub.com/templates/task-breakdown-template`
   - `https://agiletoolhub.com/templates/backlog-refinement-template`
   - `https://agiletoolhub.com/guides/how-to-break-down-epics-into-user-stories`
   - `https://agiletoolhub.com/guides/story-point-estimation-guide-with-examples`
   - `https://agiletoolhub.com/examples/sprint-goal-examples-for-product-teams`
3. Click **"Request Indexing"** if status is "Not indexed"

**Expected Timeline**: Pages indexed within 1-7 days

### Phase 3: Submit to Bing Webmaster Tools

**Steps**:
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with Microsoft account
3. Add site: `agiletoolhub.com` (if not already added)
4. Go to **Sitemaps** (left sidebar)
5. Submit: `https://agiletoolhub.com/sitemap.xml`
6. Click "Submit"

**Result**: Bing crawls sitemap within 24-48 hours

### Phase 4: GA4 Baseline Capture

**Baseline snapshot** (as of May 27, 2026, 12:00 PM PT):

**Overall Metrics** (last 30 days):
- Users: [ENTER: Google Analytics → Acquisition → All users]
- Sessions: [ENTER: Google Analytics → Acquisition → Sessions]
- Pageviews: [ENTER: Google Analytics → Engagement → Pageviews]
- Bounce rate: [ENTER: Google Analytics → Engagement → Bounce rate]
- Avg session duration: [ENTER: Google Analytics → Engagement → Avg session duration]
- Organic traffic %: [ENTER: Google Analytics → Acquisition → Organic search / Total]

**Tool Usage** (last 30 days):
- Generator runs: [ENTER: GA4 → Custom Events → `generator_run`]
- Copy events: [ENTER: GA4 → Custom Events → `output_copy` + `template_copy`]
- Feedback submissions: [ENTER: GA4 → Custom Events → `output_feedback`]
- Session creates: [ENTER: GA4 → Custom Events → `session_created`]

**Content Performance** (new pages only):
- Template views: [ENTER: GA4 → Pages → QA/Epic/Planning pages total]
- Guide views: [ENTER: GA4 → Pages → New guides total]
- Example views: [ENTER: GA4 → Pages → New examples total]
- Tool CTR from new pages: [ENTER: GA4 → Events → Tool clicks from new pages / new page views]

**How to capture**:
1. Open Google Analytics dashboard
2. Go to **Reports** → **Acquisition** → **User Acquisition**
3. Take screenshot of main metrics
4. Go to **Events** → Filter by custom events (generator_run, output_copy, etc.)
5. Take screenshots for tracking tool usage
6. Document in [CONTENT_GAP_ANALYSIS.md](./CONTENT_GAP_ANALYSIS.md) under "May 27 Baseline"

### Phase 5: Set Up Monitoring

**Add to your calendar**:
- **Jun 3**: Check GSC for indexed pages (target: 50%+ indexed)
- **Jun 10**: KPI checkpoint (see below)
- **Jun 17**: Mid-month review (indexation target 80%+)
- **Jun 24**: Monthly review + June strategy adjustment

**GA4 Dashboard Setup**:
1. Create custom dashboard: "SEO Content Performance"
2. Add cards:
   - Organic traffic (last 30 days)
   - New content views (template + guide + example)
   - Tool CTR from content
   - Copy events trend
3. Set to auto-refresh daily

### KPI Checkpoint (Jun 10, Expected Results)

- Indexed new pages: **target 80%+ indexed in GSC** (6 new pages)
- Organic impressions: **+30% vs May 26 baseline** (measured via GSC)
- Tool click-through from content pages: **10%+ on new pages** (via GA4 events)
- Copy events: **+25% vs previous 14 days** (measured via GA4 `output_copy` + `template_copy`)

---

## Content targets by end of August (SEO focus)

| Section | Now | Target | Why |
|---|---|---|---|
| Templates | 15 | 25 | Capture all high-intent Jira/QA/Planning keywords |
| Guides | 10 | 18 | Deep content for each keyword (how-to + best practices) |
| Examples | 7 | 20 | Real-world examples for each tool (boost CTR + internal linking) |
| Docs | 5 | 10 | Foundational/glossary content for long-tail keywords |
| Tools | 6 | 8 | Daily Standup Generator, Velocity Tracker (pair with guides) |

**Total content pages:** 37 → 81 (2.2x growth by Aug 31)

---

## Deployment

Every push to `main` auto-deploys to Vercel. Sitemap regenerates on every build.

```bash
git add . && git commit -m "feat: ..." && git push
```
