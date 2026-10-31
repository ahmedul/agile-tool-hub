# First month growth campaign

Use the first month to find a repeatable way for Scrum Masters and software teams to discover AgileToolHub, complete a useful task, and choose to return. The long-term target is 1,000 weekly active users for four consecutive reporting weeks. The first-month adoption target is ten teams trying two sessions; report actual participation rather than assuming invitations become teams.

The working baseline is the supplied GA4 screenshot for October 22–28, 2026: 300 active users and 397 sessions. Its source table shows 111 Bing organic sessions and 13 Google organic sessions. These are historical screenshot values. Capture a fresh baseline before the first campaign post and use the same GA4 property and reporting window for later comparisons.

Paid spend: none. Campaign start: the day the website changes are merged and production is verified. The plan below is relative to that start; it does not schedule publication automatically.

## Materials ready for launch

- [Eight post drafts and recording instructions](posts.md).
- [Practical walkthrough draft](walkthrough.md) for the first longer demonstration.
- [Pilot invitations and feedback questions](pilot-outreach.md).
- [Campaign links](campaign-links.csv) with public destinations and distinct campaign labels.
- [Pilot tracker](pilot-tracker.csv) using team aliases rather than personal contact details.
- [Weekly scorecard](weekly-scorecard.csv), initially blank so unmeasured results stay unmeasured.
- [Free workshop guide](https://agiletoolhub.com/guides/free-sprint-workshop-kit) and [downloadable kit](https://agiletoolhub.com/downloads/agiletoolhub-sprint-workshop-kit.md).

Website and campaign links become usable after this branch is deployed. Review the posts with their media and choose recipients and the publishing account before anything is sent or posted externally.

## Four week cadence

| Week | Publish | Pilot work | Review |
|---|---|---|---|
| 1 | Ticket demonstration and user-story demonstration | Invite five suitable facilitators; arrange initial sessions with those who opt in | Verify campaign links, capture baseline, note first-use friction |
| 2 | Capacity example and estimation discussion | Invite five more; observe or collect feedback from first sessions | Check which pages lead to real tool use |
| 3 | API criteria example and workshop kit | Invite five more if needed; ask early pilots about a second session | Fix the most common blocker and review search impressions |
| 4 | Retrospective experiment and saved-draft demonstration | Continue suitable invitations until ten teams opt in; collect second-session feedback | Compare users, tool use, and team continuation; choose next month's emphasis |

Each week, contribute to up to three existing discussions where the topic fits and the community allows the contribution. Answer the question in the discussion itself, disclose that you built the tool when linking it, and adapt the examples in the outreach notes to the actual question. A post should remain useful without its link.

Twenty invitations are a working outreach batch, not a conversion forecast. Stop contacting a person who declines. Prefer existing relationships and channels that welcome tool feedback; select external coaches for a relevant workshop use case rather than sending the same message to a directory.

## Five search pages to improve and monitor

| Page | Reader's task | New practical material |
|---|---|---|
| [Story point estimation](https://agiletoolhub.com/guides/story-point-estimation-guide-with-examples) | Facilitate a useful sizing conversation | A timed exercise and a vote-spread discussion |
| [Sprint capacity planning](https://agiletoolhub.com/guides/sprint-capacity-planning-guide) | Account for the next Sprint's actual calendar | A consistent hours-based example with holidays, leave, and support |
| [Writing a Jira ticket](https://agiletoolhub.com/guides/how-to-write-a-good-jira-ticket) | Hand off a reproducible issue | A reviewer exercise separating observed behavior from assumptions |
| [Writing user stories](https://agiletoolhub.com/guides/how-to-write-user-stories) | Explain a user outcome with a useful boundary | A catalog-filter story with criteria, exclusions, and a dependency |
| [Writing acceptance criteria](https://agiletoolhub.com/guides/how-to-write-acceptance-criteria) | Check a behavior with concrete data | An API boundary table and a reviewable scenario |

These priorities use the supplied traffic and product scope. Refine them with current Search Console queries, impressions, clicks, and page data when available. Keep useful existing URLs and publication dates. Substantive updates have an updated date; a date change alone is not a content improvement.

## Measure the outcome consistently

The primary outcome is GA4 active users over a consistent seven-day window. Use the overall total; one person may appear under more than one source, so adding channel user counts can overstate reach. Sessions and events are separate measures.

Record these every week in the scorecard:

- Active users, new users, and returning users from the same GA4 report scope.
- Users who trigger `tool_used`, and the count of `generator_run` events for the local generators.
- Counts of `session_created` and `invite_copy` for team tools. These count actions, not distinct teams or successful teammate joins.
- Users who trigger `content_cta_click` from the homepage and guides.
- Clicks on `resource_download_click` for the workshop kit. This measures download intent, not proof the file was opened or the workshop ran.
- Google Search impressions and clicks for the five pages, plus Bing traffic from the acquisition report.
- Actual pilot teams completing a first and second session, using the tracker and facilitator feedback.

Use GA4 retention or cohort reports for seven- and fourteen-day return behavior when available. A second pilot session is a separate, concrete adoption signal and can be recorded without adding new account configuration. No Google account changes are required to publish the website and campaign materials.

Only external distribution links receive UTM parameters. Internal homepage, article, and tool links use their clean URLs, so navigating within the site does not create a new campaign label. Keep names, email addresses, private session links, and user-written ticket text out of campaign parameters.

## Decide what to do next

After five completed pilot sessions, review the most common blocker before expanding the product scope. After the first ten invitations, inspect who replied and why; revise the audience or message if it is not starting useful conversations. Compare posts using engaged visits and tool use, rather than impressions alone.

At the end of the month, choose the channel with the clearest evidence of useful visits and repeat use. Keep the other tests small. Search changes may need more time than the campaign: [Google describes effects taking weeks or months](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#how-long-until-i-see-impact-in-search-results). The simultaneous website and distribution changes make this an observational campaign, not a controlled attribution experiment.
