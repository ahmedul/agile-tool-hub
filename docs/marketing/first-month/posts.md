# First month post drafts

These eight drafts provide two posts per week after the campaign website changes are deployed. Review the text and media, select the publishing account, and approve each publication. All links use the campaign labels in [campaign-links.csv](campaign-links.csv). No post has been published by preparing this file.

The first two demonstrations are silent screen recordings using fictional notes on a local copy of the site. Their text captions are included alongside the clips. The other shot lists can be recorded during the campaign using the same public examples.

## Week 1 ticket demonstration

Media: [Bug report demonstration](assets/bug-report-demo.mp4), with [captions](assets/bug-report-demo.srt).

Draft:

“Checkout is broken” leaves a lot of investigation for the next person.

A more useful ticket separates:

- The action that reproduces the issue.
- What was expected.
- What was actually observed.
- The environment and missing evidence.

I build AgileToolHub. This short demo shows rough fictional notes becoming a structured draft in the browser. The next step is reviewing that draft, especially any assumptions, before putting it into Jira.

Try it without an account:
https://agiletoolhub.com/tools/bug-report-to-jira-ticket-converter?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w1_ticket_before_after

What information is most often missing from the tickets your team receives?

## Week 1 user story demonstration

Media: [User story demonstration](assets/user-story-demo.mp4), with [captions](assets/user-story-demo.srt).

Draft:

“Add a filter” describes work. A useful story also explains who benefits and what they can do afterward.

For a fictional shop:

As a shopper comparing products, I want to filter by category and price, so that I can find suitable items within my budget.

Then make the boundaries explicit: combined filters, empty results, supported devices, and the API question that could change the scope.

I build AgileToolHub. Its free User Story Generator helps structure a first draft; your team still reviews the product rules and assumptions.

https://agiletoolhub.com/tools/user-story-generator?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w1_user_story

## Week 2 capacity worked example

Shot list: show the guide's five-person table, highlight the holiday and leave columns, then show the total and optional reserve. Keep the units visible.

Draft:

Five people. Ten weekdays. Eight hours per day.

That is 400 scheduled team-hours, before the calendar becomes real:

- Public holiday: 40 hours.
- Other leave: 24 hours.
- Planned meetings: 20 hours.
- Support duty: 16 hours.

The fictional team has 300 available hours. If it chooses a 10% reserve, that leaves a 270-hour planning allowance.

The reserve is an assumption for this example. It is not a universal Scrum rule, and hours are not a fixed conversion to story points.

I’ve put the full worked example in AgileToolHub:
https://agiletoolhub.com/guides/sprint-capacity-planning-guide?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w2_capacity

## Week 2 estimation discussion

Shot list: show the estimation exercise and its fictional vote spread, then create a practice Planning Poker session and demonstrate the invite link. Use synthetic participant names if recording a reveal.

Draft:

The Planning Poker votes are 2, 3, and 8. What do you ask next?

In this fictional catalog example, one person assumes the API already supports price ranges. Another expects a new query and migration.

They are estimating different work.

Ask which assumptions caused the spread, clarify the scope, and vote again. The explanation is more useful than averaging the first three numbers.

I build AgileToolHub and have added a short exercise for facilitating that conversation:
https://agiletoolhub.com/guides/story-point-estimation-guide-with-examples?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w2_estimation

## Week 3 API criteria example

Shot list: show the API quantity table, inspect values 1 and 10, then 0 and 11, and finish with the failure scenario. Make clear that HTTP statuses belong to this example contract.

Draft:

“Validate quantity” leaves important questions unanswered.

Suppose a fictional order API accepts quantities from 1 to 10. Test both valid boundaries, then 0, 11, and a missing value. Agree on the response and whether an order may be created for each case.

Concrete data makes an acceptance conversation easier to review.

I build AgileToolHub. Here is the worked table and a Gherkin-style failure scenario to adapt to your own API contract:
https://agiletoolhub.com/guides/how-to-write-acceptance-criteria?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w3_api_criteria

## Week 3 free workshop kit

Shot list: open the workshop guide, download the kit, and show the fictional backlog, two agendas, and decision record. Do not include a private session URL in a public recording.

Draft:

If you facilitate refinement or teach team estimation, I’ve prepared a free practice kit:

- Five fictional catalog stories.
- A 45 minute planning and estimation exercise.
- A 30 minute retrospective exercise.
- A decision record for assumptions and next actions.

The timings are example agendas you can adapt. The kit does not require an account or email address.

I build AgileToolHub and am looking for facilitators willing to try a session and tell me the first point of friction.

https://agiletoolhub.com/guides/free-sprint-workshop-kit?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w3_workshop_kit

## Week 4 retrospective experiment

Shot list: show a board containing synthetic observations, group one theme, and write an action with an owner and review point. Keep the focus on the action rather than the number of notes.

Draft:

A retrospective needs a next experiment people can actually inspect.

For a fictional team struggling with API assumptions, one action could be: attach a sample API response to catalog stories before the next refinement. Name an owner and ask at the next session whether the request and failure behavior were clearer.

The useful record is the change, the review point, and what the team learned afterward.

I build AgileToolHub. Its free Retro Board can support the observation and action discussion:
https://agiletoolhub.com/tools/retro-board?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w4_retro_experiment

## Week 4 draft recovery

Shot list: generate a sample story, refresh to restore it, show the saved message, and demonstrate Start over followed by Keep editing. In a separate browser test, show the manual-copy fallback or the Markdown download.

Draft:

A small workflow detail matters when writing a ticket: returning to the draft you were already working on.

The four local generators in AgileToolHub now keep drafts in the current browser, show save status, and offer a clear Start over action. If browser storage is unavailable, the tool says so and keeps editing usable for the visit. Results can also be copied or downloaded.

I build the site and would like to hear which part of preparing a Jira ticket costs your team the most effort.

https://agiletoolhub.com/tools/user-story-generator?utm_source=linkedin&utm_medium=social&utm_campaign=first_10_teams&utm_content=w4_saved_draft
