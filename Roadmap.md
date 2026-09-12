# AgileToolHub Roadmap

**Planning window:** September 12 to December 31, 2026  
**Primary target:** Validate a sustainable path to EUR 300/month without damaging the free tools.

## Product Principles

- Planning Poker and the core browser tools remain free, useful, and usable without an account.
- Paid features sell convenience, persistence, team coordination, or curated material.
- No intrusive advertising while traffic is still small.
- AI output remains assistive; teams review and own the final decision.
- Every paid feature must be measured before it is expanded.

## Offer Plan

| Offer | Price | What it includes | Status |
|---|---:|---|---|
| Free tools | EUR 0 | Unlimited local generators, Planning Poker sessions, boards, copy/export basics, guides, and individual templates | Live |
| Jira & Agile Starter Pack | EUR 19 launch / EUR 29 regular | Curated Jira templates, Scrum checklists, examples, extra formats, and AI prompts | Landing page live; checkout and delivery next |
| Pro AI | EUR 9-12/month | AI rewriting, story splitting, acceptance criteria improvements, and higher usage limits | Later, after AI mode is production-ready |
| Team Workspace | EUR 29-39/month | Persistent rooms, saved sessions, exports, team history, custom decks, and shared templates | Later, after usage validation |
| Backlog quality service | EUR 300-600/project | Jira backlog review, ticket improvements, Definition of Ready setup, and a refinement workshop | Validate manually |

## September: Validate The First Purchase

### Week of September 12

- [x] Publish the Starter Pack landing page.
- [x] Link the offer from the Pricing page.
- [ ] Set the launch price to EUR 19 and regular price to EUR 29.
- [ ] Choose a payment and delivery method.
- [ ] Create the first complete pack from existing templates and guides.
- [ ] Add a real checkout URL through `NEXT_PUBLIC_STARTER_PACK_CHECKOUT_URL`.
- [ ] Add purchase and checkout analytics.
- [ ] Share the launch with Scrum Masters, Product Owners, developers, and QA practitioners.

**Week-one success signal:** at least 3 checkout starts or early purchases, plus direct feedback from users.

### Weeks 2-3

- Improve the pack from questions and objections.
- Add targeted calls to action to high-traffic Jira, user-story, acceptance-criteria, and sprint-planning pages.
- Add a lightweight email capture for pack updates and delivery.
- Publish two useful launch posts, not generic promotional content.
- Test EUR 19 against EUR 29 after the first 10-25 customers.

### Week 4

- Review product-page visits, checkout starts, purchases, and revenue.
- Keep, revise, or retire the pack based on evidence.
- Contact a small number of teams about the backlog-quality service.

## October: Improve Conversion And Retention

- Add a simple customer delivery and update workflow.
- Create one focused landing page for backlog-quality services.
- Improve the most visited tool journeys, especially Planning Poker and story-point estimation.
- Add clear free-to-paid CTAs after users copy or export results.
- Publish content based on Search Console queries with high impressions and low CTR.
- Target: 10-16 pack sales/month or one paid service engagement.

## November: Build Recurring Value Carefully

- Review repeated use of Planning Poker, Retro Board, and Story Mapping.
- Interview active users about saved sessions, exports, and team history.
- Prototype persistent team rooms only if users request them.
- Define the Pro AI usage limits and cost model before enabling subscriptions.
- Keep the public AI-agent API and documentation available as a free discovery channel.

## December: Decide The 2027 Model

- Compare revenue from the pack, services, and any recurring product.
- Decide whether to launch Team Workspace, Pro AI, or both.
- Create a small customer case study from an early team.
- Review SEO growth, Google versus Bing traffic, tool usage, and conversion events.
- Set the 2027 target based on real conversion data rather than traffic forecasts.

## Measurement

Track these events in GA4:

- `pack_view`
- `checkout_start`
- `purchase`
- `email_signup`
- `tool_session_created`
- `output_copy`
- `tool_feedback_submitted`

The first commercial target is **EUR 300 gross/month**. Net revenue will be lower after payment fees, taxes, refunds, and service costs.

## Explicit Non-Goals

- No paywall before a user can create a Planning Poker session.
- No charge for basic copy/export functionality in the free tools.
- No large AI subscription build before the current workflows show demand.
- No ads until traffic is high enough that ads are meaningful and do not harm usability.
