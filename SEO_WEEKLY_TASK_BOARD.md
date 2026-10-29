# SEO implementation and follow-up board

Updated: 2026-10-29

## Implemented in the repository

- Patch vulnerable framework, MCP, validation, and transitive dependencies.
- Disable the unlaunched paid AI provider endpoint.
- Preserve EventStorming deletion markers across persistence and reconnects; retry conflicting database saves.
- Remove unsupported hard-coded review ratings from tool and template listings.
- Add `noindex, nofollow` to all four workshop-session routes; retain indexable landing pages.
- Track intentional tool use, output copying, inline article CTAs, and new workshop session actions.
- Fix capacity-calculator mobile overflow and accessible input names.
- Offer quick copy for every template containing a complete code block, with a section selector.
- Replace filesystem dates with explicit repository-history dates and accurate content sitemap `lastmod` values.
- Improve five existing pages: story-point estimation, Jira ticket writing, the complete Jira template, the story-mapping guide, and the checkout story-map example.

The five pages were chosen from the supplied traffic titles and the content review. Their membership in Search Console's 30 excluded URLs is unknown.

## Search Console follow-up after deployment

| Status in supplied screenshot | Count | Next action |
|---|---:|---|
| Crawled, currently not indexed | 30 | Export the affected URLs, inspect intended canonical landing pages, and prioritize by query demand and usefulness. Do not assume a single cause. |
| Page with redirect | 21 | Confirm expected destinations. Leave intentional redirects in place. |
| Redirect error | 6 | Check the exact URLs and last crawl dates. Validation says Passed; remaining counts can reflect older observations. |
| Duplicate without selected canonical | 4 | Compare declared and selected canonicals on the actual URLs. |
| Discovered, currently not indexed | 5 | Review internal links, content value, and discovery dates. |
| Blocked by robots.txt | 1 | Identify the URL and current rule before changing robots.txt. The public robots file currently allows crawling. |

Inspect the three invalid review-snippet items after the markup changes are deployed. Request revalidation or recrawling for affected pages as appropriate. Do not promise a particular indexing date or assume schema errors explain the entire indexing trend.

## Account-level work still required

Search Console URL exports, query/page impressions and CTR, and GA4 property settings are not available from this repository. Use `GA4_FUNNEL_SETUP.md` to configure dimensions and explorations in the property. Use `SEO_WEEKLY_SCOREBOARD.md` to keep matched weekly comparisons.

Run `npm run check:seo -- http://localhost:3100` against a production build before pushing, or use the public deployment URL after release. This checks HTTP status, canonical URLs, sitemap exclusions, and workshop robots directives; it does not read Google's index.
