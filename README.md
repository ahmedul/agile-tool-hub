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

### Week 1 (May 27-Jun 2): QA + Bug Workflow Cluster

| Day | Deliverables (publish order) | File targets |
|---|---|---|
| Day 1 | QA to Dev Handoff template | `src/content/templates/qa-to-dev-handoff-template.mdx` |
| Day 2 | QA handoff implementation guide | `src/content/guides/qa-handoff-checklist-for-jira-teams.mdx` |
| Day 3 | Bug severity vs priority guide | `src/content/guides/bug-severity-vs-priority-jira-guide.mdx` |
| Day 4 | API bug ticket example | `src/content/examples/api-bug-ticket-example.mdx` |
| Day 5 | Mobile crash bug example | `src/content/examples/mobile-crash-jira-ticket-example.mdx` |
| Day 6 | Internal linking pass for new QA pages (8-12 links/page) | Update pages above + `src/app/templates/page.tsx` + `src/app/guides/page.tsx` + `src/app/examples/page.tsx` |
| Day 7 | Metadata/title optimization + final proof pass | Update frontmatter in all new files |

### Week 2 (Jun 3-Jun 9): Epic + Planning Cluster

| Day | Deliverables (publish order) | File targets |
|---|---|---|
| Day 8 | Epic template for Jira | `src/content/templates/epic-template-jira.mdx` |
| Day 9 | Task breakdown template | `src/content/templates/task-breakdown-template.mdx` |
| Day 10 | Backlog refinement template | `src/content/templates/backlog-refinement-template.mdx` |
| Day 11 | Epic breakdown guide | `src/content/guides/how-to-break-down-epics-into-user-stories.mdx` |
| Day 12 | Story estimation guide (advanced) | `src/content/guides/story-point-estimation-guide-with-examples.mdx` |
| Day 13 | Sprint goal examples | `src/content/examples/sprint-goal-examples-for-product-teams.mdx` |
| Day 14 | Indexation + measurement pass: sitemap, GSC inspect/request indexing, GA4 baseline snapshot | `public/sitemap.xml`, `public/sitemap-0.xml`, GA4 + GSC dashboards |

### Done Criteria (for each published page)

- Primary keyword in title, H1, intro paragraph, and slug
- Meta description includes concrete outcome and CTA to a related tool
- At least 8 internal links: 3 templates, 3 guides/examples, 2 tool links
- One copy action or tool CTA above the fold
- Included in listing pages and sitemap after deployment

### KPI Checkpoint (Jun 10)

- Indexed new pages: target 80%+ indexed in GSC
- Organic impressions: +30% vs May 26 baseline
- Tool click-through from content pages: 10%+ on new pages
- Copy events (`template_copy` or `output_copy`): +25% vs previous 14 days

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
