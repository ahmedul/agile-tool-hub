import { agentJson, agentOptions, isFiniteNumber, recordAgentRequest } from "@/lib/agent-api";
import {
  calculateStoryPointEstimate,
  STORY_POINT_FACTOR_KEYS,
  type StoryPointFactors,
} from "@/lib/agent-tools";

export const runtime = "edge";

function isValidFactors(value: unknown): value is StoryPointFactors {
  if (!value || typeof value !== "object") return false;
  const factors = value as Record<string, unknown>;
  return STORY_POINT_FACTOR_KEYS.every((key) => {
    const score = factors[key];
    return isFiniteNumber(score) && Number.isInteger(score) && score >= 0 && score <= 3;
  });
}

export async function OPTIONS() {
  return agentOptions();
}

export async function POST(request: Request) {
  let body: { story?: unknown; factors?: unknown };
  try {
    body = (await request.json()) as { story?: unknown; factors?: unknown };
  } catch {
    return agentJson({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (body.story !== undefined && typeof body.story !== "string") {
    return agentJson({ error: "story must be a string when provided." }, { status: 400 });
  }
  if (typeof body.story === "string" && body.story.length > 2000) {
    return agentJson({ error: "story must be 2,000 characters or fewer." }, { status: 400 });
  }
  if (!isValidFactors(body.factors)) {
    return agentJson({
      error: "factors must include effort, complexity, uncertainty, risk, and dependencies as integers from 0 to 3.",
    }, { status: 400 });
  }

  const response = agentJson({
    tool: "story-point-estimator",
    story: typeof body.story === "string" ? body.story.trim() : null,
    ...calculateStoryPointEstimate(body.factors),
    note: "This is a starting estimate. The delivery team should confirm the final estimate together.",
  });
  recordAgentRequest(request, "story-point-estimator", response.status);
  return response;
}
