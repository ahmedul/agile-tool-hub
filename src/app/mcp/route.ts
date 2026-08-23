import { createMcpHandler, hostHeaderValidationResponse, McpServer, originValidationResponse } from "@modelcontextprotocol/server";
import { z } from "zod";
import { calculateSprintCapacity, calculateStoryPointEstimate } from "@/lib/agent-tools";
import { generateAgentAcceptanceCriteria, generateAgentUserStory } from "@/lib/agent-content-tools";
import { recordAgentUsage } from "@/lib/agent-api";

export const runtime = "nodejs";

const factorSchema = z.object({
  effort: z.number().int().min(0).max(3),
  complexity: z.number().int().min(0).max(3),
  uncertainty: z.number().int().min(0).max(3),
  risk: z.number().int().min(0).max(3),
  dependencies: z.number().int().min(0).max(3),
});

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function createServer() {
  const server = new McpServer(
    { name: "agiletoolhub", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "estimate_story_points",
    {
      title: "Estimate Story Points",
      description: "Create an explainable Fibonacci story point estimate from five 0-3 sizing factors.",
      inputSchema: {
        story: z.string().max(2000).optional().describe("Optional story summary"),
        factors: factorSchema.describe("Effort, complexity, uncertainty, risk, and dependencies rated from 0 to 3"),
      },
    },
    async ({ story, factors }) => { const result = { tool: "story-point-estimator", story: story?.trim() ?? null, ...calculateStoryPointEstimate(factors), note: "Starting estimate only; confirm it with the delivery team." }; recordAgentUsage(result.tool, 200, "mcp"); return textResult(result); },
  );

  server.registerTool(
    "calculate_sprint_capacity",
    {
      title: "Calculate Sprint Capacity",
      description: "Calculate maximum and recommended sprint capacity from team availability and velocity.",
      inputSchema: {
        sprintDays: z.number().int().min(1).max(30),
        members: z.array(z.object({ name: z.string().optional(), daysAvailable: z.number().min(0), velocity: z.number().min(0) })).min(1).max(50),
      },
    },
    async ({ sprintDays, members }) => { const result = { tool: "sprint-capacity-calculator", ...calculateSprintCapacity(sprintDays, members), note: "Recommended capacity uses an 80% planning buffer." }; recordAgentUsage(result.tool, 200, "mcp"); return textResult(result); },
  );

  server.registerTool(
    "generate_user_story",
    {
      title: "Generate a User Story",
      description: "Turn feature notes into a Jira-ready user story with acceptance criteria, dependencies, and clarifications.",
      inputSchema: {
        feature: z.string().min(3).max(4000),
        user: z.string().optional(),
        storyType: z.enum(["feature", "improvement", "task"]).optional(),
        priority: z.enum(["High", "Medium", "Low"]).optional(),
        preset: z.enum(["product", "engineering", "api", "tech_debt"]).optional(),
      },
    },
    async (input) => { const result = { tool: "user-story-generator", ...generateAgentUserStory(input), note: "Deterministic first draft; review scope and acceptance criteria with the team." }; recordAgentUsage(result.tool, 200, "mcp"); return textResult(result); },
  );

  server.registerTool(
    "generate_acceptance_criteria",
    {
      title: "Generate Acceptance Criteria",
      description: "Turn a story or feature note into testable Gherkin and/or checklist acceptance criteria.",
      inputSchema: {
        story: z.string().min(3).max(4000),
        user: z.string().optional(),
        format: z.enum(["gherkin", "checklist", "both"]).optional(),
        preset: z.enum(["product", "engineering", "api", "tech_debt"]).optional(),
      },
    },
    async (input) => { const result = { tool: "acceptance-criteria-generator", ...generateAgentAcceptanceCriteria(input), note: "Deterministic first draft; confirm business rules and edge cases with Product, Engineering, and QA." }; recordAgentUsage(result.tool, 200, "mcp"); return textResult(result); },
  );

  return server;
}

const handler = createMcpHandler(createServer, { legacy: "stateless" });

async function handle(request: Request) {
  const rejected =
    hostHeaderValidationResponse(request, ["agiletoolhub.com", "www.agiletoolhub.com"]) ??
    originValidationResponse(request, ["agiletoolhub.com"]);
  return rejected ?? handler.fetch(request);
}

export async function GET(request: Request) { return handle(request); }
export async function POST(request: Request) { return handle(request); }
export async function DELETE(request: Request) { return handle(request); }
