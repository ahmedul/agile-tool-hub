import { createClient } from "@supabase/supabase-js";
import { mergeStormStates } from "@/lib/eventStorming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function validSessionId(sessionId: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
}

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!validSessionId(sessionId)) return Response.json({ error: "Invalid session ID." }, { status: 400 });
  const supabase = getAdminClient();
  if (!supabase) return Response.json({ error: "Durable session storage is not configured." }, { status: 503 });
  const { data, error } = await supabase.from("collaboration_sessions").select("session_id, tool_type, title, state, version, created_at, updated_at").eq("session_id", sessionId).maybeSingle();
  if (error) return Response.json({ error: "Could not load the session." }, { status: 500 });
  if (!data) return Response.json({ error: "Session has no saved snapshot yet." }, { status: 404 });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!validSessionId(sessionId)) return Response.json({ error: "Invalid session ID." }, { status: 400 });
  const supabase = getAdminClient();
  if (!supabase) return Response.json({ error: "Durable session storage is not configured." }, { status: 503 });
  let body: { toolType?: unknown; title?: unknown; state?: unknown; version?: unknown };
  try { body = await request.json() as typeof body; } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (!body || !(body.toolType === "event_storming" || body.toolType === "user_story_mapping") || typeof body.title !== "string" || !body.state || typeof body.state !== "object" || Array.isArray(body.state)) return Response.json({ error: "Invalid collaboration session payload." }, { status: 400 });
  if (JSON.stringify(body.state).length > 500_000) return Response.json({ error: "Session state is too large." }, { status: 413 });

  // Retry a conflicting write against the latest snapshot instead of losing
  // cards or deletion markers when two participants save at the same time.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: existing, error: readError } = await supabase.from("collaboration_sessions")
      .select("state, version, tool_type").eq("session_id", sessionId).maybeSingle();
    if (readError) return Response.json({ error: "Could not read the existing session." }, { status: 500 });
    if (existing && existing.tool_type !== body.toolType) return Response.json({ error: "This session belongs to another tool." }, { status: 409 });
    const state = body.toolType === "event_storming" ? mergeStormStates(existing?.state, body.state) : body.state;
    const snapshot = {
      session_id: sessionId,
      tool_type: body.toolType,
      title: body.title.slice(0, 200),
      state,
      version: (existing?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
    };
    if (JSON.stringify(state).length > 500_000) return Response.json({ error: "Session state is too large." }, { status: 413 });
    const result = existing
      ? await supabase.from("collaboration_sessions").update(snapshot).eq("session_id", sessionId).eq("version", existing.version).select("session_id, version, updated_at").maybeSingle()
      : await supabase.from("collaboration_sessions").insert(snapshot).select("session_id, version, updated_at").single();
    if (result.error?.code === "23505") continue;
    if (result.error) return Response.json({ error: "Could not save the session." }, { status: 500 });
    if (!result.data) continue;
    return Response.json({ saved: true, ...result.data }, { headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ error: "The session changed while saving. Please try again." }, { status: 409, headers: { "Cache-Control": "no-store" } });
}
