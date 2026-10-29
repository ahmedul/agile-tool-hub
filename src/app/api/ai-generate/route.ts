import { NextResponse } from "next/server";

// Keep the paid provider unreachable until accounts, server-side quotas,
// and billing are implemented together for the AI launch.
export async function POST() {
  return NextResponse.json(
    { error: "AI mode is coming soon. Please use the free Local mode tools." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
