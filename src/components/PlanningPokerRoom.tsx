"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { ANIMATION_VARIANTS, DURATIONS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animations";
import CopyButton from "./CopyButton";
import CelebrationMoment from "@/components/CelebrationMoment";
import {
  appendStorySummary,
  deriveRecommendedEstimate,
  PLANNING_POKER_CARDS,
  resetVotes,
  upsertMyVote,
  upsertUnvoted,
  upsertVoted,
  type CardValue,
  type Vote,
  type ParticipantState,
  type StorySummary,
} from "@/lib/planningPoker";

const ANIMAL_AVATARS = ["🐶", "🐱", "🦊", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🦉"] as const;
const HERO_AVATARS = ["🦸", "🦸‍♀️", "🛡️", "⚡", "🔥", "🌟", "🧠", "🦾", "🛰️", "🕶️"] as const;
type AvatarTheme = "animals" | "heroes";

function hashKey(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAvatar(uid: string, theme: AvatarTheme): string {
  const list = theme === "animals" ? ANIMAL_AVATARS : HERO_AVATARS;
  return list[hashKey(uid) % list.length];
}

export default function PlanningPokerRoom({ sessionId }: { sessionId: string }) {
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [myVote, setMyVote] = useState<Vote>(null);
  const [participants, setParticipants] = useState<Record<string, ParticipantState>>({});
  const [currentStory, setCurrentStory] = useState("");
  const [storyInput, setStoryInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [avatarTheme, setAvatarTheme] = useState<AvatarTheme>("animals");
  const [stories, setStories] = useState<StorySummary[]>(() => {
    if (typeof window === "undefined") return [];
    const savedStories = localStorage.getItem(`pp_stories_${sessionId}`);
    if (!savedStories) return [];
    try {
      const parsed = JSON.parse(savedStories) as StorySummary[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [finalEstimate, setFinalEstimate] = useState<Vote>(null);
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [sessionUrl] = useState(() =>
    typeof window !== "undefined"
      ? window.location.href
      : `https://agiletoolhub.com/tools/planning-poker/${sessionId}`,
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [myUserId] = useState(() =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  );
  const animationsEnabled = useAnimation();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const myNameRef = useRef("");
  const myVoteRef = useRef<Vote>(null);
  const currentStoryRef = useRef("");
  const revealedRef = useRef(false);
  const autoJoinedRef = useRef(false);

  useEffect(() => { myVoteRef.current = myVote; }, [myVote]);
  useEffect(() => { currentStoryRef.current = currentStory; }, [currentStory]);
  useEffect(() => { revealedRef.current = revealed; }, [revealed]);

  // Check for consensus when votes are revealed
  useEffect(() => {
    if (!revealed) return;

    const nonNullVotes = Object.values(participants)
      .map(p => p.vote)
      .filter(v => v !== null);

    if (nonNullVotes.length > 1 && new Set(nonNullVotes).size === 1) {
      // Delay state writes to avoid synchronous setState calls inside an effect.
      const timer = window.setTimeout(() => {
        setCelebrationMessage("Perfect consensus! Your team's in sync 🎯");
        setShowCelebration(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [revealed, participants]);
  
  // Persist stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`pp_stories_${sessionId}`, JSON.stringify(stories));
  }, [stories, sessionId]);

  const joinChannel = useCallback(
    (name: string) => {
      const uid = userIdRef.current;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // broadcast: self = true so every client (including sender) receives all events uniformly.
      // Presence is only used for membership (join/leave). All game state goes through broadcast.
      const channel = supabase.channel(`poker-${sessionId}`, {
        config: {
          presence: { key: uid },
          broadcast: { self: true },
        },
      });

      channel
        // ── Presence: membership only ──────────────────────────────
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<{ userId: string; name: string }>();
          setParticipants((prev) => {
            const next: Record<string, ParticipantState> = {};
            for (const [key, presences] of Object.entries(state)) {
              const p = presences[0] as { userId: string; name: string } | undefined;
              if (p) {
                // Preserve existing vote state for known participants
                next[key] = prev[key]
                  ? { ...prev[key], name: p.name }
                  : { name: p.name, hasVoted: false, vote: null };
              }
            }
            return next;
          });
        })
        .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
          setParticipants((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        })
        // ── Broadcasts: all game state ─────────────────────────────
        // Someone voted (no value revealed)
        .on("broadcast", { event: "voted" }, ({ payload }) => {
          const { userId, name } = payload as { userId: string; name?: string };
          setParticipants((prev) => upsertVoted(prev, userId, name));
        })
        // Someone unvoted
        .on("broadcast", { event: "unvoted" }, ({ payload }) => {
          const { userId, name } = payload as { userId: string; name?: string };
          setParticipants((prev) => upsertUnvoted(prev, userId, name));
        })
        // Story name set
        .on("broadcast", { event: "story" }, ({ payload }) => {
          const name = payload.name as string;
          setCurrentStory(name);
          setStoryInput(name);
        })
        // New client requests current room state after joining.
        .on("broadcast", { event: "request_state" }, ({ payload }) => {
          const { requesterId } = payload as { requesterId: string };
          if (!requesterId || requesterId === userIdRef.current) return;

          channelRef.current?.send({
            type: "broadcast",
            event: "state_snapshot",
            payload: {
              targetId: requesterId,
              story: currentStoryRef.current,
              revealed: revealedRef.current,
            },
          });
        })
        .on("broadcast", { event: "state_snapshot" }, ({ payload }) => {
          const { targetId, story, revealed } = payload as {
            targetId: string;
            story?: string;
            revealed?: boolean;
          };
          if (targetId !== userIdRef.current) return;

          if (story && !currentStoryRef.current) {
            setCurrentStory(story);
            setStoryInput(story);
          }
          if (typeof revealed === "boolean") {
            setRevealed(revealed);
          }
        })
        // Reveal triggered — every client (including sender via self:true) sends their actual vote
        .on("broadcast", { event: "reveal" }, () => {
          setRevealed(true);
          channelRef.current?.send({
            type: "broadcast",
            event: "my_vote",
            payload: {
              userId: userIdRef.current,
              vote: myVoteRef.current,
              name: myNameRef.current,
            },
          });
        })
        // Actual vote (only exchanged at reveal time)
        .on("broadcast", { event: "my_vote" }, ({ payload }) => {
          const { userId, vote, name } = payload as {
            userId: string;
            vote: Vote;
            name?: string;
          };
          setParticipants((prev) => upsertMyVote(prev, userId, vote, name));
        })
        // Next round — resets all state for everyone
        .on("broadcast", { event: "next_story" }, ({ payload }) => {
          const story = payload.story as string | undefined;
          const estimate = payload.estimate as Vote;
          setStories((prev) => appendStorySummary(prev, story, estimate));
          setRevealed(false);
          setMyVote(null);
          myVoteRef.current = null;
          setCurrentStory("");
          setStoryInput("");
          setFinalEstimate(null);
          setParticipants((prev) => resetVotes(prev));
        })
        // Re-vote for same story
        .on("broadcast", { event: "revote" }, () => {
          setRevealed(false);
          setMyVote(null);
          myVoteRef.current = null;
          setFinalEstimate(null);
          setParticipants((prev) => resetVotes(prev));
        })
        .subscribe(async (status, err) => {
          console.log("[poker] status:", status, err ?? "");
          if (status === "SUBSCRIBED") {
            setConnStatus("connected");
            await channel.track({ userId: uid, name });
            // Ask existing members for current story/reveal state for late joins.
            channel.send({
              type: "broadcast",
              event: "request_state",
              payload: { requesterId: uid },
            });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnStatus("error");
          }
        });

      channelRef.current = channel;
    },
    [sessionId],
  );

  // Init: stable userId + auto-rejoin from localStorage
  useEffect(() => {
    userIdRef.current = myUserId;

    const savedName = localStorage.getItem("pp_name");
    
    if (savedName && !autoJoinedRef.current) {
      autoJoinedRef.current = true;
      setNameInput(savedName);
      myNameRef.current = savedName;
      setParticipants({ [myUserId]: { name: savedName, hasVoted: false, vote: null } });
      setJoined(true);
      joinChannel(savedName);
    }
  }, [joinChannel, myUserId]);

  useEffect(() => () => { channelRef.current?.unsubscribe(); }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    localStorage.setItem("pp_name", name);
    myNameRef.current = name;
    setParticipants({ [myUserId]: { name, hasVoted: false, vote: null } });
    setJoined(true);
    joinChannel(name);
  };

  const handleVote = (card: CardValue) => {
    if (revealed) return;

    if (!currentStory.trim()) {
      const draftStory = storyInput.trim();
      if (!draftStory) return;
      // Smooth UX: first vote can promote typed draft into the active story.
      setCurrentStory(draftStory);
      channelRef.current?.send({ type: "broadcast", event: "story", payload: { name: draftStory } });
    }

    const newVote: Vote = myVote === card ? null : card;
    const wasVoted = myVote !== null;
    const isVoted = newVote !== null;
    setMyVote(newVote);
    myVoteRef.current = newVote;
    // Broadcast will come back to us (self:true) and update participants state
    if (isVoted && !wasVoted) {
      channelRef.current?.send({
        type: "broadcast",
        event: "voted",
        payload: { userId: userIdRef.current, name: myNameRef.current },
      });
    } else if (!isVoted && wasVoted) {
      channelRef.current?.send({
        type: "broadcast",
        event: "unvoted",
        payload: { userId: userIdRef.current, name: myNameRef.current },
      });
    }
  };

  const handleSetStory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = storyInput.trim();
    if (!name) return;
    // self:true — we receive this back ourselves and update currentStory uniformly
    channelRef.current?.send({ type: "broadcast", event: "story", payload: { name } });
  };

  const handleReveal = () => {
    if (!currentStory.trim()) return;
    // self:true — we receive "reveal" back, set revealed, and broadcast "my_vote"
    channelRef.current?.send({ type: "broadcast", event: "reveal", payload: {} });
  };

  const handleNextStory = () => {
    if (!currentStory.trim()) return;
    const votes = Object.values(participants).map((p) => p.vote);
    const resolvedEstimate: Vote = finalEstimate ?? deriveRecommendedEstimate(votes);
    if (resolvedEstimate === null) return;
    // self:true — we receive "next_story" back and reset state uniformly
    channelRef.current?.send({
      type: "broadcast",
      event: "next_story",
      payload: { story: currentStory, estimate: resolvedEstimate },
    });
  };

  const handleRevote = () => {
    if (!currentStory.trim()) return;
    channelRef.current?.send({ type: "broadcast", event: "revote", payload: {} });
  };

  const participantList = Object.entries(participants);
  const votedCount = participantList.filter(([, p]) => p.hasVoted).length;
  const totalCount = participantList.length;
  const hasStory = currentStory.trim().length > 0;
  const canReveal = hasStory && (myVote !== null || votedCount > 0);
  const recommendedEstimate = deriveRecommendedEstimate(participantList.map(([, p]) => p.vote));
  const totalPoints = stories
    .filter((s) => typeof s.estimate === "number")
    .reduce((acc, s) => acc + (s.estimate as number), 0);
  const unresolvedStories = stories.filter((s) => s.estimate === "?").length;

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
            {connStatus === "connected" ? "● Live" : connStatus === "error" ? "● Error" : "● Connecting…"}
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your vote</p>
          <div className="flex flex-col gap-4">
            {/* Fibonacci cards */}
            <motion.div
              className="flex flex-wrap gap-3"
              variants={ANIMATION_VARIANTS.slideIn}
              initial="initial"
              animate={animationsEnabled ? "animate" : false}
              transition={{ duration: DURATIONS.normal / 1000 }}
            >
              {PLANNING_POKER_CARDS.filter((card) => typeof card === "number" || card === "?").map((card) => (
                <button
                  key={card}
                  onClick={() => handleVote(card)}
                  disabled={revealed || !hasStory}
                  title={!hasStory ? "Set a story first to enable voting" : undefined}
                  className={[
                    "w-14 h-20 rounded-xl border-2 text-xl font-bold transition-all duration-150",
                    myVote === card
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md",
                    revealed || !hasStory ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                >
                  {card}
                </button>
              ))}
            </motion.div>
            {/* Fun cards (skip/defer) */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Skip/Defer (optional):</p>
              <motion.div
                className="flex flex-wrap gap-3"
                variants={STAGGER_CONTAINER}
                initial="initial"
                animate={animationsEnabled ? "animate" : false}
              >
                {PLANNING_POKER_CARDS.filter((card) => typeof card === "string" && card !== "?").map((card) => (
                  <motion.button
                    key={card}
                    variants={STAGGER_ITEM}
                    onClick={() => handleVote(card)}
                    disabled={revealed || !hasStory}
                    title={!hasStory ? "Set a story first to enable voting" : card === "🍺" ? "Can't estimate (need more info)" : card === "☕" ? "Too complex (needs breakdown)" : "Money/stakeholder decision"}
                    className={[
                      "w-14 h-20 rounded-xl border-2 text-2xl font-bold transition-all duration-150",
                      myVote === card
                        ? "bg-amber-100 border-amber-300 shadow-lg scale-105"
                        : "bg-gray-50 border-gray-300 text-gray-600 hover:border-amber-300 hover:shadow-md",
                      revealed || !hasStory ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {card}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Team — {votedCount}/{totalCount} voted
          </p>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Card theme:</span>
            <button
              type="button"
              onClick={() => setAvatarTheme("animals")}
              className={[
                "px-2 py-1 text-xs rounded border",
                avatarTheme === "animals"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300",
              ].join(" ")}
            >
              Animals
            </button>
            <button
              type="button"
              onClick={() => setAvatarTheme("heroes")}
              className={[
                "px-2 py-1 text-xs rounded border",
                avatarTheme === "heroes"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300",
              ].join(" ")}
            >
              Heroes
            </button>
          </div>
          {participantList.length === 0 ? (
            <p className="text-sm text-gray-400">Waiting for teammates to join…</p>
          ) : (
            <motion.div
              className="flex flex-wrap gap-4"
              variants={STAGGER_CONTAINER}
              initial="initial"
              animate={animationsEnabled ? "animate" : false}
            >
              {participantList.map(([uid, p]) => (
                <motion.div
                  key={uid}
                  variants={STAGGER_ITEM}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={[
                      "relative w-14 h-20 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all",
                      revealed && p.vote !== null
                        ? "bg-white border-green-400 text-gray-900 shadow"
                        : revealed
                          ? "bg-gray-50 border-gray-200 text-gray-400"
                          : p.hasVoted
                            ? "bg-blue-600 border-blue-700 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-300",
                    ].join(" ")}
                  >
                    <span className="absolute -top-2 -right-2 text-sm bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center">
                      {getAvatar(uid, avatarTheme)}
                    </span>
                    {revealed ? (p.vote ?? "–") : p.hasVoted ? "✓" : "·"}
                  </div>
                  <span className="text-xs text-gray-500 max-w-[56px] truncate text-center">
                    {p.name}
                    {uid === myUserId ? " (you)" : ""}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {revealed ? "revealed" : p.hasVoted ? "voted" : "waiting"}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={!canReveal}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {!hasStory
              ? "Set story first…"
              : !canReveal
              ? "Pick a card first…"
              : votedCount === totalCount && totalCount > 0
                ? "Everyone's voted! Ready to reveal? 👀"
                : `${votedCount}/${totalCount} voted — let's go! 🚀`}
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
                {PLANNING_POKER_CARDS.map((card) => (
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
                onClick={handleRevote}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors shrink-0"
              >
                Re-vote
              </button>
              <button
                onClick={handleNextStory}
                disabled={!currentStory.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                Next Story →
              </button>
              <span className="text-xs text-gray-500">
                {finalEstimate !== null
                  ? `Using selected: ${finalEstimate}`
                  : recommendedEstimate !== null
                    ? `Auto estimate (highest): ${recommendedEstimate}`
                    : "Select an estimate or reveal votes"}
              </span>
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
            <p className="text-xs text-gray-500 mt-1">
              Total pts: <strong>{totalPoints}</strong>
              {unresolvedStories > 0 ? ` · Unresolved: ${unresolvedStories}` : ""}
            </p>
          </div>
          <div className="overflow-y-auto max-h-[60vh] p-3 space-y-2">
            {stories.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 leading-relaxed">
                Completed stories<br />will appear here
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
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500">
                Total pts:{" "}
                <strong>{totalPoints}</strong>
              </p>
              <button
                onClick={() => {
                  const lines = [
                    `# Planning Poker Session`,
                    `Date: ${new Date().toLocaleDateString()}`,
                    `Session: ${sessionUrl}`,
                    ``,
                    `| Story | Estimate |`,
                    `|-------|----------|`,
                    ...stories.map((s) => `| ${s.name || "Untitled"} | ${s.estimate ?? "–"} |`),
                    ``,
                    `**Total points:** ${totalPoints}`,
                    unresolvedStories > 0 ? `**Unresolved:** ${unresolvedStories}` : "",
                  ].filter(Boolean);
                  navigator.clipboard.writeText(lines.join("\n")).catch(() => {
                    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `planning-poker-${sessionId}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Export Session
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Celebration moment */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationMoment
            message={celebrationMessage}
            emoji="🎯"
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
