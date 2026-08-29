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

type StormState = {
  title: string;
  cards: StormCard[];
  phase: Phase;
};

type StormEvent =
  | { type: "state"; state: StormState }
  | { type: "add"; card: StormCard }
  | { type: "move"; id: string; lane: number }
  | { type: "edit"; id: string; text: string }
  | { type: "delete"; id: string }
  | { type: "phase"; phase: Phase };

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

const EMPTY_STATE: StormState = { title: "Untitled process", cards: [], phase: "discover" };
const LANES = Array.from({ length: 8 }, (_, index) => index + 1);

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
  const channelRef = useRef<RealtimeChannel | null>(null);
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
      if (event.type === "state") return event.state;
      if (event.type === "add") return current.cards.some((card) => card.id === event.card.id) ? current : { ...current, cards: [...current.cards, event.card] };
      if (event.type === "move") return { ...current, cards: current.cards.map((card) => card.id === event.id ? { ...card, lane: Math.max(1, Math.min(8, event.lane)) } : card) };
      if (event.type === "edit") return { ...current, cards: current.cards.map((card) => card.id === event.id ? { ...card, text: event.text } : card) };
      if (event.type === "delete") return { ...current, cards: current.cards.filter((card) => card.id !== event.id) };
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
        if (saved.state?.cards && Array.isArray(saved.state.cards)) setState(saved.state);
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
        setMembers(Object.values(presence).flat().map((entry) => entry.name).filter(Boolean));
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

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(20); doc.text(state.title, 14, 16);
    doc.setFontSize(9); doc.setTextColor(90); doc.text(`EventStorming map · ${new Date().toLocaleDateString()} · ${state.cards.length} cards`, 14, 22);
    let y = 32;
    for (const phase of PHASES) {
      const cards = state.cards.filter((card) => card.type === "event" || card.type === "hotspot" || phase.id === state.phase);
      if (!cards.length) continue;
      doc.setFontSize(12); doc.setTextColor(20); doc.text(phase.label, 14, y); y += 6;
      cards.slice(0, 18).forEach((card) => {
        const label = `${CARD_TYPES[card.type].label}: ${card.text}`;
        const lines = doc.splitTextToSize(`• ${label}`, 260) as string[];
        doc.setFontSize(9); doc.setTextColor(card.type === "hotspot" ? 180 : 50, card.type === "hotspot" ? 30 : 50, 50);
        doc.text(lines, 18, y); y += lines.length * 4 + 1;
        if (y > 185) { doc.addPage(); y = 18; }
      });
      y += 4;
    }
    doc.save(`eventstorming-${sessionId}.pdf`);
  };

  const cardsByLane = useMemo(() => LANES.map((number) => state.cards.filter((card) => card.lane === number)), [state.cards]);

  if (!joined) return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-orange-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-4xl">🟠</div>
        <h1 className="text-3xl font-bold text-gray-950">EventStorming workshop</h1>
        <p className="mt-2 text-gray-600">Map what happens in a business process with your team.</p>
        <label className="mt-8 block text-sm font-semibold text-gray-700">Your name</label>
        <input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && name.trim() && setJoined(true)} placeholder="e.g. Ahmed" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        <button onClick={() => { userRef.current = name.trim(); localStorage.setItem(`event-storming-name-${sessionId}`, name.trim()); setJoined(true); }} disabled={!name.trim()} className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-40">Join workshop →</button>
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
          <span className="text-sm text-slate-500">{members.length || 1} participant{members.length === 1 ? "" : "s"}</span>
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
          <div className="mt-4 flex flex-wrap gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addCard()} placeholder={CARD_TYPES[selectedType].placeholder} className="min-w-[240px] flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none" /><select value={lane} onChange={(event) => setLane(Number(event.target.value))} className="rounded-xl border border-slate-300 px-3 py-3 text-sm"><option value={1}>Step 1</option>{LANES.slice(1).map((number) => <option key={number} value={number}>Step {number}</option>)}</select><button onClick={addCard} disabled={!draft.trim()} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40">Add {CARD_TYPES[selectedType].label}</button></div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[1200px] p-4"><div className="mb-3 flex items-center gap-3"><div className="w-36 text-xs font-bold uppercase tracking-wider text-slate-500">Timeline</div><div className="flex-1 border-t-2 border-dashed border-slate-300" /><span className="text-xs font-semibold text-slate-500">Later →</span></div><div className="grid grid-cols-8 gap-3">{cardsByLane.map((cards, index) => <div key={index} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/plain"); if (id) moveCard(id, index + 1); }} className="min-h-[420px] rounded-xl border border-slate-200 bg-slate-50 p-2"><div className="mb-2 text-center text-xs font-bold text-slate-400">STEP {index + 1}</div><div className="space-y-2">{cards.map((card) => <div key={card.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)} className={`group cursor-grab rounded-xl border-2 p-3 shadow-sm active:cursor-grabbing ${CARD_TYPES[card.type].color}`}><div className="mb-1 flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{CARD_TYPES[card.type].label}</span><button onClick={() => { apply({ type: "delete", id: card.id }); send({ type: "delete", id: card.id }); }} className="text-xs opacity-0 hover:text-red-700 group-hover:opacity-100" aria-label={`Delete ${card.text}`}>✕</button></div><p className="text-sm font-medium leading-snug">{card.text}</p><p className="mt-2 text-[10px] opacity-60">{card.author}</p></div>)}</div>{cards.length === 0 && <p className="mt-20 text-center text-xs text-slate-400">Drop cards here</p>}</div>)}</div></div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">Drag cards between steps to refine the process. Your board is saved in this browser and shared live with the session.</p>
      </main>
    </div>
  );
}
