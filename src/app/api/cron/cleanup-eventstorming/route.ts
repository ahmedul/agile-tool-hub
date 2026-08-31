import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS: Record<string, number> = { event_storming: 15, user_story_mapping: 14 };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return Response.json({ error: "Durable session storage is not configured." }, { status: 503 });

  const deleted: Record<string, number> = {};
  for (const [toolType, inactivityDays] of Object.entries(RETENTION_DAYS)) {
    const cutoff = new Date(Date.now() - inactivityDays * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase.from("collaboration_sessions").delete({ count: "exact" }).eq("tool_type", toolType).lt("updated_at", cutoff);
    if (error) return Response.json({ error: `Could not clean up ${toolType} sessions.` }, { status: 500 });
    deleted[toolType] = count ?? 0;
  }
  return Response.json({ deleted, retentionDays: RETENTION_DAYS });
}
