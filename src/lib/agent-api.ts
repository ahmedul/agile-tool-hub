import { NextResponse } from "next/server";

export const AGENT_API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

export function agentJson(data: unknown, init?: ResponseInit) {
  const tool = data && typeof data === "object" && "tool" in data && typeof data.tool === "string"
    ? data.tool
    : undefined;
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...AGENT_API_HEADERS,
      ...(tool ? { "X-AgileToolHub-Agent-Tool": tool } : {}),
      ...init?.headers,
    },
  });
}

export function recordAgentRequest(request: Request, tool: string, status: number): void {
  const userAgent = request.headers.get("user-agent") ?? "";
  const caller = /agent|bot|crawler|gpt|claude|copilot|llm/i.test(userAgent) ? "automated" : "other";
  recordAgentUsage(tool, status, caller);
}

export function recordAgentUsage(tool: string, status: number, caller: "automated" | "other" | "mcp"): void {
  console.info(JSON.stringify({ event: "agent_tool_request", tool, status, caller }));
}

export function agentOptions() {
  return new Response(null, { status: 204, headers: AGENT_API_HEADERS });
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
