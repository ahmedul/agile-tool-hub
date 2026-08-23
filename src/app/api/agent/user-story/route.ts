import { agentJson, agentOptions, recordAgentRequest } from "@/lib/agent-api";
import { CONTENT_TOOL_PRESETS, generateAgentUserStory, type StoryPriority, type StoryType } from "@/lib/agent-content-tools";

export const runtime = "edge";

const storyTypes = ["feature", "improvement", "task"];
const priorities = ["High", "Medium", "Low"];

export async function OPTIONS() { return agentOptions(); }

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return agentJson({ error: "Request body must be valid JSON." }, { status: 400 }); }

  if (typeof body.feature !== "string" || body.feature.trim().length < 3 || body.feature.length > 4000) {
    return agentJson({ error: "feature must be a string between 3 and 4,000 characters." }, { status: 400 });
  }
  if (body.user !== undefined && typeof body.user !== "string") return agentJson({ error: "user must be a string when provided." }, { status: 400 });
  if (body.storyType !== undefined && !storyTypes.includes(body.storyType as string)) return agentJson({ error: "storyType must be feature, improvement, or task." }, { status: 400 });
  if (body.priority !== undefined && !priorities.includes(body.priority as string)) return agentJson({ error: "priority must be High, Medium, or Low." }, { status: 400 });
  if (body.preset !== undefined && !CONTENT_TOOL_PRESETS.includes(body.preset as never)) return agentJson({ error: "preset must be product, engineering, api, or tech_debt." }, { status: 400 });

  const result = generateAgentUserStory({
    feature: body.feature,
    user: body.user as string | undefined,
    storyType: body.storyType as StoryType | undefined,
    priority: body.priority as StoryPriority | undefined,
    preset: body.preset as typeof CONTENT_TOOL_PRESETS[number] | undefined,
  });
  const response = agentJson({ tool: "user-story-generator", ...result, note: "Deterministic first draft. Review scope, assumptions, and acceptance criteria with the delivery team." });
  recordAgentRequest(request, "user-story-generator", response.status);
  return response;
}
