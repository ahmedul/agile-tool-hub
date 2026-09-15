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

function mergeEventStormingState(existing: unknown, incoming: Record<string, unknown>) {
  if (!existing || typeof existing !== "object") return incoming;
  const previous = existing as Record<string, unknown>;
  const previousCards = Array.isArray(previous.cards) ? previous.cards : [];
  const incomingCards = Array.isArray(incoming.cards) ? incoming.cards : [];
  const cards = new Map<string, unknown>();
  previousCards.forEach((card) => {
    if (card && typeof card === "object" && typeof (card as { id?: unknown }).id === "string") cards.set((card as { id: string }).id, card);
  });
  incomingCards.forEach((card) => {
    if (card && typeof card === "object" && typeof (card as { id?: unknown }).id === "string") cards.set((card as { id: string }).id, card);
  });
  const previousLinks = Array.isArray(previous.links) ? previous.links : [];
  const incomingLinks = Array.isArray(incoming.links) ? incoming.links : [];
  const links = new Map<string, unknown>();
  previousLinks.forEach((link) => {
    if (link && typeof link === "object" && typeof (link as { id?: unknown }).id === "string") links.set((link as { id: string }).id, link);
  });
  incomingLinks.forEach((link) => {
    if (link && typeof link === "object" && typeof (link as { id?: unknown }).id === "string") links.set((link as { id: string }).id, link);
  });
  return { ...previous, ...incoming, cards: Array.from(cards.values()), links: Array.from(links.values()) };
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
  if (!(body.toolType === "event_storming" || body.toolType === "user_story_mapping") || typeof body.title !== "string" || !body.state || typeof body.state !== "object") return Response.json({ error: "Invalid collaboration session payload." }, { status: 400 });
  if (JSON.stringify(body.state).length > 500_000) return Response.json({ error: "Session state is too large." }, { status: 413 });
  const existing = body.toolType === "event_storming"
    ? await supabase.from("collaboration_sessions").select("state").eq("session_id", sessionId).maybeSingle()
    : { data: null, error: null };
  if (existing.error) return Response.json({ error: "Could not read the existing session." }, { status: 500 });
  const state = body.toolType === "event_storming"
    ? mergeEventStormingState(existing.data?.state, body.state as Record<string, unknown>)
    : body.state;
  const { data, error } = await supabase.from("collaboration_sessions").upsert({
    session_id: sessionId,
    tool_type: body.toolType,
    title: body.title.slice(0, 200),
    state,
    version: typeof body.version === "number" ? body.version + 1 : 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: "session_id" }).select("session_id, version, updated_at").single();
  if (error) return Response.json({ error: "Could not save the session." }, { status: 500 });
  return Response.json({ saved: true, ...data }, { headers: { "Cache-Control": "no-store" } });
}
