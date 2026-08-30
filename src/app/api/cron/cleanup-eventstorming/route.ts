import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INACTIVITY_DAYS = 15;

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

  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("collaboration_sessions")
    .delete({ count: "exact" })
    .eq("tool_type", "event_storming")
    .lt("updated_at", cutoff);

  if (error) return Response.json({ error: "Could not clean up expired sessions." }, { status: 500 });
  return Response.json({ deleted: count ?? 0, inactivityDays: INACTIVITY_DAYS, cutoff });
}
