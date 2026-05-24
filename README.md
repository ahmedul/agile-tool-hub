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

### Templates (12)

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

### Guides (7)

| Slug | URL |
|---|---|
| how-to-write-a-good-jira-ticket | /guides/how-to-write-a-good-jira-ticket |
| bug-report-vs-jira-ticket | /guides/bug-report-vs-jira-ticket |
| how-to-write-acceptance-criteria | /guides/how-to-write-acceptance-criteria |
| how-to-run-a-sprint-retrospective | /guides/how-to-run-a-sprint-retrospective |
| how-to-write-a-feature-request | /guides/how-to-write-a-feature-request |
| agile-vs-waterfall | /guides/agile-vs-waterfall |
| kanban-vs-scrum | /guides/kanban-vs-scrum |

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

Progress key: ✅ Done · ⏳ Planned

### Positioning update (added May 24, 2026)

Primary wedge for this project:

- Jira-ready ticket quality toolkit for software teams.
- Keep Agile/Scrum coverage, but prioritize bug reports, user stories, acceptance criteria, QA handoff, and API requirements.
- Win with practical output quality, not broad generic Agile content.

### Priority fixes before judging 3-month results

| Item | Status |
|---|---|
| Fix context-mismatched CTAs on template/doc pages | ✅ (contextual CTA inference system) |
| Add one-click copy buttons (Markdown/Jira/GitHub/Linear where relevant) | ✅ (TemplateCopyActions on high-intent pages) |
| Add About page with builder credibility and background | ✅ |
| Add Privacy page (Local mode vs AI mode data handling) | ✅ |
| Add ticket quality scoring for Bug Report Converter | ⏳ |
| Add analytics events (copy, generate, session created, feedback click) | ✅ (8 event types: generator_run, output_copy, session_created, template_copy, output_feedback, feedback_text_submitted) |
| Add output usefulness feedback prompt | ✅ (Yes/No buttons + free-text "What was missing?" form) |
| Search title polish pass (remove duplicated brand patterns) | ⏳ |

### Month 1 — May 2026 (Foundation + first tools)

| Week | Goal | Status |
|---|---|---|
| May 1–7 | Project setup, deploy to Vercel, 8 core templates | ✅ |
| May 8–14 | 5 guides, 4 examples, 5 docs pages, internal linking | ✅ |
| May 15–21 | AI tools: User Story Generator, AC Generator, Bug Report Converter | ✅ |
| May 24 | Planning Poker, Sprint Capacity Calculator, Retrospective Board (real-time) | ✅ |
| May 24 | AI mode foundation with monthly quota + pricing page | ✅ |
| May 24 | Contextual CTAs, copy buttons, About/Privacy pages, GA4 tracking, feedback forms | ✅ |
| May 25–31 | Measurement setup: Google Search Console, Bing Webmaster Tools, event tracking review, sitemap checks | ⏳ |

### Month 2 — June 2026 (Conversion + focused SEO)

| Week | Goal | Status |
|---|---|---|
| Jun 1–7 | Daily Standup Generator, Velocity Tracker tool (client-side) | ⏳ |
| Jun 8–14 | Publish high-intent pages only (Jira/API/QA ticket quality topics) | ⏳ |
| Jun 15–21 | Ticket quality score v1 in Bug Report Converter + search title polish | ⏳ |
| Jun 22–30 | Stripe billing integration (server-side plan enforcement) | ⏳ |

### Month 3 — July 2026 (Double down on winner)

| Week | Goal | Status |
|---|---|---|
| Jul 1–7 | Review analytics: identify the top-performing tool/page by usage and retention | ⏳ |
| Jul 8–14 | Improve winner tool 3x (quality, UX, export formats, trust) | ⏳ |
| Jul 15–21 | Add export formats for top workflow (Jira, GitHub Issues, Linear) | ⏳ |
| Jul 22–31 | Backlink outreach + launch push for the standout tool | ⏳ |

### August 2026 onwards — Monetisation + growth

| Item | Status |
|---|---|
| Google AdSense (once 1k+ daily sessions) | ⏳ |
| Stripe billing + server-side plan enforcement for AI mode | ⏳ |
| Pro tier design (saved sessions, team settings, export) | ⏳ |
| Email list / newsletter (Agile tip of the week) | ⏳ |
| LinkedIn + Twitter presence for tool launches | ⏳ |

---

## Content targets by end of August

| Section | Now | Target |
|---|---|---|
| Templates | 12 | 20 |
| Guides | 7 | 14 |
| Examples | 7 | 16 |
| Docs | 5 | 8 |
| Tools | 6 | 10 |

---

## Deployment

Every push to `main` auto-deploys to Vercel. Sitemap regenerates on every build.

```bash
git add . && git commit -m "feat: ..." && git push
```
