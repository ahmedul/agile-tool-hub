"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import { usePersistentState } from "@/hooks/usePersistentState";

type CardType = "event" | "command" | "actor" | "policy" | "read_model" | "external_system" | "aggregate" | "hotspot";
type Phase = "discover" | "sequence" | "model" | "review";

type StormCard = {
  id: string;
  type: CardType;
  text: string;
  lane: number;
  author: string;
  createdAt: number;
};

type StormLink = { id: string; from: string; to: string };

type StormState = {
  title: string;
  cards: StormCard[];
  phase: Phase;
  laneCount: number;
  links: StormLink[];
};

type StormEvent =
  | { type: "state"; state: StormState }
  | { type: "add"; card: StormCard }
  | { type: "move"; id: string; lane: number }
  | { type: "edit"; id: string; text: string }
  | { type: "delete"; id: string }
  | { type: "phase"; phase: Phase }
  | { type: "link"; link: StormLink }
  | { type: "unlink"; id: string };

const CARD_TYPES: Record<CardType, { label: string; color: string; description: string; placeholder: string }> = {
  event: { label: "Domain event", color: "bg-orange-100 border-orange-300 text-orange-950", description: "Something that happened, written in past tense.", placeholder: "e.g. Order placed" },
  command: { label: "Command", color: "bg-blue-100 border-blue-300 text-blue-950", description: "An intention that causes an event.", placeholder: "e.g. Place order" },
  actor: { label: "Actor", color: "bg-yellow-100 border-yellow-300 text-yellow-950", description: "A person, role, or system initiating a command.", placeholder: "e.g. Customer" },
  policy: { label: "Policy", color: "bg-purple-100 border-purple-300 text-purple-950", description: "A rule or decision that reacts to an event.", placeholder: "e.g. Send confirmation" },
  read_model: { label: "Read model", color: "bg-green-100 border-green-300 text-green-950", description: "Information someone needs to make a decision.", placeholder: "e.g. Order summary" },
  external_system: { label: "External system", color: "bg-pink-100 border-pink-300 text-pink-950", description: "A system outside the boundary being explored.", placeholder: "e.g. Payment provider" },
  aggregate: { label: "Aggregate", color: "bg-amber-200 border-amber-400 text-amber-950", description: "A consistency boundary discovered during modelling.", placeholder: "e.g. Order" },
  hotspot: { label: "Hotspot", color: "bg-red-100 border-red-300 text-red-950", description: "A question, risk, disagreement, or unknown.", placeholder: "e.g. How are refunds approved?" },
};

const PHASES: Array<{ id: Phase; label: string; description: string }> = [
  { id: "discover", label: "Discover", description: "Capture events without debating them." },
  { id: "sequence", label: "Sequence", description: "Arrange events from left to right." },
  { id: "model", label: "Model", description: "Add commands, actors, policies, and systems." },
  { id: "review", label: "Review", description: "Capture hotspots and agree on next steps." },
];

const DEFAULT_LANE_COUNT = 8;
const MAX_LANE_COUNT = 16;
const EMPTY_STATE: StormState = { title: "Untitled process", cards: [], phase: "discover", laneCount: DEFAULT_LANE_COUNT, links: [] };

const PDF_COLORS: Record<CardType, [number, number, number]> = {
  event: [255, 224, 178], command: [191, 219, 254], actor: [254, 240, 138], policy: [233, 213, 255],
  read_model: [187, 247, 208], external_system: [251, 207, 232], aggregate: [253, 230, 138], hotspot: [254, 202, 202],
};
const LINK_COLORS = ["#ea580c", "#2563eb", "#16a34a", "#9333ea", "#db2777", "#0891b2"];

function normalizeStormState(value: Partial<StormState> | undefined): StormState {
  const laneCount = typeof value?.laneCount === "number"
    ? Math.max(1, Math.min(MAX_LANE_COUNT, Math.floor(value.laneCount)))
    : DEFAULT_LANE_COUNT;
  return {
    title: typeof value?.title === "string" ? value.title : EMPTY_STATE.title,
    cards: Array.isArray(value?.cards) ? value.cards.map((card) => ({ ...card, lane: Math.max(1, Math.min(laneCount, card.lane)) })) : [],
    phase: value?.phase && PHASES.some((phase) => phase.id === value.phase) ? value.phase : "discover",
    laneCount,
    links: Array.isArray(value?.links) ? value.links.filter((link) => link && typeof link.id === "string" && typeof link.from === "string" && typeof link.to === "string" && link.from !== link.to) : [],
  };
}

export default function EventStormingBoard({ sessionId }: { sessionId: string }) {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [state, setState] = usePersistentState<StormState>(`event-storming-${sessionId}`, EMPTY_STATE);
  const [selectedType, setSelectedType] = useState<CardType>("event");
  const [draft, setDraft] = useState("");
  const [lane, setLane] = useState(1);
  const [members, setMembers] = useState<string[]>([]);
  const [connection, setConnection] = useState<"connecting" | "connected" | "offline">("connecting");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [linkPositions, setLinkPositions] = useState<Record<string, { x: number; y: number; top: number; bottom: number; left: number; right: number }>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef("");
  const stateRef = useRef(state);
  const serverLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
    queueMicrotask(() => setLastSaved(new Date()));
  }, [state]);

  const send = useCallback((event: StormEvent) => {
    channelRef.current?.send({ type: "broadcast", event: event.type, payload: event });
  }, []);

  const apply = useCallback((event: StormEvent) => {
    setState((current) => {
      if (event.type === "state") return normalizeStormState(event.state);
      if (event.type === "add") return current.cards.some((card) => card.id === event.card.id) ? current : { ...current, cards: [...current.cards, event.card] };
      if (event.type === "move") return { ...current, cards: current.cards.map((card) => card.id === event.id ? { ...card, lane: Math.max(1, Math.min(current.laneCount ?? DEFAULT_LANE_COUNT, event.lane)) } : card) };
      if (event.type === "edit") return { ...current, cards: current.cards.map((card) => card.id === event.id ? { ...card, text: event.text } : card) };
      if (event.type === "delete") return { ...current, cards: current.cards.filter((card) => card.id !== event.id) };
      if (event.type === "link") return (current.links ?? []).some((link) => link.from === event.link.from && link.to === event.link.to) ? current : { ...current, links: [...(current.links ?? []), event.link] };
      if (event.type === "unlink") return { ...current, links: (current.links ?? []).filter((link) => link.id !== event.id) };
      return { ...current, phase: event.phase };
    });
  }, [setState]);

  useEffect(() => {
    const savedName = localStorage.getItem(`event-storming-name-${sessionId}`);
    if (!savedName) return;
    userRef.current = savedName;
    queueMicrotask(() => {
      setName(savedName);
      setJoined(true);
    });
  }, [sessionId]);

  // Load the durable server snapshot first; localStorage remains the fallback
  // that keeps the current browser usable during a temporary outage.
  useEffect(() => {
    if (!joined) return;
    let cancelled = false;
    serverLoadedRef.current = false;
    fetch(`/api/collaboration-sessions/${sessionId}`, { cache: "no-store" })
      .then(async (response) => {
        if (cancelled || !response.ok) return;
        const saved = await response.json() as { state?: StormState };
        if (saved.state?.cards && Array.isArray(saved.state.cards)) setState(normalizeStormState(saved.state));
      })
      .catch(() => { /* Use local recovery when durable storage is unavailable. */ })
      .finally(() => { if (!cancelled) serverLoadedRef.current = true; });
    return () => { cancelled = true; };
  }, [joined, sessionId, setState]);

  useEffect(() => {
    if (!joined || !serverLoadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`/api/collaboration-sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolType: "event_storming", title: state.title, state }),
      }).catch(() => { /* localStorage still protects the current browser. */ });
    }, 600);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [joined, sessionId, setState, state]);

  useEffect(() => {
    if (!joined) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channel = supabase.channel(`event-storming-${sessionId}`, { config: { presence: { key: userRef.current }, broadcast: { self: true } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const presence = channel.presenceState<{ name: string }>();
        const names = Object.values(presence).flat().map((entry) => entry.name.trim()).filter(Boolean);
        setMembers(Array.from(new Set(names)));
      })
      .on("broadcast", { event: "request_state" }, () => {
        channel.send({ type: "broadcast", event: "state", payload: { type: "state", state: stateRef.current } });
      })
      .on("broadcast", { event: "state" }, ({ payload }) => apply(payload as StormEvent))
      .on("broadcast", { event: "add" }, ({ payload }) => apply(payload as StormEvent))
      .on("broadcast", { event: "move" }, ({ payload }) => apply(payload as StormEvent))
      .on("broadcast", { event: "edit" }, ({ payload }) => apply(payload as StormEvent))
      .on("broadcast", { event: "delete" }, ({ payload }) => apply(payload as StormEvent))
      .on("broadcast", { event: "phase" }, ({ payload }) => apply(payload as StormEvent))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          await channel.track({ name: userRef.current });
          await channel.send({ type: "broadcast", event: "request_state", payload: { type: "request_state" } });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection("offline");
      });
    channelRef.current = channel;
    return () => { channel.unsubscribe(); channelRef.current = null; };
  }, [apply, joined, send, sessionId]);

  const addCard = () => {
    const text = draft.trim();
    if (!text) return;
    const card: StormCard = { id: crypto.randomUUID(), type: selectedType, text, lane, author: userRef.current, createdAt: Date.now() };
    apply({ type: "add", card });
    send({ type: "add", card });
    setDraft("");
  };

  const moveCard = (id: string, nextLane: number) => {
    apply({ type: "move", id, lane: nextLane });
    send({ type: "move", id, lane: nextLane });
  };

  const changePhase = (phase: Phase) => {
    apply({ type: "phase", phase });
    send({ type: "phase", phase });
  };

  const toggleLink = (cardId: string) => {
    if (!linkSource) {
      setLinkSource(cardId);
      return;
    }
    if (linkSource === cardId) {
      setLinkSource(null);
      return;
    }
    const existing = (state.links ?? []).find((link) => link.from === linkSource && link.to === cardId);
    if (existing) {
      apply({ type: "unlink", id: existing.id });
      send({ type: "unlink", id: existing.id });
    } else {
      const link: StormLink = { id: crypto.randomUUID(), from: linkSource, to: cardId };
      apply({ type: "link", link });
      send({ type: "link", link });
    }
    setLinkSource(null);
  };

  const addTimelineStep = () => {
    const nextState = { ...state, laneCount: Math.min(MAX_LANE_COUNT, (state.laneCount ?? DEFAULT_LANE_COUNT) + 1) };
    apply({ type: "state", state: nextState });
    send({ type: "state", state: nextState });
  };

  const removeTimelineStep = () => {
    const currentCount = state.laneCount ?? DEFAULT_LANE_COUNT;
    if (currentCount <= 1) return;
    const nextCount = currentCount - 1;
    const nextState = {
      ...state,
      laneCount: nextCount,
      cards: state.cards.map((card) => card.lane > nextCount ? { ...card, lane: nextCount } : card),
    };
    apply({ type: "state", state: nextState });
    send({ type: "state", state: nextState });
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const laneCount = state.laneCount ?? DEFAULT_LANE_COUNT;
    const laneWidth = (pageWidth - margin * 2) / laneCount;
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor(15, 23, 42); doc.setFontSize(22); doc.text(state.title, margin, 16);
    doc.setFontSize(9); doc.setTextColor(100); doc.text(`EventStorming process map · ${new Date().toLocaleDateString()} · ${state.cards.length} cards · ${(state.links ?? []).length} relationships`, margin, 22);
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.5); doc.line(margin, 27, pageWidth - margin, 27);
    for (let index = 0; index < laneCount; index += 1) {
      const x = margin + index * laneWidth;
      doc.setFillColor(255, 237, 213); doc.roundedRect(x + 1, 31, laneWidth - 2, 10, 2, 2, "F");
      doc.setTextColor(154, 52, 18); doc.setFontSize(9); doc.text(`STEP ${index + 1}`, x + laneWidth / 2, 37, { align: "center" });
      const laneCards = state.cards.filter((card) => card.lane === index + 1).sort((a, b) => a.createdAt - b.createdAt);
      let y = 47;
      laneCards.forEach((card) => {
        const lines = doc.splitTextToSize(`${CARD_TYPES[card.type].label}\n${card.text}`, laneWidth - 8) as string[];
        const height = Math.max(13, lines.length * 4 + 5);
        if (y + height > pageHeight - 24) return;
        const [red, green, blue] = PDF_COLORS[card.type];
        doc.setFillColor(red, green, blue); doc.setDrawColor(Math.max(0, red - 20), Math.max(0, green - 20), Math.max(0, blue - 20)); doc.roundedRect(x + 3, y, laneWidth - 6, height, 2, 2, "FD");
        doc.setTextColor(30, 41, 59); doc.setFontSize(7); doc.text(lines, x + 5, y + 5);
        y += height + 3;
      });
    }
    const relationshipY = 132;
    doc.setFillColor(255, 247, 237); doc.setDrawColor(253, 186, 116); doc.roundedRect(margin, relationshipY, pageWidth - margin * 2, 38, 3, 3, "FD");
    doc.setTextColor(124, 45, 18); doc.setFontSize(11); doc.text("Relationships", margin + 5, relationshipY + 7);
    doc.setTextColor(154, 52, 18); doc.setFontSize(7); doc.text("Explicit connections captured during the workshop", margin + 37, relationshipY + 7);
    (state.links ?? []).forEach((link, index) => {
      const from = state.cards.find((card) => card.id === link.from);
      const to = state.cards.find((card) => card.id === link.to);
      if (!from || !to) return;
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 6 + column * ((pageWidth - margin * 2 - 12) / 2);
      const y = relationshipY + 13 + row * 5.5;
      const hex = LINK_COLORS[index % LINK_COLORS.length].slice(1);
      const red = Number.parseInt(hex.slice(0, 2), 16); const green = Number.parseInt(hex.slice(2, 4), 16); const blue = Number.parseInt(hex.slice(4, 6), 16);
      const fromText = from.text.length > 27 ? `${from.text.slice(0, 26)}…` : from.text;
      const toText = to.text.length > 27 ? `${to.text.slice(0, 26)}…` : to.text;
      doc.setFillColor(red, green, blue); doc.circle(x, y - 1.5, 1.5, "F");
      doc.setTextColor(71, 85, 105); doc.setFontSize(7); doc.text(`${index + 1}. ${fromText}`, x + 4, y);
      const arrowX = x + 48; doc.setDrawColor(red, green, blue); doc.setLineWidth(0.7); doc.line(arrowX, y - 1.5, arrowX + 8, y - 1.5); doc.setFillColor(red, green, blue); doc.triangle(arrowX + 9, y - 1.5, arrowX + 6.5, y - 2.8, arrowX + 6.5, y - 0.2, "F");
      doc.setTextColor(71, 85, 105); doc.text(toText, arrowX + 12, y);
    });
    const legendY = pageHeight - 15;
    doc.setFontSize(7); doc.setTextColor(71, 85, 105); doc.text("Legend:", margin, legendY);
    (Object.keys(CARD_TYPES) as CardType[]).forEach((type, index) => { const x = margin + 18 + index * 34; const [red, green, blue] = PDF_COLORS[type]; doc.setFillColor(red, green, blue); doc.roundedRect(x, legendY - 4, 4, 4, 1, 1, "F"); doc.setTextColor(71, 85, 105); doc.text(CARD_TYPES[type].label, x + 6, legendY); });
    doc.save(`eventstorming-${sessionId}.pdf`);
  };

  const joinWorkshop = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    userRef.current = trimmedName;
    localStorage.setItem(`event-storming-name-${sessionId}`, trimmedName);
    setJoined(true);
  };

  const copySessionLink = async () => {
    const url = `${window.location.origin}/tools/event-storming/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
  };

  const timelineStepCount = state.laneCount ?? DEFAULT_LANE_COUNT;
  const cardsByLane = useMemo(() => Array.from({ length: timelineStepCount }, (_, index) => state.cards.filter((card) => card.lane === index + 1)), [state.cards, timelineStepCount]);

  useEffect(() => {
    const updatePositions = () => {
      const container = timelineRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      const next: Record<string, { x: number; y: number; top: number; bottom: number; left: number; right: number }> = {};
      container.querySelectorAll<HTMLElement>("[data-storm-card]").forEach((element) => {
        const id = element.dataset.stormCard;
        if (!id) return;
        const rect = element.getBoundingClientRect();
        next[id] = { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, top: rect.top - bounds.top, bottom: rect.bottom - bounds.top, left: rect.left - bounds.left, right: rect.right - bounds.left };
      });
      setLinkPositions(next);
    };
    updatePositions();
    window.addEventListener("resize", updatePositions);
    return () => window.removeEventListener("resize", updatePositions);
  }, [state.cards, timelineStepCount]);

  if (!joined) return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-orange-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-4xl">🟠</div>
        <h1 className="text-3xl font-bold text-gray-950">EventStorming workshop</h1>
        <p className="mt-2 text-gray-600">Map what happens in a business process with your team.</p>
        <label className="mt-8 block text-sm font-semibold text-gray-700">Your name</label>
        <input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && joinWorkshop()} placeholder="e.g. Ahmed" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        <button onClick={joinWorkshop} disabled={!name.trim()} className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-40">Join workshop →</button>
        <p className="mt-5 break-all text-center font-mono text-xs text-gray-400">{sessionId}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3">
          <input value={state.title} onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))} className="min-w-[240px] flex-1 rounded-lg border border-transparent px-2 py-1 text-xl font-bold text-slate-900 hover:border-slate-200 focus:border-orange-400 focus:outline-none" aria-label="Workshop title" />
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connection === "connected" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{connection === "connected" ? "● Live" : "○ Reconnecting"}</span>
          <div className="flex items-center gap-1.5" aria-label="Workshop participants">
            <span className="text-sm text-slate-500">{members.length || 1} participant{members.length === 1 ? "" : "s"}</span>
            <div className="flex max-w-[280px] flex-wrap gap-1">
              {(members.length ? members : [name]).map((member) => <span key={member} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{member}</span>)}
            </div>
          </div>
          <button onClick={copySessionLink} className="rounded-lg border border-orange-300 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50">{linkCopied ? "Link copied ✓" : "Copy session link"}</button>
          <button onClick={exportPdf} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export PDF</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5">
        <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold text-orange-950">Keep the story moving left to right</p><p className="text-sm text-orange-800">Start with events in past tense. Add causes, decisions, systems, and questions as the picture emerges.</p></div>
            <span className="text-xs text-orange-700">{lastSaved ? `Saved locally ${lastSaved.toLocaleTimeString()}` : "Saving…"}</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">{PHASES.map((phase, index) => <button key={phase.id} onClick={() => changePhase(phase.id)} className={`rounded-xl border p-3 text-left ${state.phase === phase.id ? "border-orange-500 bg-white shadow-sm" : "border-orange-100 bg-orange-50/50"}`}><span className="text-xs font-bold text-orange-600">{index + 1}</span><p className="font-semibold text-slate-900">{phase.label}</p><p className="text-xs text-slate-600">{phase.description}</p></button>)}</div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">Legend & card types</h2><span className="text-xs text-slate-500">Click a type, write one idea, then add it to the process</span></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{(Object.keys(CARD_TYPES) as CardType[]).map((type) => <button key={type} onClick={() => setSelectedType(type)} className={`rounded-xl border-2 p-3 text-left transition ${CARD_TYPES[type].color} ${selectedType === type ? "ring-2 ring-orange-400 ring-offset-1" : "opacity-80 hover:opacity-100"}`}><span className="font-semibold">{CARD_TYPES[type].label}</span><span className="mt-1 block text-xs opacity-80">{CARD_TYPES[type].description}</span></button>)}</div>
          <div className="mt-4 flex flex-wrap gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addCard()} placeholder={CARD_TYPES[selectedType].placeholder} className="min-w-[240px] flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none" /><select value={lane} onChange={(event) => setLane(Number(event.target.value))} className="rounded-xl border border-slate-300 px-3 py-3 text-sm">{Array.from({ length: timelineStepCount }, (_, index) => <option key={index + 1} value={index + 1}>Step {index + 1}</option>)}</select><button onClick={addCard} disabled={!draft.trim()} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40">Add {CARD_TYPES[selectedType].label}</button><button onClick={addTimelineStep} disabled={timelineStepCount >= MAX_LANE_COUNT} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">+ Add timeline step</button><button onClick={removeTimelineStep} disabled={timelineStepCount <= 1} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">− Remove last step</button></div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><button onClick={() => setLinkSource(null)} className={`rounded-full border px-3 py-1.5 font-semibold ${linkSource ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200"}`}>{linkSource ? "Link mode active — choose the destination card" : "Link cards"}</button><span>Connect cards from their edges. A card can have multiple links.</span><span className="ml-auto flex flex-wrap gap-3">{LINK_COLORS.slice(0, 4).map((color, index) => <span key={color} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />Link {index + 1}</span>)}</span></div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div ref={timelineRef} className="relative min-w-[1200px] p-4"><div className="mb-3 flex items-center gap-3"><div className="w-36 text-xs font-bold uppercase tracking-wider text-slate-500">Timeline</div><div className="flex-1 border-t-2 border-dashed border-slate-300" /><span className="text-xs font-semibold text-slate-500">Later →</span></div><svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true"><defs>{LINK_COLORS.map((color, index) => <marker key={color} id={`storm-arrow-${index}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={color} /></marker>)}</defs>{(state.links ?? []).map((link, index) => { const from = linkPositions[link.from]; const to = linkPositions[link.to]; if (!from || !to) return null; const forward = to.x >= from.x; const startX = forward ? from.right : from.left; const endX = forward ? to.left : to.right; const bend = Math.max(28, Math.abs(endX - startX) * 0.35); const colorIndex = index % LINK_COLORS.length; const path = `M ${startX} ${from.y} C ${forward ? startX + bend : startX - bend} ${from.y}, ${forward ? endX - bend : endX + bend} ${to.y}, ${endX} ${to.y}`; return <g key={link.id}><path d={path} fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" /><path d={path} fill="none" stroke={LINK_COLORS[colorIndex]} strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" markerEnd={`url(#storm-arrow-${colorIndex})`} /></g>; })}</svg><div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${timelineStepCount}, minmax(0, 1fr))` }}>{cardsByLane.map((cards, index) => <div key={index} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/plain"); if (id) moveCard(id, index + 1); }} className="relative min-h-[420px] rounded-xl border border-slate-200 bg-slate-50 p-2"><div className="mb-2 text-center text-xs font-bold text-slate-400">STEP {index + 1}</div>{index < timelineStepCount - 1 && <span className="pointer-events-none absolute -right-3 top-7 z-10 text-xl font-bold text-orange-400">→</span>}<div className="space-y-2">{cards.map((card) => <div key={card.id} data-storm-card={card.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)} className={`group cursor-grab rounded-xl border-2 p-3 shadow-sm active:cursor-grabbing ${CARD_TYPES[card.type].color} ${linkSource === card.id ? "ring-2 ring-orange-500 ring-offset-2" : ""}`} onClick={() => linkSource && toggleLink(card.id)}><div className="mb-1 flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{CARD_TYPES[card.type].label}</span><div className="flex items-center gap-2"><button onClick={(event) => { event.stopPropagation(); toggleLink(card.id); }} className="text-[10px] font-semibold text-orange-700 opacity-0 group-hover:opacity-100" aria-label={`Link ${card.text}`}>Link</button><button onClick={(event) => { event.stopPropagation(); apply({ type: "delete", id: card.id }); send({ type: "delete", id: card.id }); }} className="text-xs opacity-0 hover:text-red-700 group-hover:opacity-100" aria-label={`Delete ${card.text}`}>✕</button></div></div><p className="text-sm font-medium leading-snug">{card.text}</p><p className="mt-2 text-[10px] opacity-60">{card.author}</p></div>)}</div>{cards.length === 0 && <p className="mt-20 text-center text-xs text-slate-400">Drop cards here</p>}</div>)}</div></div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">Drag cards between steps to refine the process. Use links for meaningful relationships. Your board is saved in this browser and shared live with the session.</p>
      </main>
    </div>
  );
}
