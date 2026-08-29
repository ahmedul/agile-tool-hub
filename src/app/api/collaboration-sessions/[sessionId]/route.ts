import { createClient } from "@supabase/supabase-js";

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
  if (body.toolType !== "event_storming" || typeof body.title !== "string" || !body.state || typeof body.state !== "object") return Response.json({ error: "Invalid collaboration session payload." }, { status: 400 });
  if (JSON.stringify(body.state).length > 500_000) return Response.json({ error: "Session state is too large." }, { status: 413 });
  const { data, error } = await supabase.from("collaboration_sessions").upsert({
    session_id: sessionId,
    tool_type: body.toolType,
    title: body.title.slice(0, 200),
    state: body.state,
    version: typeof body.version === "number" ? body.version + 1 : 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: "session_id" }).select("session_id, version, updated_at").single();
  if (error) return Response.json({ error: "Could not save the session." }, { status: 500 });
  return Response.json({ saved: true, ...data }, { headers: { "Cache-Control": "no-store" } });
}
