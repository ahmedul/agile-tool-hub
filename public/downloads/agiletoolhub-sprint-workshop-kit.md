# Free Sprint Workshop Kit

Use this kit to practice backlog refinement, team estimation, and a short retrospective. It contains a fictional catalog backlog, two example agendas, and a decision record. Adjust the timings and scope to your team; these are practice agendas, not prescribed Scrum event timeboxes.

Source and online guide: https://agiletoolhub.com/guides/free-sprint-workshop-kit

## Prepare the session

Choose a facilitator and someone to record decisions. Invite the people who will implement, test, and review the work. Decide whether you are using the fictional backlog below or your own appropriately shared examples.

Open the tools before the meeting:

- Planning Poker: https://agiletoolhub.com/tools/planning-poker
- Sprint Capacity Calculator: https://agiletoolhub.com/tools/sprint-capacity-calculator
- Sprint Planning Checklist: https://agiletoolhub.com/tools/sprint-planning-checklist
- User Story Generator: https://agiletoolhub.com/tools/user-story-generator
- Acceptance Criteria Generator: https://agiletoolhub.com/tools/acceptance-criteria-generator
- Retrospective Board: https://agiletoolhub.com/tools/retro-board

Create a fresh board or estimation session and share its invite link. Use a short practice round so everyone sees how joining and revealing work before discussing real backlog items. Save the results you need before leaving the session.

## Fictional product context

A small online shop wants shoppers to find suitable products within their budget. The catalog already has product names, categories, and prices. Whether its API supports combined queries is an open question for the exercise.

Possible goal for the exercise: shoppers can narrow the catalog to relevant products and recover when no products match.

## Sample backlog

| ID | User outcome | Review criteria | Question to clarify |
|---|---|---|---|
| CAT-1 | Narrow products by category | Show only the selected category; allow clearing it | Which categories exist and who maintains them? |
| CAT-2 | Narrow products by price range | Apply both price boundaries; combine with category | Does the API support the combined query? |
| CAT-3 | Recover from no matches | Show an empty state and a way to clear filters | Clear every filter or only the last changed filter? |
| CAT-4 | Keep browsing on a phone | Filters can be operated on supported mobile layouts | Which devices and accessibility checks are agreed? |
| CAT-5 | Understand a failed query | Show a recoverable error and allow retry | What happens to the active filters on retry? |

Do not assign a universal point value to these stories. Compare each with completed work your team understands, then discuss what makes it similar or different. CAT-4 may be part of the other stories' acceptance criteria rather than a separate story; agree on the team's completion standard.

## Example planning exercise in 45 minutes

| Minutes | Activity | Capture |
|---|---|---|
| 0–5 | Agree on the user outcome and scope | What is included and excluded |
| 5–10 | Check holidays, leave, support, and review availability | The assumptions behind the plan |
| 10–20 | Refine CAT-1 and CAT-2 | Criteria, dependencies, and unanswered questions |
| 20–35 | Estimate independently, reveal, and discuss differences | Reference story, spread, and reasons |
| 35–40 | Split or investigate uncertain work | Next question, owner, and expected output |
| 40–45 | Review a possible goal and next actions | What the team is ready to plan |

The facilitator asks the highest and lowest voters which assumptions explain their estimates. A spread such as 2, 3, and 8 is an invitation to discuss scope or uncertainty. Agree on what changed before voting again. A vote average does not replace that conversation.

## Review one story together

Rough notes:

```text
Shopper can narrow the catalog by category and price.
Keep both filters active together. Show an empty state when nothing matches.
Results should update within 2 seconds on the agreed test dataset.
Support mobile and desktop. Saved filters and recommendations are out of scope.
```

Ask the group:

1. Who benefits and what can they do afterward?
2. Which behavior can QA demonstrate with concrete data?
3. Which missing API fact could change the size?
4. Is there an independent smaller outcome worth delivering?
5. Which quality checks belong to the shared Definition of Done?

Try the notes in a generator if useful, then review every proposed criterion. The local generators structure a draft; your team supplies and verifies the product rules.

## Example retrospective exercise in 30 minutes

Use observations from the practice session or a completed Sprint. Avoid treating guesses about other people's intentions as observations.

| Minutes | Activity | Capture |
|---|---|---|
| 0–3 | Set the purpose and invite participation | One thing the group wants to understand |
| 3–10 | Write observations individually | What helped, what made work harder |
| 10–17 | Group related observations and discuss causes | A theme supported by examples |
| 17–24 | Choose one improvement experiment | A change the team can actually try |
| 24–30 | Name an owner and review point | What evidence would show progress |

Example experiment: before the next estimation session, attach a sample API response to every catalog-filter story. An agreed owner checks whether the team can explain the request and error behavior during refinement. Review what changed at the next session.

## Copyable decision record

```markdown
## Workshop decisions
Date:
Facilitator:
User outcome:
Scope included:
Scope excluded:

## Availability assumptions
Holidays and leave:
Meetings and support:
Role or review constraints:

## Estimation discussion
Story:
Completed reference story:
Initial vote spread:
Assumption clarified:
Decision after discussion:

## Next action
Question or experiment:
Owner:
Review date:
Evidence to bring back:
```

## Use the next session to learn

Save the reviewed notes and schedule a follow-up. Start a new session when needed, carry forward the agreed action, and inspect whether it helped. Do not depend on a private session link remaining available indefinitely.

For a two-session pilot, record whether participants could join, whether a real decision was reached, what blocked the session, and whether the facilitator chose to use the tool again. Keep any feedback or quotation private until the person agrees to publication.

## Further reading

- Story point estimation: https://agiletoolhub.com/guides/story-point-estimation-guide-with-examples
- Capacity planning: https://agiletoolhub.com/guides/sprint-capacity-planning-guide
- User stories: https://agiletoolhub.com/guides/how-to-write-user-stories
- Acceptance criteria: https://agiletoolhub.com/guides/how-to-write-acceptance-criteria
- Scrum Guide: https://scrumguides.org/scrum-guide.html

Use and adapt this kit with your team. Share the source link when passing it to another facilitator.
