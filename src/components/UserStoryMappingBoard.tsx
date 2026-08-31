"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import { usePersistentState } from "@/hooks/usePersistentState";

type StoryCard = { id: string; type: "task" | "story"; text: string; activityId: string; release: string; author: string; createdAt: number };
type MappingState = { title: string; activities: Array<{ id: string; name: string }>; cards: StoryCard[] };
type MappingEvent = { type: "state"; state: MappingState } | { type: "add"; card: StoryCard } | { type: "move"; id: string; activityId: string; release: string } | { type: "delete"; id: string };

const RELEASES = ["MVP", "Release 2", "Later"];
const EMPTY_STATE: MappingState = {
  title: "Untitled product story map",
  activities: [{ id: "discover", name: "Discover" }, { id: "decide", name: "Decide" }, { id: "deliver", name: "Deliver" }],
  cards: [],
};

function normalizeState(value: Partial<MappingState> | undefined): MappingState {
  const activities = Array.isArray(value?.activities) && value.activities.length ? value.activities.filter((activity) => activity && typeof activity.id === "string" && typeof activity.name === "string") : EMPTY_STATE.activities;
  const activityIds = new Set(activities.map((activity) => activity.id));
  return {
    title: typeof value?.title === "string" ? value.title : EMPTY_STATE.title,
    activities,
    cards: Array.isArray(value?.cards) ? value.cards.filter((card) => card && typeof card.id === "string" && activityIds.has(card.activityId) && RELEASES.includes(card.release) && (card.type === "task" || card.type === "story")).map((card) => ({ ...card, text: String(card.text), author: String(card.author) })) : [],
  };
}

export default function UserStoryMappingBoard({ sessionId }: { sessionId: string }) {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [state, setState] = usePersistentState<MappingState>(`user-story-mapping-${sessionId}`, EMPTY_STATE);
  const [selectedType, setSelectedType] = useState<"task" | "story">("story");
  const [draft, setDraft] = useState("");
  const [activityId, setActivityId] = useState(EMPTY_STATE.activities[0].id);
  const [release, setRelease] = useState(RELEASES[0]);
  const [activityDraft, setActivityDraft] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [connection, setConnection] = useState<"connecting" | "connected" | "offline">("connecting");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userRef = useRef("");
  const stateRef = useRef(state);
  const serverLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { stateRef.current = state; queueMicrotask(() => setLastSaved(new Date())); }, [state]);
  useEffect(() => {
    const savedName = localStorage.getItem(`user-story-mapping-name-${sessionId}`);
    if (!savedName) return;
    userRef.current = savedName;
    queueMicrotask(() => { setName(savedName); setJoined(true); });
  }, [sessionId]);

  const send = useCallback((event: MappingEvent) => { channelRef.current?.send({ type: "broadcast", event: event.type, payload: event }); }, []);
  const apply = useCallback((event: MappingEvent) => {
    setState((current) => {
      if (event.type === "state") return normalizeState(event.state);
      if (event.type === "add") return current.cards.some((card) => card.id === event.card.id) ? current : { ...current, cards: [...current.cards, event.card] };
      if (event.type === "move") return { ...current, cards: current.cards.map((card) => card.id === event.id ? { ...card, activityId: event.activityId, release: event.release } : card) };
      return { ...current, cards: current.cards.filter((card) => card.id !== event.id) };
    });
  }, [setState]);

  useEffect(() => {
    if (!joined) return;
    let cancelled = false;
    serverLoadedRef.current = false;
    fetch(`/api/collaboration-sessions/${sessionId}`, { cache: "no-store" }).then(async (response) => {
      if (cancelled || !response.ok) return;
      const saved = await response.json() as { tool_type?: string; state?: MappingState };
      if (!cancelled && saved.tool_type === "user_story_mapping" && saved.state) setState(normalizeState(saved.state));
    }).catch(() => {}).finally(() => { if (!cancelled) serverLoadedRef.current = true; });
    return () => { cancelled = true; };
  }, [joined, sessionId, setState]);

  useEffect(() => {
    if (!joined || !serverLoadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { fetch(`/api/collaboration-sessions/${sessionId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolType: "user_story_mapping", title: state.title, state }) }).catch(() => {}); }, 600);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [joined, sessionId, setState, state]);

  useEffect(() => {
    if (!joined) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channel = supabase.channel(`user-story-mapping-${sessionId}`, { config: { presence: { key: userRef.current }, broadcast: { self: true } } });
    channel.on("presence", { event: "sync" }, () => { const presence = channel.presenceState<{ name: string }>(); const names = Object.values(presence).flat().map((entry) => entry.name.trim()).filter(Boolean); setMembers(Array.from(new Set(names))); })
      .on("broadcast", { event: "request_state" }, () => { channel.send({ type: "broadcast", event: "state", payload: { type: "state", state: stateRef.current } }); })
      .on("broadcast", { event: "state" }, ({ payload }) => apply(payload as MappingEvent))
      .on("broadcast", { event: "add" }, ({ payload }) => apply(payload as MappingEvent))
      .on("broadcast", { event: "move" }, ({ payload }) => apply(payload as MappingEvent))
      .on("broadcast", { event: "delete" }, ({ payload }) => apply(payload as MappingEvent))
      .subscribe(async (status) => { if (status === "SUBSCRIBED") { setConnection("connected"); await channel.track({ name: userRef.current }); await channel.send({ type: "broadcast", event: "request_state", payload: { type: "request_state" } }); } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection("offline"); });
    channelRef.current = channel;
    return () => { channel.unsubscribe(); channelRef.current = null; };
  }, [apply, joined, sessionId]);

  const addCard = () => {
    const text = draft.trim();
    if (!text || !state.activities.some((activity) => activity.id === activityId)) return;
    const card: StoryCard = { id: crypto.randomUUID(), type: selectedType, text, activityId, release, author: userRef.current, createdAt: Date.now() };
    apply({ type: "add", card }); send({ type: "add", card }); setDraft("");
  };
  const moveCard = (id: string, nextActivityId: string, nextRelease: string) => { apply({ type: "move", id, activityId: nextActivityId, release: nextRelease }); send({ type: "move", id, activityId: nextActivityId, release: nextRelease }); };
  const addActivity = () => {
    const activityName = activityDraft.trim();
    if (!activityName) return;
    const newActivity = { id: crypto.randomUUID(), name: activityName };
    const nextState = { ...state, activities: [...state.activities, newActivity] };
    apply({ type: "state", state: nextState }); send({ type: "state", state: nextState }); setActivityDraft(""); setActivityId(newActivity.id);
  };
  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const width = doc.internal.pageSize.getWidth(); const height = doc.internal.pageSize.getHeight(); const margin = 12; const columnWidth = (width - margin * 2) / state.activities.length;
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, width, height, "F"); doc.setTextColor(15, 23, 42); doc.setFontSize(22); doc.text(state.title, margin, 16); doc.setFontSize(9); doc.setTextColor(100); doc.text(`User Story Map · ${new Date().toLocaleDateString()} · ${state.cards.length} cards`, margin, 22); doc.setDrawColor(203, 213, 225); doc.line(margin, 27, width - margin, 27);
    state.activities.forEach((activity, index) => { const x = margin + index * columnWidth; doc.setFillColor(219, 234, 254); doc.roundedRect(x + 1, 32, columnWidth - 2, 10, 2, 2, "F"); doc.setTextColor(30, 64, 175); doc.setFontSize(9); doc.text(activity.name, x + columnWidth / 2, 38, { align: "center" }); RELEASES.forEach((releaseName, releaseIndex) => { const y = 47 + releaseIndex * 38; doc.setFillColor(releaseIndex === 0 ? 220 : 241, releaseIndex === 0 ? 252 : 245, releaseIndex === 0 ? 231 : 249); doc.roundedRect(x + 2, y, columnWidth - 4, 34, 2, 2, "F"); doc.setTextColor(71, 85, 105); doc.setFontSize(7); doc.text(releaseName, x + 5, y + 6); const cards = state.cards.filter((card) => card.activityId === activity.id && card.release === releaseName); cards.slice(0, 4).forEach((card, cardIndex) => { doc.setTextColor(card.type === "story" ? 15 : 100, card.type === "story" ? 23 : 116, card.type === "story" ? 42 : 139); doc.setFontSize(7); doc.text(`${card.type === "story" ? "Story" : "Task"}: ${card.text.slice(0, 45)}`, x + 5, y + 12 + cardIndex * 5); }); }); });
    doc.setTextColor(71, 85, 105); doc.setFontSize(8); doc.text("Story map: activities show the user journey; rows show release slices from MVP to Later.", margin, height - 12); doc.save(`user-story-map-${sessionId}.pdf`);
  };
  const copySessionLink = async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/tools/user-story-mapping/${sessionId}`); setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 1800); } catch {} };
  const joinWorkshop = () => { const trimmed = name.trim(); if (!trimmed) return; userRef.current = trimmed; localStorage.setItem(`user-story-mapping-name-${sessionId}`, trimmed); setJoined(true); };
  const cardsFor = useMemo(() => (activity: string, releaseName: string) => state.cards.filter((card) => card.activityId === activity && card.release === releaseName), [state.cards]);

  if (!joined) return <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-10"><div className="w-full rounded-3xl border border-blue-200 bg-white p-8 shadow-xl"><div className="mb-6 text-4xl">🗺️</div><h1 className="text-3xl font-bold text-gray-950">User Story Mapping workshop</h1><p className="mt-2 text-gray-600">Shape a shared product journey and slice it into releases.</p><label className="mt-8 block text-sm font-semibold text-gray-700">Your name</label><input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && joinWorkshop()} placeholder="e.g. Ahmed" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" /><button onClick={joinWorkshop} disabled={!name.trim()} className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Join workshop →</button><p className="mt-5 break-all text-center font-mono text-xs text-gray-400">{sessionId}</p></div></div>;

  return <div className="min-h-screen bg-slate-50 pb-12"><header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3"><input value={state.title} onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))} className="min-w-[260px] flex-1 rounded-lg border border-transparent px-2 py-1 text-xl font-bold text-slate-900 hover:border-slate-200 focus:border-blue-400 focus:outline-none" aria-label="Workshop title" /><span className={`rounded-full px-3 py-1 text-xs font-semibold ${connection === "connected" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{connection === "connected" ? "● Live" : "○ Reconnecting"}</span><span className="text-sm text-slate-500">{members.length || 1} participant{members.length === 1 ? "" : "s"}</span>{(members.length ? members : [name]).map((member) => <span key={member} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{member}</span>)}<button onClick={copySessionLink} className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">{linkCopied ? "Link copied ✓" : "Copy session link"}</button><button onClick={exportPdf} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export PDF</button></div></header><main className="mx-auto max-w-[1500px] px-4 py-5"><div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="font-semibold text-blue-950">Build the story from left to right</p><p className="text-sm text-blue-800">Activities describe the journey. Tasks explain what users do. Stories define the smallest valuable slices for each release.</p><div className="mt-4 flex flex-wrap gap-2"><input value={activityDraft} onChange={(event) => setActivityDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addActivity()} placeholder="New activity, e.g. Pay" className="min-w-[220px] flex-1 rounded-xl border border-blue-200 px-4 py-3 text-sm" /><button onClick={addActivity} disabled={!activityDraft.trim()} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">+ Add activity</button><span className="self-center text-xs text-blue-700">Saved locally {lastSaved ? lastSaved.toLocaleTimeString() : "…"} · sessions expire after 14 days of inactivity</span></div></div><div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-2"><button onClick={() => setSelectedType("story")} className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${selectedType === "story" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600"}`}>User story</button><button onClick={() => setSelectedType("task")} className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${selectedType === "task" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"}`}>Task</button><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addCard()} placeholder={selectedType === "story" ? "e.g. Pay with a saved card" : "e.g. Enter payment details"} className="min-w-[240px] flex-1 rounded-xl border border-slate-300 px-4 py-3" /><select value={activityId} onChange={(event) => setActivityId(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-3">{state.activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}</select><select value={release} onChange={(event) => setRelease(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-3">{RELEASES.map((releaseName) => <option key={releaseName}>{releaseName}</option>)}</select><button onClick={addCard} disabled={!draft.trim()} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-40">Add {selectedType}</button></div></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid min-w-[1100px] gap-3" style={{ gridTemplateColumns: `repeat(${state.activities.length}, minmax(220px, 1fr))` }}>{state.activities.map((activity) => <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2"><div className="rounded-lg bg-blue-100 px-3 py-3 text-center font-bold text-blue-900">{activity.name}</div>{RELEASES.map((releaseName) => <div key={releaseName} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/plain"); if (id) moveCard(id, activity.id, releaseName); }} className="mt-2 min-h-[150px] rounded-lg border border-dashed border-slate-300 bg-white p-2"><div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{releaseName}</div>{cardsFor(activity.id, releaseName).map((card) => <div key={card.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)} className={`group mb-2 cursor-grab rounded-lg border-2 p-3 shadow-sm ${card.type === "story" ? "border-blue-200 bg-blue-50 text-blue-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}><div className="flex items-start justify-between gap-2"><div><span className="text-[10px] font-bold uppercase tracking-wide opacity-60">{card.type}</span><p className="mt-1 text-sm font-medium">{card.text}</p><p className="mt-2 text-[10px] opacity-60">{card.author}</p></div><button onClick={() => { apply({ type: "delete", id: card.id }); send({ type: "delete", id: card.id }); }} className="text-xs opacity-0 group-hover:opacity-100" aria-label={`Delete ${card.text}`}>✕</button></div></div>)}</div>)}</div>)}</div></div><p className="mt-3 text-center text-xs text-slate-500">Drag cards between activities and release slices. This workshop is saved in the browser, persisted in Supabase, and shared live.</p></main></div>;
}
