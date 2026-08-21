import { agentJson, agentOptions } from "@/lib/agent-api";

export const runtime = "edge";

const tools = [
  {
    name: "estimate_story_points",
    tool: "story-point-estimator",
    description: "Estimate a story using effort, complexity, uncertainty, risk, and dependencies.",
    endpoint: "/api/agent/story-point",
    method: "POST",
    input: "factors: integers 0-3 for effort, complexity, uncertainty, risk, dependencies; optional story string",
    output: "Fibonacci estimate, confidence, high factors, and next actions",
  },
  {
    name: "calculate_sprint_capacity",
    tool: "sprint-capacity-calculator",
    description: "Calculate maximum and recommended sprint capacity from availability and velocity.",
    endpoint: "/api/agent/sprint-capacity",
    method: "POST",
    input: "sprintDays: integer 1-30; members: 1-50 entries with daysAvailable and velocity",
    output: "Maximum capacity, 80% recommended capacity, availability, and member capacities",
  },
  {
    name: "generate_user_story",
    tool: "user-story-generator",
    description: "Turn feature notes into a structured Jira-ready user story with acceptance criteria.",
    endpoint: "/api/agent/user-story",
    method: "POST",
    input: "feature string; optional user, storyType, priority, and preset",
    output: "Markdown story, parsed assumptions, and quality score",
  },
  {
    name: "generate_acceptance_criteria",
    tool: "acceptance-criteria-generator",
    description: "Turn a story or feature note into testable Gherkin and/or checklist criteria.",
    endpoint: "/api/agent/acceptance-criteria",
    method: "POST",
    input: "story string; optional user, format, and preset",
    output: "Markdown criteria, clarifications, and quality score",
  },
];

export async function OPTIONS() { return agentOptions(); }
export async function GET() {
  return agentJson({ name: "AgileToolHub Agent Tools", version: "1.1.0", baseUrl: "https://agiletoolhub.com", authentication: "none", openapi: "/openapi.json", documentation: "/docs/ai-agent-tools", tools });
}
