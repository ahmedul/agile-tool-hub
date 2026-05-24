"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import CopyButton from "./CopyButton";

const CARDS = [1, 2, 3, 5, 8, 13, 21, "?"] as const;
type CardValue = (typeof CARDS)[number];
type Vote = CardValue | null;

interface Participant {
  name: string;
  hasVoted: boolean;
  vote: Vote;
}

interface StorySummary {
  name: string;
  estimate: Vote;
}

interface PresenceEntry {
  userId: string;
  name: string;
  hasVoted: boolean;
  vote: Vote;
}

export default function PlanningPokerRoom({ sessionId }: { sessionId: string }) {
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [myVote, setMyVote] = useState<Vote>(null);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [currentStory, setCurrentStory] = useState("");
  const [storyInput, setStoryInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [finalEstimate, setFinalEstimate] = useState<Vote>(null);
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "error">("connecting");
  // Fix: sessionUrl as state to avoid SSR/client hydration mismatch
  const [sessionUrl, setSessionUrl] = useState(`https://agiletoolhub.com/tools/planning-poker/${sessionId}`);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const myNameRef = useRef("");
  const myVoteRef = useRef<Vote>(null);
  const hasVotedRef = useRef(false);
  const autoJoinedRef = useRef(false);

  useEffect(() => {
    setSessionUrl(window.location.href);
  }, []);

  useEffect(() => {
    myVoteRef.current = myVote;
  }, [myVote]);

  const joinChannel = useCallback(
    (name: string) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { realtime: { params: { eventsPerSecond: 10 } } },
      );

      const channel = supabase.channel(`poker-${sessionId}`, {
        config: {
          presence: { key: userIdRef.current },
          broadcast: { self: false },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<PresenceEntry>();
          const updated: Record<string, Participant> = {};
          for (const [key, presences] of Object.entries(state)) {
            const p = presences[0];
            if (p) {
              updated[key] = { name: p.name, hasVoted: p.hasVoted, vote: p.vote };
            }
          }
          // Merge: preserve optimistic hasVoted for self so reveal button stays correct
          setParticipants((prev) => {
            const merged = { ...updated };
            const myUid = userIdRef.current;
            if (myUid && merged[myUid] && prev[myUid]) {
              merged[myUid] = {
                ...merged[myUid],
                hasVoted: merged[myUid].hasVoted || prev[myUid].hasVoted,
              };
            }
            return merged;
          });
        })
        .on("broadcast", { event: "story" }, ({ payload }) => {
          setCurrentStory(payload.name as string);
          setStoryInput(payload.name as string);
        })
        .on("broadcast", { event: "reveal" }, () => {
          setRevealed(true);
          channelRef.current?.track({
            userId: userIdRef.current,
            name: myNameRef.current,
            hasVoted: hasVotedRef.current,
            vote: myVoteRef.current,
          });
        })
        .on("broadcast", { event: "next_story" }, ({ payload }) => {
          const story = payload.story as string | undefined;
          const estimate = payload.estimate as Vote;
          if (story) {
            setStories((prev) => [...prev, { name: story, estimate: estimate ?? null }]);
          }
          setRevealed(false);
          setMyVote(null);
          myVoteRef.current = null;
          hasVotedRef.current = false;
          setCurrentStory("");
          setStoryInput("");
          setFinalEstimate(null);
          const uid = userIdRef.current;
          const myName = myNameRef.current;
          setParticipants((prev) => ({
            ...prev,
            [uid]: { name: myName, hasVoted: false, vote: null },
          }));
          channelRef.current?.track({ userId: uid, name: myName, hasVoted: false, vote: null });
        })
        .subscribe(async (status, err) => {
          console.log("[poker] channel status:", status, err ?? "");
          if (status === "SUBSCRIBED") {
            setConnStatus("connected");
            await channel.track({
              userId: userIdRef.current,
              name,
              hasVoted: false,
              vote: null,
            });
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setConnStatus("error");
          }
        });

      channelRef.current = channel;
    },
    [sessionId],
  );

  // Init: set up userId and auto-rejoin if name was saved
  useEffect(() => {
    let uid = sessionStorage.getItem("pp_uid");
    if (!uid) {
      uid = Math.random().toString(36).slice(2, 11);
      sessionStorage.setItem("pp_uid", uid);
    }
    userIdRef.current = uid;

    const savedName = localStorage.getItem("pp_name");
    if (savedName && !autoJoinedRef.current) {
      autoJoinedRef.current = true;
      setNameInput(savedName);
      myNameRef.current = savedName;
      setParticipants({ [uid]: { name: savedName, hasVoted: false, vote: null } });
      setJoined(true);
      joinChannel(savedName);
    }
  }, [joinChannel]);

  useEffect(() => {
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    localStorage.setItem("pp_name", name);
    myNameRef.current = name;
    setParticipants({ [userIdRef.current]: { name, hasVoted: false, vote: null } });
    setJoined(true);
    joinChannel(name);
  };

  const handleVote = (card: CardValue) => {
    if (revealed) return;
    const newVote: Vote = myVote === card ? null : card;
    setMyVote(newVote);
    myVoteRef.current = newVote;
    hasVotedRef.current = newVote !== null;
    // Optimistic update so Reveal button enables immediately
    const uid = userIdRef.current;
    setParticipants((prev) => ({
      ...prev,
      [uid]: { ...(prev[uid] ?? { name: myNameRef.current, vote: null }), hasVoted: newVote !== null },
    }));
    channelRef.current?.track({
      userId: uid,
      name: myNameRef.current,
      hasVoted: newVote !== null,
      vote: null,
    });
  };

  const handleSetStory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = storyInput.trim();
    if (!name) return;
    setCurrentStory(name);
    channelRef.current?.send({ type: "broadcast", event: "story", payload: { name } });
  };

  const handleReveal = () => {
    setRevealed(true);
    channelRef.current?.track({
      userId: userIdRef.current,
      name: myNameRef.current,
      hasVoted: hasVotedRef.current,
      vote: myVoteRef.current,
    });
    channelRef.current?.send({ type: "broadcast", event: "reveal", payload: {} });
  };

  const handleNextStory = () => {
    const story = currentStory;
    const estimate = finalEstimate;
    channelRef.current?.send({
      type: "broadcast",
      event: "next_story",
      payload: { story, estimate },
    });
    if (story) setStories((prev) => [...prev, { name: story, estimate }]);
    setRevealed(false);
    setMyVote(null);
    myVoteRef.current = null;
    hasVotedRef.current = false;
    setCurrentStory("");
    setStoryInput("");
    setFinalEstimate(null);
    const uid = userIdRef.current;
    const myName = myNameRef.current;
    setParticipants((prev) => ({
      ...prev,
      [uid]: { name: myName, hasVoted: false, vote: null },
    }));
    channelRef.current?.track({ userId: uid, name: myName, hasVoted: false, vote: null });
  };

  const participantList = Object.entries(participants);
  const votedCount = participantList.filter(([, p]) => p.hasVoted).length;
  const totalCount = participantList.length;
  const canReveal = myVote !== null || votedCount > 0;

  // ── Name entry screen ──────────────────────────────────────────
  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Planning Poker</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your name to join this session</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Join Session
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4 font-mono break-all">{sessionId}</p>
        </div>
      </div>
    );
  }

  // ── Main poker room ────────────────────────────────────────────
  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Invite bar */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
          <span className="text-blue-700 font-medium shrink-0">Invite:</span>
          <span className="text-blue-600 truncate flex-1 font-mono text-xs">{sessionUrl}</span>
          <CopyButton text={sessionUrl} />
          <span
            className={[
              "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
              connStatus === "connected"
                ? "bg-green-100 text-green-700"
                : connStatus === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700",
            ].join(" ")}
          >
            {connStatus === "connected"
              ? "● Connected"
              : connStatus === "error"
                ? "● Error"
                : "● Connecting…"}
          </span>
        </div>

        {/* Story setter */}
        <div>
          <form onSubmit={handleSetStory} className="flex gap-2">
            <input
              type="text"
              placeholder="User story name or description…"
              value={storyInput}
              onChange={(e) => setStoryInput(e.target.value)}
              disabled={revealed}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              type="submit"
              disabled={!storyInput.trim() || revealed}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
            >
              Set Story
            </button>
          </form>
          {currentStory && (
            <p className="mt-2 text-sm text-blue-700 px-1">
              Estimating: <strong>{currentStory}</strong>
            </p>
          )}
        </div>

        {/* Card hand */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Your vote
          </p>
          <div className="flex flex-wrap gap-3">
            {CARDS.map((card) => (
              <button
                key={card}
                onClick={() => handleVote(card)}
                disabled={revealed}
                className={[
                  "w-14 h-20 rounded-xl border-2 text-xl font-bold transition-all duration-150",
                  myVote === card
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md",
                  revealed ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                {card}
              </button>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Team — {votedCount}/{totalCount} voted
          </p>
          {participantList.length === 0 ? (
            <p className="text-sm text-gray-400">Waiting for teammates to join…</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {participantList.map(([uid, p]) => (
                <div key={uid} className="flex flex-col items-center gap-1.5">
                  <div
                    className={[
                      "w-14 h-20 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all",
                      revealed && p.vote !== null
                        ? "bg-white border-green-400 text-gray-900 shadow"
                        : revealed
                          ? "bg-gray-50 border-gray-200 text-gray-400"
                          : p.hasVoted
                            ? "bg-blue-600 border-blue-700 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-300",
                    ].join(" ")}
                  >
                    {revealed ? (p.vote ?? "–") : p.hasVoted ? "✓" : "·"}
                  </div>
                  <span className="text-xs text-gray-500 max-w-[56px] truncate text-center">
                    {p.name}
                    {uid === userIdRef.current ? " (you)" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={!canReveal}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {!canReveal
              ? "Pick a card first…"
              : votedCount === totalCount && totalCount > 0
                ? "Reveal Cards ✓"
                : `Reveal Cards (${votedCount}/${totalCount})`}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-4">Results</p>
              <div className="flex flex-wrap gap-6">
                {participantList.map(([uid, p]) => (
                  <div key={uid} className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{p.vote ?? "–"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600 font-medium shrink-0">Final estimate:</span>
              <div className="flex gap-1.5 flex-wrap">
                {CARDS.map((card) => (
                  <button
                    key={card}
                    onClick={() => setFinalEstimate(finalEstimate === card ? null : card)}
                    className={[
                      "px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors",
                      finalEstimate === card
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400",
                    ].join(" ")}
                  >
                    {card}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextStory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                Next Story →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col sticky top-6">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">Session Log</p>
            <p className="text-xs text-gray-400">{stories.length} stories estimated</p>
          </div>
          <div className="overflow-y-auto max-h-[60vh] p-3 space-y-2">
            {stories.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 leading-relaxed">
                Completed stories
                <br />
                will appear here
              </p>
            ) : (
              stories.map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700 leading-snug flex-1">
                    {s.name || "Untitled story"}
                  </p>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                    {s.estimate ?? "–"}
                  </span>
                </div>
              ))
            )}
          </div>
          {stories.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Total pts:{" "}
                <strong>
                  {stories
                    .filter((s) => typeof s.estimate === "number")
                    .reduce((acc, s) => acc + (s.estimate as number), 0)}
                </strong>
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
