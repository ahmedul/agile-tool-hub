import { agentJson, agentOptions } from "@/lib/agent-api";
import { CONTENT_TOOL_PRESETS, generateAgentAcceptanceCriteria, type AcceptanceCriteriaFormat } from "@/lib/agent-content-tools";

export const runtime = "edge";
const formats = ["gherkin", "checklist", "both"];

export async function OPTIONS() { return agentOptions(); }

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return agentJson({ error: "Request body must be valid JSON." }, { status: 400 }); }

  if (typeof body.story !== "string" || body.story.trim().length < 3 || body.story.length > 4000) {
    return agentJson({ error: "story must be a string between 3 and 4,000 characters." }, { status: 400 });
  }
  if (body.user !== undefined && typeof body.user !== "string") return agentJson({ error: "user must be a string when provided." }, { status: 400 });
  if (body.format !== undefined && !formats.includes(body.format as string)) return agentJson({ error: "format must be gherkin, checklist, or both." }, { status: 400 });
  if (body.preset !== undefined && !CONTENT_TOOL_PRESETS.includes(body.preset as never)) return agentJson({ error: "preset must be product, engineering, api, or tech_debt." }, { status: 400 });

  const result = generateAgentAcceptanceCriteria({
    story: body.story,
    user: body.user as string | undefined,
    format: body.format as AcceptanceCriteriaFormat | undefined,
    preset: body.preset as typeof CONTENT_TOOL_PRESETS[number] | undefined,
  });
  return agentJson({ tool: "acceptance-criteria-generator", ...result, note: "Deterministic first draft. Confirm business rules, edge cases, and expected behavior with Product, Engineering, and QA." });
}
