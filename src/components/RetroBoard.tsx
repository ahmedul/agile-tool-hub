"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import CopyButton from "./CopyButton";
import { useAnimation } from "@/hooks/useAnimation";
import { ANIMATION_VARIANTS, DURATIONS, EASINGS } from "@/lib/animations";

// ─── Types ──────────────────────────────────────────────────────────────────

type ColumnId = "went_well" | "to_improve" | "action_items" | "rose" | "thorn" | "bud" | "liked" | "learned" | "lacked" | "longed" | "mad" | "sad" | "glad";
type RetroType = "standard" | "rose_thorn_bud" | "sailboat" | "4l" | "mad_sad_glad";
type Theme = "light" | "dark" | "ocean" | "sunset";
type Phase = "brainstorm" | "grouping" | "discussion" | "action" | "done";

interface RetroNote {
  id: string;
  columnId: ColumnId;
  text: string;
  authorId: string;
  authorName: string;
  votes: string[]; // array of userIds who voted
  createdAt: number;
}

interface Member {
  name: string;
}

interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  currentPhase: Phase;
}

interface PersistedRetroState {
  notes: RetroNote[];
  retroType: RetroType;
  timer: TimerState;
}

// ─── Broadcast event shapes ──────────────────────────────────────────────────

type BroadcastEvent =
  | { type: "add_note"; note: RetroNote }
  | { type: "delete_note"; noteId: string }
  | { type: "vote_note"; noteId: string; userId: string; action: "add" | "remove" }
  | { type: "full_state"; notes: RetroNote[]; retroType: RetroType; timer?: TimerState }
  | { type: "request_state"; requestId: string }
  | { type: "state_response"; requestId: string; notes: RetroNote[]; retroType: RetroType; timer?: TimerState }
  | { type: "timer_update"; timer: TimerState }
  | { type: "phase_change"; phase: Phase };

// ─── Retro Format Definitions ───────────────────────────────────────────────

const RETRO_FORMATS: Record<RetroType, { id: RetroType; label: string; columns: Array<{ id: ColumnId; label: string; emoji: string; color: string; bg: string }> }> = {
  standard: {
    id: "standard",
    label: "Standard (Went Well / To Improve / Action Items)",
    columns: [
      { id: "went_well", label: "Went Well", emoji: "🟢", color: "text-green-700", bg: "bg-green-50 border-green-200" },
      { id: "to_improve", label: "To Improve", emoji: "🔴", color: "text-red-700", bg: "bg-red-50 border-red-200" },
      { id: "action_items", label: "Action Items", emoji: "🔵", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    ],
  },
  rose_thorn_bud: {
    id: "rose_thorn_bud",
    label: "Rose / Thorn / Bud",
    columns: [
      { id: "rose", label: "Rose 🌹 (Positive)", emoji: "🌹", color: "text-pink-700", bg: "bg-pink-50 border-pink-200" },
      { id: "thorn", label: "Thorn 🌵 (Challenge)", emoji: "🌵", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
      { id: "bud", label: "Bud 🌿 (Growth)", emoji: "🌿", color: "text-green-700", bg: "bg-green-50 border-green-200" },
    ],
  },
  sailboat: {
    id: "sailboat",
    label: "Sailboat (Anchor / Sail / Rocks)",
    columns: [
      { id: "went_well", label: "Anchor ⚓ (What helped)", emoji: "⚓", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      { id: "to_improve", label: "Rocks ⚠️ (Obstacles)", emoji: "⚠️", color: "text-red-700", bg: "bg-red-50 border-red-200" },
      { id: "action_items", label: "Sail 🪁 (Direction)", emoji: "🪁", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    ],
  },
  "4l": {
    id: "4l",
    label: "4L (Liked / Learned / Lacked / Longed for)",
    columns: [
      { id: "liked", label: "Liked ❤️", emoji: "❤️", color: "text-red-700", bg: "bg-red-50 border-red-200" },
      { id: "learned", label: "Learned 📚", emoji: "📚", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      { id: "lacked", label: "Lacked ❌", emoji: "❌", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
      { id: "longed", label: "Longed for ⭐", emoji: "⭐", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
    ],
  },
  mad_sad_glad: {
    id: "mad_sad_glad",
    label: "Mad / Sad / Glad",
    columns: [
      { id: "mad", label: "Mad 😠", emoji: "😠", color: "text-red-700", bg: "bg-red-50 border-red-200" },
      { id: "sad", label: "Sad 😢", emoji: "😢", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      { id: "glad", label: "Glad 😊", emoji: "😊", color: "text-green-700", bg: "bg-green-50 border-green-200" },
    ],
  },
};

// ─── Theme Definitions ──────────────────────────────────────────────────────

const THEMES: Record<Theme, { bg: string; headerBg: string; text: string; accent: string }> = {
  light: { bg: "bg-gray-50", headerBg: "bg-white", text: "text-gray-900", accent: "text-blue-600" },
  dark: { bg: "bg-gray-900", headerBg: "bg-gray-800", text: "text-gray-100", accent: "text-blue-400" },
  ocean: { bg: "bg-cyan-50", headerBg: "bg-cyan-600", text: "text-gray-900", accent: "text-cyan-700" },
  sunset: { bg: "bg-orange-50", headerBg: "bg-orange-600", text: "text-gray-900", accent: "text-orange-700" },
};

const PHASE_HELP: Record<Phase, string> = {
  brainstorm: "Brainstorm: everyone adds ideas independently.",
  grouping: "Grouping: merge duplicates and cluster similar notes.",
  discussion: "Discussion: talk through top-voted themes.",
  action: "Action: define owners and next steps.",
  done: "Done: board is locked; export is still available.",
};

const PHASE_DETAILS: Record<Phase, { label: string; detail: string }> = {
  brainstorm: { label: "Brainstorm", detail: "Everyone adds observations independently. Avoid debating or editing other notes yet." },
  grouping: { label: "Grouping", detail: "Merge duplicates and cluster similar notes so the team can see recurring themes." },
  discussion: { label: "Discussion", detail: "Talk through the highest-voted themes, clarify what happened, and identify what needs to change." },
  action: { label: "Action", detail: "Turn selected themes into specific next steps. Add an owner and a target date in the note text." },
  done: { label: "Done", detail: "Temporarily locks editing while you export or review the agreed actions. You can undo Done and continue editing." },
};

const NOTE_COLORS: Record<ColumnId, string> = {
  went_well: "bg-green-100 border-green-300",
  to_improve: "bg-red-100 border-red-300",
  action_items: "bg-blue-100 border-blue-300",
  rose: "bg-pink-100 border-pink-300",
  thorn: "bg-yellow-100 border-yellow-300",
  bud: "bg-green-100 border-green-300",
  liked: "bg-red-100 border-red-300",
  learned: "bg-blue-100 border-blue-300",
  lacked: "bg-orange-100 border-orange-300",
  longed: "bg-yellow-100 border-yellow-300",
  mad: "bg-red-100 border-red-300",
  sad: "bg-blue-100 border-blue-300",
  glad: "bg-green-100 border-green-300",
};

function makeInputsForType(type: RetroType): Record<ColumnId, string> {
  const format = RETRO_FORMATS[type];
  const next: Record<ColumnId, string> = {} as Record<ColumnId, string>;
  format.columns.forEach((col) => {
    next[col.id] = "";
  });
  return next;
}

function readPersistedRetroState(sessionId: string): PersistedRetroState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`retro-state-${sessionId}`);
    if (!raw) return null;
    const saved = JSON.parse(raw) as PersistedRetroState;
    if (!Array.isArray(saved.notes) || !saved.retroType) return null;
    return {
      notes: saved.notes,
      retroType: saved.retroType,
      timer: normalizeTimerState(saved.timer),
    };
  } catch {
    return null;
  }
}

function normalizeTimerState(timer: Partial<TimerState> | undefined): TimerState {
  return {
    isRunning: timer?.isRunning === true,
    remainingSeconds: typeof timer?.remainingSeconds === "number" ? timer.remainingSeconds : 600,
    totalSeconds: typeof timer?.totalSeconds === "number" && timer.totalSeconds > 0 ? timer.totalSeconds : 600,
    currentPhase: timer?.currentPhase && PHASE_DETAILS[timer.currentPhase] ? timer.currentPhase : "brainstorm",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RetroBoard({ sessionId }: { sessionId: string }) {
  const [nameInput, setNameInput] = useState("");
  const [retroType, setRetroType] = useState<RetroType>("standard");
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("retro-theme") as Theme) || "light";
    }
    return "light";
  });
  const [joined, setJoined] = useState(false);
  const [notes, setNotes] = useState<RetroNote[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const sessionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tools/retro-board/${sessionId}`
      : `https://agiletoolhub.com/tools/retro-board/${sessionId}`;
  const shortSessionId =
    sessionId.length > 16
      ? `${sessionId.slice(0, 8)}...${sessionId.slice(-6)}`
      : sessionId;
  const inviteDisplayUrl =
    typeof window !== "undefined"
      ? `${window.location.host}/tools/retro-board/${shortSessionId}`
      : `agiletoolhub.com/tools/retro-board/${shortSessionId}`;
  const [currentUserId] = useState(() => {
    if (typeof window === "undefined") return "";
    let uid = sessionStorage.getItem(`retro-uid-${sessionId}`);
    if (!uid) {
      uid = crypto.randomUUID();
      sessionStorage.setItem(`retro-uid-${sessionId}`, uid);
    }
    return uid;
  });
  const [timerState, setTimerState] = useState<TimerState>({ isRunning: false, remainingSeconds: 600, totalSeconds: 600, currentPhase: "brainstorm" });
  const [timerDuration, setTimerDuration] = useState(10); // minutes
  const [inputs, setInputs] = useState<Record<ColumnId, string>>(makeInputsForType("standard"));
  const [sourceSessionId, setSourceSessionId] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const animationsEnabled = useAnimation();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const myNameRef = useRef("");
  const autoJoinedRef = useRef(false);
  const notesRef = useRef<RetroNote[]>([]);
  const retroTypeRef = useRef<RetroType>("standard");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isBoardLockedRef = useRef(false);
  const noteSequenceRef = useRef(0);
  const stateHydratedRef = useRef(false);
  const timerRef = useRef<TimerState>(timerState);

  // ── Broadcast helpers ──────────────────────────────────────────────────────

  const broadcast = useCallback((payload: BroadcastEvent) => {
    channelRef.current?.send({ type: "broadcast", event: payload.type, payload });
  }, []);

  // Keep notesRef and retroTypeRef in sync for use in callbacks
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { retroTypeRef.current = retroType; }, [retroType]);
  useEffect(() => { timerRef.current = timerState; }, [timerState]);
  useEffect(() => { isBoardLockedRef.current = timerState.currentPhase === "done"; }, [timerState.currentPhase]);

  // Persist theme preference
  useEffect(() => {
    try { localStorage.setItem("retro-theme", theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);
  useEffect(() => {
    const saved = readPersistedRetroState(sessionId);
    if (saved) {
      notesRef.current = saved.notes;
      retroTypeRef.current = saved.retroType;
      timerRef.current = saved.timer;
      queueMicrotask(() => {
        setNotes(saved.notes);
        setRetroType(saved.retroType);
        setInputs(makeInputsForType(saved.retroType));
        setTimerState(normalizeTimerState(saved.timer));
      });
    }
    stateHydratedRef.current = true;
  }, [sessionId]);
  useEffect(() => {
    if (!stateHydratedRef.current || !joined) return;
    const snapshot: PersistedRetroState = { notes, retroType, timer: timerState };
    try { localStorage.setItem(`retro-state-${sessionId}`, JSON.stringify(snapshot)); } catch { /* Keep the live board usable. */ }
  }, [joined, notes, retroType, timerState, sessionId]);

  const playSound = useCallback(() => {
    try {
      type WebkitAudioWindow = Window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const audioWindow = window as WebkitAudioWindow;
      const AudioCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
      if (!AudioCtor) return;
      const audioContext = new AudioCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Fallback: silent
    }
  }, []);

  // ── Timer management ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!timerState.isRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        if (prev.remainingSeconds <= 0) {
          // Timer finished
          broadcast({ type: "timer_update", timer: { ...prev, isRunning: false, remainingSeconds: 0 } });
          playSound();
          return prev;
        }
        const newTimer = { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        if (prev.remainingSeconds % 10 === 1) {
          // Broadcast every 10 seconds for sync
          broadcast({ type: "timer_update", timer: newTimer });
        }
        return newTimer;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [broadcast, playSound, timerState.isRunning]);

  const startTimer = () => {
    if (isBoardLockedRef.current) return;
    const totalSeconds = timerDuration * 60;
    const newTimer: TimerState = { isRunning: true, remainingSeconds: totalSeconds, totalSeconds, currentPhase: timerState.currentPhase };
    setTimerState(newTimer);
    broadcast({ type: "timer_update", timer: newTimer });
  };

  const stopTimer = () => {
    if (isBoardLockedRef.current) return;
    const newTimer = { ...timerState, isRunning: false };
    setTimerState(newTimer);
    broadcast({ type: "timer_update", timer: newTimer });
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const changePhase = (phase: Phase) => {
    if (isBoardLockedRef.current && phase !== "action") return;
    const newTimer: TimerState = { ...timerState, currentPhase: phase, isRunning: false, remainingSeconds: 0 };
    setTimerState(newTimer);
    // Keep all clients in sync: moving to a new phase (especially Done) stops timer everywhere.
    broadcast({ type: "timer_update", timer: newTimer });
    broadcast({ type: "phase_change", phase });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ── Apply incoming events to state ─────────────────────────────────────────

  const applyEvent = useCallback((event: BroadcastEvent) => {
    switch (event.type) {
      case "add_note":
        if (isBoardLockedRef.current) break;
        setNotes((prev) =>
          prev.find((n) => n.id === event.note.id) ? prev : [...prev, event.note]
        );
        break;
      case "delete_note":
        if (isBoardLockedRef.current) break;
        setNotes((prev) => prev.filter((n) => n.id !== event.noteId));
        break;
      case "vote_note":
        if (isBoardLockedRef.current) break;
        setNotes((prev) =>
          prev.map((n) => {
            if (n.id !== event.noteId) return n;
            const votes =
              event.action === "add"
                ? [...new Set([...n.votes, event.userId])]
                : n.votes.filter((uid) => uid !== event.userId);
            return { ...n, votes };
          })
        );
        break;
      case "full_state":
        // Never let an empty late broadcast erase a locally restored board.
        if (event.notes.length > 0 || notesRef.current.length === 0) {
          notesRef.current = event.notes;
          setNotes(event.notes);
        }
        if (event.retroType) {
          retroTypeRef.current = event.retroType;
          setRetroType(event.retroType);
          setInputs(makeInputsForType(event.retroType));
        }
        const normalizedTimer = normalizeTimerState(event.timer ?? timerRef.current);
        timerRef.current = normalizedTimer;
        setTimerState(normalizedTimer);
        break;
      case "state_response":
        if (event.notes.length > 0) {
          const imported = event.notes
            .filter((note) => note.columnId === "action_items")
            .map((note) => ({
              ...note,
              id: crypto.randomUUID(),
              columnId: "action_items" as ColumnId,
              authorId: userIdRef.current,
              authorName: myNameRef.current,
              votes: [],
              createdAt: Date.now(),
            }));
          if (imported.length > 0) {
            setNotes((prev) => [...prev, ...imported]);
            imported.forEach((note) => broadcast({ type: "add_note", note }));
          }
        }
        break;
      case "timer_update":
        const timer = normalizeTimerState(event.timer ?? timerRef.current);
        timerRef.current = timer;
        setTimerState(timer);
        break;
      case "phase_change":
        setTimerState((prev) => {
          const next = {
          ...prev,
          currentPhase: event.phase,
          isRunning: false,
          remainingSeconds: event.phase === "done" ? 0 : prev.remainingSeconds,
          };
          timerRef.current = next;
          return next;
        });
        break;
    }
  }, [broadcast]);

  // ── Join / channel setup ───────────────────────────────────────────────────

  const joinChannel = useCallback(
    (name: string) => {
      const uid = userIdRef.current;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const channel = supabase.channel(`retro-${sessionId}`, {
        config: {
          presence: { key: uid },
          broadcast: { self: true },
        },
      });

      channel
        // Presence: membership only
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<{ userId: string; name: string }>();
          setMembers(() => {
            const next: Record<string, Member> = {};
            for (const presences of Object.values(state)) {
              const p = presences[0] as { userId: string; name: string } | undefined;
              if (p) next[p.userId] = { name: p.name };
            }
            return next;
          });
        })
        .on("presence", { event: "join" }, ({ newPresences }) => {
          // When someone new joins, send them the current board state
          const me = (newPresences as unknown as { userId: string }[]).find(
            (p) => p.userId !== uid,
          );
          if (me) {
            // Small delay so they're subscribed before we broadcast
            setTimeout(() => {
              broadcast({ type: "full_state", notes: notesRef.current, retroType: retroTypeRef.current, timer: timerRef.current });
            }, 500);
          }
        })
        // Broadcast: all game state
        .on("broadcast", { event: "add_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "delete_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "vote_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "full_state" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "state_response" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "request_state" }, ({ payload }) => {
          const request = payload as Extract<BroadcastEvent, { type: "request_state" }>;
          channel.send({
            type: "broadcast",
            event: "state_response",
            payload: {
              type: "state_response",
              requestId: request.requestId,
              notes: notesRef.current,
              retroType: retroTypeRef.current,
              timer: timerRef.current,
            } satisfies BroadcastEvent,
          });
        })
        .on("broadcast", { event: "timer_update" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "phase_change" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            setConnStatus("connected");
            await channel.track({ userId: uid, name });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setConnStatus("error");
          }
        });

      channelRef.current = channel;
    },
    [sessionId, broadcast, applyEvent],
  );

  // ── Mount: init userId, auto-rejoin from localStorage ─────────────────────

  useEffect(() => {
    userIdRef.current = currentUserId;

    const savedName = localStorage.getItem(`retro-name-${sessionId}`);
    if (savedName && !autoJoinedRef.current) {
      autoJoinedRef.current = true;
      myNameRef.current = savedName;
      setJoined(true);
      joinChannel(savedName);
    }

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [currentUserId, joinChannel, sessionId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleJoin = () => {
    const name = nameInput.trim();
    if (!name) return;
    myNameRef.current = name;
    localStorage.setItem(`retro-name-${sessionId}`, name);
    setJoined(true);
    joinChannel(name);
  };

  const handleRetroTypeChange = (nextType: RetroType) => {
    setRetroType(nextType);
    setInputs(makeInputsForType(nextType));
  };

  const handleAddNote = (columnId: ColumnId) => {
    if (isBoardLockedRef.current) return;
    const text = inputs[columnId].trim();
    if (!text) return;
    const note: RetroNote = {
      id: crypto.randomUUID(),
      columnId,
      text,
      authorId: userIdRef.current,
      authorName: myNameRef.current,
      votes: [],
      createdAt: ++noteSequenceRef.current,
    };
    setNotes((prev) => [...prev, note]);
    broadcast({ type: "add_note", note });
    setInputs((prev) => ({ ...prev, [columnId]: "" }));
  };

  const handleDeleteNote = (noteId: string) => {
    if (isBoardLockedRef.current) return;
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    broadcast({ type: "delete_note", noteId });
  };

  const buildExportLines = () => {
    const format = RETRO_FORMATS[retroType];
    const lines: string[] = [`# Retro Notes — ${format.label}`, `Session: ${sessionUrl}`, `Date: ${new Date().toLocaleDateString()}`, ""];
    for (const col of format.columns) {
      const colNotes = notes.filter((n) => n.columnId === col.id).sort((a, b) => b.votes.length - a.votes.length);
      lines.push(`## ${col.emoji} ${col.label}`);
      if (colNotes.length === 0) {
        lines.push("(no notes)");
      } else {
        colNotes.forEach((n) => lines.push(`- ${n.text}${n.votes.length > 0 ? ` 👍 ${n.votes.length}` : ""}`));
      }
      lines.push("");
    }
    return lines;
  };

  const handleExportNotes = () => {
    const lines = buildExportLines();
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {
      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retro-notes-${sessionId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleExportPdf = async () => {
    const lines = buildExportLines();
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margin = 14;
    const pageHeight = doc.internal.pageSize.getHeight();
    const wrapped = doc.splitTextToSize(lines.join("\n"), 180) as string[];
    let y = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    wrapped.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    doc.save(`retro-notes-${sessionId}.pdf`);
  };

  const handleVote = (note: RetroNote) => {
    if (isBoardLockedRef.current) return;
    const uid = userIdRef.current;
    const alreadyVoted = note.votes.includes(uid);
    setNotes((prev) => prev.map((item) => item.id === note.id ? {
      ...item,
      votes: alreadyVoted
        ? item.votes.filter((id) => id !== uid)
        : [...new Set([...item.votes, uid])],
    } : item));
    broadcast({
      type: "vote_note",
      noteId: note.id,
      userId: uid,
      action: alreadyVoted ? "remove" : "add",
    });
  };

  const handleImportActions = () => {
    const sourceId = sourceSessionId.trim();
    if (!sourceId || sourceId === sessionId || !myNameRef.current) return;
    const savedSource = readPersistedRetroState(sourceId);
    if (savedSource) {
      applyEvent({
        type: "state_response",
        requestId: "local-storage",
        notes: savedSource.notes,
        retroType: savedSource.retroType,
        timer: savedSource.timer,
      });
      setImportStatus("Action items imported from this browser.");
      return;
    }
    setImportStatus("Looking for action items…");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const requestId = crypto.randomUUID();
    const sourceChannel = supabase.channel(`retro-${sourceId}`, {
      config: { broadcast: { self: false } },
    });
    sourceChannel
      .on("broadcast", { event: "state_response" }, ({ payload }) => {
        const response = payload as Extract<BroadcastEvent, { type: "state_response" }>;
        if (response.requestId !== requestId) return;
        applyEvent(response);
        setImportStatus("Action items imported.");
        setTimeout(() => sourceChannel.unsubscribe(), 1000);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        await sourceChannel.send({
          type: "broadcast",
          event: "request_state",
          payload: { type: "request_state", requestId },
        });
        setTimeout(() => {
          setImportStatus((current) => current === "Looking for action items…" ? "No active board found." : current);
          sourceChannel.unsubscribe();
        }, 2500);
      });
  };

  // ─── Join screen ──────────────────────────────────────────────────────────

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Retro Board</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your name to join this session</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
              <input
                autoFocus
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && nameInput.trim() && handleJoin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Retro Template</label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {(Object.values(RETRO_FORMATS) as typeof RETRO_FORMATS[keyof typeof RETRO_FORMATS][]).map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleRetroTypeChange(format.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      retroType === format.id
                        ? "bg-blue-100 border-2 border-blue-600"
                        : "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{format.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <details>
              <summary className="text-sm font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700 list-none flex items-center gap-1.5">
                <span className="text-xs">▶</span>
                Board settings (theme)
              </summary>
              <div className="pt-4 mt-3 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(THEMES) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-sm capitalize transition-all ${
                          theme === t
                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : t === "ocean" ? "🌊 Ocean" : "🌅 Sunset"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <button
              onClick={handleJoin}
              disabled={!nameInput.trim()}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Join Session →
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4 font-mono break-all">{sessionId}</p>
        </div>
      </div>
    );
  }

  // ─── Board ────────────────────────────────────────────────────────────────

  const memberList = Object.values(members);
  const format = RETRO_FORMATS[retroType];
  const themeColors = THEMES[theme];
  const timerPercent = (timerState.remainingSeconds / timerState.totalSeconds) * 100 || 0;
  const isBoardLocked = timerState.currentPhase === "done";

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      {/* Header bar */}
      <div className={`${themeColors.headerBg} border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} px-4 py-4 flex flex-wrap items-center gap-3 justify-between`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-800"} truncate`}>
            {format.label} | {timerState.currentPhase}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              connStatus === "connected"
                ? "bg-green-100 text-green-700"
                : connStatus === "error"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {connStatus === "connected" ? "● Live" : connStatus === "error" ? "● Error" : "● Connecting…"}
          </span>
          {memberList.length > 0 && (
            <span className={`text-xs hidden sm:block ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {memberList.length} {memberList.length === 1 ? "person" : "people"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportNotes}
            disabled={notes.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            title="Copy all notes to clipboard as Markdown"
          >
            Export MD
          </button>
          <button
            onClick={handleExportPdf}
            disabled={notes.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
            title="Download all notes as PDF"
          >
            Export PDF
          </button>
          {!isBoardLocked && (
            <>
              <span title={sessionUrl} className={`text-sm hidden sm:block max-w-xs truncate font-mono ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {inviteDisplayUrl}
              </span>
              <CopyButton text={sessionUrl} label="Copy Invite" eventName="invite_copy" eventParams={{ tool: "retro_board" }} />
            </>
          )}
        </div>
      </div>

      {isBoardLocked && (
        <div className="px-4 pt-4">
          <div className="max-w-7xl mx-auto rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm font-medium">
            Congratulations! The retrospective is complete. You can now export your notes as Markdown or PDF.
          </div>
        </div>
      )}

      {/* Timer & Phase Control */}
      <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} px-4 py-4`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          {/* Timer display */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-lg">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray={`${(timerPercent / 100) * 125.6} 125.6`}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm">{formatTime(timerState.remainingSeconds)}</span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-2">
            <select
              value={timerDuration}
              onChange={(e) => setTimerDuration(parseInt(e.target.value))}
              disabled={timerState.isRunning || isBoardLocked}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              {[5, 10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
            <button
              onClick={startTimer}
              disabled={timerState.isRunning || isBoardLocked}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 font-semibold text-sm"
            >
              ▶ Start
            </button>
            <button
              onClick={stopTimer}
              disabled={!timerState.isRunning || isBoardLocked}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 font-semibold text-sm"
            >
              ⏹ Stop
            </button>
          </div>

          {/* Phase buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {(["brainstorm", "grouping", "discussion", "action", "done"] as Phase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => changePhase(phase)}
                disabled={isBoardLocked && phase !== "action"}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  timerState.currentPhase === phase
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {phase}
              </button>
            ))}
            {isBoardLocked && (
              <button
                onClick={() => changePhase("action")}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                title="Unlock the board and return to the Action phase"
              >
                Undo Done
              </button>
            )}
          </div>

          <div className={`w-full text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {PHASE_HELP[timerState.currentPhase]}
          </div>
          <details className={`w-full text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            <summary className="cursor-pointer font-semibold hover:text-blue-600">More information about each phase</summary>
            <div className="grid gap-2 mt-3 sm:grid-cols-2 lg:grid-cols-5">
              {(Object.keys(PHASE_DETAILS) as Phase[]).map((phase) => (
                <div key={phase} className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <strong className="capitalize">{PHASE_DETAILS[phase].label}:</strong> {PHASE_DETAILS[phase].detail}
                </div>
              ))}
            </div>
          </details>
          <div className="w-full flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
            <label htmlFor="retro-import" className="text-xs font-semibold">Pull actions from another board</label>
            <input
              id="retro-import"
              value={sourceSessionId}
              onChange={(e) => setSourceSessionId(e.target.value)}
              placeholder="Paste source session ID"
              className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
            />
            <button
              onClick={handleImportActions}
              disabled={!sourceSessionId.trim() || isBoardLocked}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Import Action Items
            </button>
            {importStatus && <span className="text-xs text-gray-500">{importStatus}</span>}
          </div>
        </div>
      </div>

      {/* Board columns */}
      <div className={`grid grid-cols-1 ${format.columns.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 p-4 max-w-7xl mx-auto`}>
        {format.columns.map((col) => {
          const colNotes = notes
            .filter((n) => n.columnId === col.id)
            .sort((a, b) => b.votes.length - a.votes.length || a.createdAt - b.createdAt);

          return (
            <div key={col.id} className={`rounded-xl border-2 ${col.bg} p-4 flex flex-col gap-3`}>
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{col.emoji}</span>
                <h3 className={`font-bold text-base ${col.color}`}>{col.label}</h3>
                <span className="ml-auto text-xs text-gray-500 font-medium">{colNotes.length}</span>
              </div>

              {/* Add note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add a note…`}
                  value={inputs[col.id] || ""}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [col.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote(col.id)}
                  disabled={isBoardLocked}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  onClick={() => handleAddNote(col.id)}
                  disabled={!inputs[col.id]?.trim() || isBoardLocked}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none"
                  title="Add note"
                >
                  +
                </button>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
                <AnimatePresence mode="wait">
                  {colNotes.map((note, idx) => {
                    const myVoted = currentUserId ? note.votes.includes(currentUserId) : false;
                    const isOwner = currentUserId ? note.authorId === currentUserId : false;
                    return (
                      <motion.div
                        key={note.id}
                        variants={animationsEnabled ? ANIMATION_VARIANTS.slideIn : { initial: {}, animate: {}, exit: {} }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: DURATIONS.normal / 1000, delay: idx * 0.05, ease: EASINGS.smooth }}
                        className={`rounded-lg border ${NOTE_COLORS[col.id]} p-3 group relative hover:shadow-md transition-shadow`}
                      >
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{note.text}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <button
                            onClick={() => handleVote(note)}
                            disabled={isBoardLocked}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                              myVoted
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                            }`}
                            title={myVoted ? "Remove vote" : "Vote for this"}
                          >
                            👍 {note.votes.length}
                          </button>
                          <span className="text-xs text-gray-500 font-medium">👤 {note.authorName}</span>
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={isBoardLocked}
                              className="ml-auto text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete note"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {colNotes.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">✨ Add something great here →</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Board completion hint */}
      {(() => {
        const isComplete = format.columns.every((col) =>
          notes.some((n) => n.columnId === col.id),
        );
        return isComplete ? (
          <motion.div
            variants={animationsEnabled ? {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 20 }
            } : {
              initial: {},
              animate: {},
              exit: {}
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={animationsEnabled ? { duration: DURATIONS.normal / 1000 } : { duration: 0 }}
            className="mt-6 mx-4 max-w-7xl mb-6 p-4 bg-blue-100 border-l-4 border-blue-600 rounded text-blue-900 flex items-start gap-3"
          >
            <span className="text-xl flex-shrink-0">✓</span>
            <div>
              <strong>Board is complete!</strong> Ready to wrap up? <strong>Screenshot this moment</strong> to share with your team.
            </div>
          </motion.div>
        ) : null;
      })()}

      {/* Member list footer */}
      {memberList.length > 0 && (
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t px-4 py-4`}>
          <div className={`max-w-7xl mx-auto rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-3 flex flex-wrap items-center gap-2`}>
            <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>In this session:</span>
            {memberList.map((m, i) => (
              <span key={i} className={`text-xs rounded-full px-3 py-1 ${theme === "dark" ? "bg-gray-600 text-gray-100" : "bg-gray-100 text-gray-700"}`}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
