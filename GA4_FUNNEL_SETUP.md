# GA4 measurement for AgileToolHub

Updated: 2026-10-29

## Event definitions

| Event | Meaning | Main dimensions |
|---|---|---|
| `content_cta_click` | A tracked article, quick-link, or offer link was clicked | `surface`, `href`, `category` where available |
| `tool_used` | First deliberate interaction with a local tool per page mount | `tool`, `mode` |
| `generator_run` | A local generator or velocity calculation ran | `tool`, `mode` |
| `output_copy` | Clipboard writing succeeded for a tool result | `tool`, `mode`, `output_length` |
| `template_copy` | Clipboard writing succeeded for a selected template section | `template_slug`, `section`, `format` |
| `session_created` | A collaboration link was created | `tool` |
| `session_joined` | A participant explicitly joined EventStorming or Story Mapping | `tool` |
| `invite_copy` | A collaboration invitation was copied | `tool` |
| `output_export` | EventStorming or Story Mapping invoked PDF export | `tool`, `format`, `card_count` |
| `output_feedback` | A user selected an output usefulness vote | `tool`, `mode`, `useful` |
| `feedback_text_submitted` | A short written feedback response was submitted | `tool`, `mode`, `text_length` |
| `checkout_start` | The starter-pack checkout link was clicked | `product`, `price`, `currency` |

Usage and copy tracking covers the story-point and capacity calculators, both interactive checklists, the three ticket generators, daily standup generation, and velocity tracking. `tool_used` excludes draft restoration and passive page views. Repeated calculations can produce several `generator_run` events but only one `tool_used` event per mounted tool. Copies remain separate events.

Do not send names, ticket text, workshop IDs, or free-text feedback as event parameters. Page URLs are still part of normal GA4 page measurement. A checkout click is not a confirmed purchase; purchase measurement requires the payment system's success signal.

## Configure the property manually

Repository changes do not change GA4 property settings. In Admin → Custom definitions, create event-scoped dimensions for `tool`, `mode`, `surface`, `template_slug`, `format`, and `useful` as needed. Allow processing time after registration; historical events may not expose newly registered custom dimensions in standard reports.

Choose key events deliberately. Successful `output_copy` and `template_copy` actions indicate useful output; `session_joined` indicates explicit participation only for the two newer boards. Keep `session_created` as a separate creation metric. Keep feedback optional rather than requiring it as the last conversion step.

## Build separate explorations

1. **Content to tool:** article `page_view` → `content_cta_click` with an appropriate tool destination → tool `tool_used` → `output_copy`. Use page-path and tool filters so events from unrelated tools are not mixed.
2. **Generator output:** tool `page_view` → `generator_run` → `output_copy`. Compare by `tool` and `mode`.
3. **Template value:** template `page_view` → `template_copy`, broken down by `template_slug` and `format`. Copying a template can be a complete successful visit.
4. **Collaboration:** landing-page `page_view` → `session_created`; separately inspect explicit `session_joined` for EventStorming and Story Mapping. A created URL does not establish that a team used it.
5. **Paid offer:** starter-pack `page_view` → `checkout_start`. Report purchases separately when payment-provider confirmation is available.

Use unique users or sessions as the funnel denominator, not raw event totals. Eleven key events do not necessarily mean eleven converted users. Review source, device, and landing-page cohorts over matching periods. Keep internal/testing traffic filtered out of production reports.

## Validate after deployment

Use GA4 DebugView or a browser analytics inspector to verify one example of each event. Confirm that copied outputs produce events only after clipboard success, restored drafts do not generate `tool_used`, and a second interaction on the same mounted tool does not generate a second `tool_used` event. Register custom dimensions before comparing tool cohorts.
