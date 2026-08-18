import { NextResponse } from "next/server";

export const AGENT_API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

export function agentJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...AGENT_API_HEADERS,
      ...init?.headers,
    },
  });
}

export function agentOptions() {
  return new Response(null, { status: 204, headers: AGENT_API_HEADERS });
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
