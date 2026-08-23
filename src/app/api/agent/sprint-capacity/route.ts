import { agentJson, agentOptions, isFiniteNumber, recordAgentRequest } from "@/lib/agent-api";
import { calculateSprintCapacity, type SprintCapacityMember } from "@/lib/agent-tools";

export const runtime = "edge";

function isValidMember(value: unknown): value is SprintCapacityMember {
  if (!value || typeof value !== "object") return false;
  const member = value as Record<string, unknown>;
  return (member.name === undefined || typeof member.name === "string")
    && isFiniteNumber(member.daysAvailable) && member.daysAvailable >= 0
    && isFiniteNumber(member.velocity) && member.velocity >= 0;
}

export async function OPTIONS() {
  return agentOptions();
}

export async function POST(request: Request) {
  let body: { sprintDays?: unknown; members?: unknown };
  try {
    body = (await request.json()) as { sprintDays?: unknown; members?: unknown };
  } catch {
    return agentJson({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isFiniteNumber(body.sprintDays) || body.sprintDays < 1 || body.sprintDays > 30) {
    return agentJson({ error: "sprintDays must be a number from 1 to 30." }, { status: 400 });
  }
  if (!Number.isInteger(body.sprintDays)) {
    return agentJson({ error: "sprintDays must be a whole number." }, { status: 400 });
  }
  if (!Array.isArray(body.members) || body.members.length < 1 || body.members.length > 50) {
    return agentJson({ error: "members must contain between 1 and 50 team members." }, { status: 400 });
  }
  if (!body.members.every(isValidMember)) {
    return agentJson({ error: "Each member needs non-negative daysAvailable and velocity numbers." }, { status: 400 });
  }

  const response = agentJson({
    tool: "sprint-capacity-calculator",
    ...calculateSprintCapacity(body.sprintDays, body.members),
    note: "Recommended capacity uses an 80% planning buffer. Adjust it using your team's history.",
  });
  recordAgentRequest(request, "sprint-capacity-calculator", response.status);
  return response;
}
