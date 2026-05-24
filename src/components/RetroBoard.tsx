"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import CopyButton from "./CopyButton";

// ─── Types ──────────────────────────────────────────────────────────────────

type ColumnId = "went_well" | "to_improve" | "action_items";

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

// ─── Broadcast event shapes ──────────────────────────────────────────────────

type BroadcastEvent =
  | { type: "add_note"; note: RetroNote }
  | { type: "delete_note"; noteId: string }
  | { type: "vote_note"; noteId: string; userId: string; action: "add" | "remove" }
  | { type: "full_state"; notes: RetroNote[] };

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS: { id: ColumnId; label: string; emoji: string; color: string; bg: string }[] = [
  { id: "went_well", label: "Went Well", emoji: "🟢", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  { id: "to_improve", label: "To Improve", emoji: "🔴", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  { id: "action_items", label: "Action Items", emoji: "🔵", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
];

const NOTE_COLORS: Record<ColumnId, string> = {
  went_well: "bg-green-100 border-green-300",
  to_improve: "bg-red-100 border-red-300",
  action_items: "bg-blue-100 border-blue-300",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RetroBoard({ sessionId }: { sessionId: string }) {
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [notes, setNotes] = useState<RetroNote[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [sessionUrl, setSessionUrl] = useState(`https://agiletoolhub.com/tools/retro-board/${sessionId}`);
  const [inputs, setInputs] = useState<Record<ColumnId, string>>({ went_well: "", to_improve: "", action_items: "" });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const myNameRef = useRef("");
  const autoJoinedRef = useRef(false);
  const notesRef = useRef<RetroNote[]>([]);

  // Keep notesRef in sync for use in callbacks
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { setSessionUrl(window.location.href); }, []);

  // ── Broadcast helpers ──────────────────────────────────────────────────────

  const broadcast = useCallback((payload: BroadcastEvent) => {
    channelRef.current?.send({ type: "broadcast", event: payload.type, payload });
  }, []);

  // ── Apply incoming events to state ─────────────────────────────────────────

  const applyEvent = useCallback((event: BroadcastEvent) => {
    switch (event.type) {
      case "add_note":
        setNotes((prev) =>
          prev.find((n) => n.id === event.note.id) ? prev : [...prev, event.note]
        );
        break;
      case "delete_note":
        setNotes((prev) => prev.filter((n) => n.id !== event.noteId));
        break;
      case "vote_note":
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
        setNotes(event.notes);
        break;
    }
  }, []);

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
          setMembers((prev) => {
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
          if (me && notesRef.current.length > 0) {
            // Small delay so they're subscribed before we broadcast
            setTimeout(() => {
              broadcast({ type: "full_state", notes: notesRef.current });
            }, 500);
          }
        })
        // Broadcast: all game state
        .on("broadcast", { event: "add_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "delete_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "vote_note" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
        .on("broadcast", { event: "full_state" }, ({ payload }) => applyEvent(payload as BroadcastEvent))
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
    let uid = sessionStorage.getItem(`retro-uid-${sessionId}`);
    if (!uid) {
      uid = crypto.randomUUID();
      sessionStorage.setItem(`retro-uid-${sessionId}`, uid);
    }
    userIdRef.current = uid;

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
  }, [joinChannel, sessionId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleJoin = () => {
    const name = nameInput.trim();
    if (!name) return;
    myNameRef.current = name;
    localStorage.setItem(`retro-name-${sessionId}`, name);
    setJoined(true);
    joinChannel(name);
  };

  const handleAddNote = (columnId: ColumnId) => {
    const text = inputs[columnId].trim();
    if (!text) return;
    const note: RetroNote = {
      id: crypto.randomUUID(),
      columnId,
      text,
      authorId: userIdRef.current,
      authorName: myNameRef.current,
      votes: [],
      createdAt: Date.now(),
    };
    broadcast({ type: "add_note", note });
    setInputs((prev) => ({ ...prev, [columnId]: "" }));
  };

  const handleDeleteNote = (noteId: string) => {
    broadcast({ type: "delete_note", noteId });
  };

  const handleVote = (note: RetroNote) => {
    const uid = userIdRef.current;
    const alreadyVoted = note.votes.includes(uid);
    broadcast({
      type: "vote_note",
      noteId: note.id,
      userId: uid,
      action: alreadyVoted ? "remove" : "add",
    });
  };

  // ─── Join screen ──────────────────────────────────────────────────────────

  if (!joined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Retro</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your name to join this retrospective.</p>
          <input
            type="text"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />
          <button
            onClick={handleJoin}
            disabled={!nameInput.trim()}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Join session
          </button>
        </div>
      </div>
    );
  }

  // ─── Board ────────────────────────────────────────────────────────────────

  const memberList = Object.values(members);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-semibold text-gray-800 truncate">Retrospective</span>
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
            <span className="text-xs text-gray-500 hidden sm:block">
              {memberList.length} {memberList.length === 1 ? "person" : "people"} in session
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 hidden sm:block truncate max-w-xs">{sessionUrl}</span>
          <CopyButton text={sessionUrl} />
        </div>
      </div>

      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {COLUMNS.map((col) => {
          const colNotes = notes
            .filter((n) => n.columnId === col.id)
            .sort((a, b) => b.votes.length - a.votes.length || a.createdAt - b.createdAt);

          return (
            <div key={col.id} className={`rounded-xl border-2 ${col.bg} p-4 flex flex-col gap-3`}>
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.emoji}</span>
                <h3 className={`font-bold text-base ${col.color}`}>{col.label}</h3>
                <span className="ml-auto text-xs text-gray-500 font-medium">{colNotes.length}</span>
              </div>

              {/* Add note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add a note…`}
                  value={inputs[col.id]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [col.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote(col.id)}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  onClick={() => handleAddNote(col.id)}
                  disabled={!inputs[col.id].trim()}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none"
                  title="Add note"
                >
                  +
                </button>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                {colNotes.map((note) => {
                  const myVoted = note.votes.includes(userIdRef.current);
                  const isOwner = note.authorId === userIdRef.current;
                  return (
                    <div
                      key={note.id}
                      className={`rounded-lg border ${NOTE_COLORS[col.id]} p-3 group relative`}
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleVote(note)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                            myVoted
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                          title={myVoted ? "Remove vote" : "Vote for this"}
                        >
                          👍 {note.votes.length}
                        </button>
                        <span className="text-xs text-gray-400">{note.authorName}</span>
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="ml-auto text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete note"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Member list footer */}
      {memberList.length > 0 && (
        <div className="px-4 pb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">In this session:</span>
            {memberList.map((m, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
