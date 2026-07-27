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
const SEAT_ACCENTS = [
  {
    avatar: "border-blue-100 bg-blue-50 text-blue-700",
    rail: "bg-blue-500",
    voted: "from-blue-500 to-indigo-600 border-blue-700",
  },
  {
    avatar: "border-rose-100 bg-rose-50 text-rose-700",
    rail: "bg-rose-500",
    voted: "from-rose-500 to-orange-500 border-rose-700",
  },
  {
    avatar: "border-amber-100 bg-amber-50 text-amber-800",
    rail: "bg-amber-500",
    voted: "from-amber-400 to-yellow-500 border-amber-600",
  },
  {
    avatar: "border-violet-100 bg-violet-50 text-violet-700",
    rail: "bg-violet-500",
    voted: "from-violet-500 to-fuchsia-600 border-violet-700",
  },
  {
    avatar: "border-cyan-100 bg-cyan-50 text-cyan-700",
    rail: "bg-cyan-500",
    voted: "from-cyan-500 to-teal-600 border-cyan-700",
  },
] as const;
const NUDGE_MESSAGES = [
  "Hurry up! Sleeping or what? 😴",
  "Your card is waiting... no pressure, only the whole team 😄",
  "Plot twist: we're waiting for your vote 👀",
  "One tiny click for you, one giant step for this sprint 🚀",
  "Wake up, estimator! The backlog needs you ⚡",
] as const;
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

function getSeatPosition(index: number, total: number, centerX: number, centerY: number, radiusX: number, radiusY: number) {
  if (total === 1) {
    return { x: centerX, y: centerY - Math.max(radiusY, 38) };
  }

  const safeTotal = Math.max(total, 1);
  // For 2 players, left/right seating feels more natural than top/bottom.
  const startAngle = safeTotal === 2 ? 0 : -Math.PI / 2;
  const angle = startAngle + ((2 * Math.PI * index) / safeTotal);
  return {
    x: centerX + Math.cos(angle) * radiusX,
    y: centerY + Math.sin(angle) * radiusY,
  };
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSeatingProfile(total: number) {
  const safeTotal = Math.max(total, 1);

  if (safeTotal === 1) {
    return {
      centerY: 52,
      radiusX: 0,
      radiusY: 38,
      outward: 11,
      tableWidth: 60,
      tableHeight: 44,
      innerWidth: 52,
      innerHeight: 36,
      compactSeats: false,
      compactMeta: false,
      containerClass: "h-[420px] sm:h-[470px]",
      hint: "Solo mode",
    };
  }

  if (safeTotal === 2) {
    return {
      centerY: 52,
      radiusX: 42,
      radiusY: 0,
      outward: 10,
      tableWidth: 60,
      tableHeight: 44,
      innerWidth: 52,
      innerHeight: 36,
      compactSeats: false,
      compactMeta: false,
      containerClass: "h-[430px] sm:h-[480px]",
      hint: "Face-off mode",
    };
  }

  if (safeTotal <= 4) {
    return {
      centerY: 52,
      radiusX: 45,
      radiusY: 36,
      outward: 9,
      tableWidth: 64,
      tableHeight: 46,
      innerWidth: 56,
      innerHeight: 38,
      compactSeats: false,
      compactMeta: false,
      containerClass: "h-[430px] sm:h-[480px]",
      hint: null,
    };
  }

  if (safeTotal <= 6) {
    return {
      centerY: 52,
      radiusX: 46,
      radiusY: 38,
      outward: 8,
      tableWidth: 66,
      tableHeight: 48,
      innerWidth: 58,
      innerHeight: 40,
      compactSeats: false,
      compactMeta: false,
      containerClass: "h-[440px] sm:h-[495px]",
      hint: null,
    };
  }

  if (safeTotal <= 8) {
    return {
      centerY: 52,
      radiusX: 47,
      radiusY: 40,
      outward: 7,
      tableWidth: 67,
      tableHeight: 49,
      innerWidth: 59,
      innerHeight: 41,
      compactSeats: false,
      compactMeta: false,
      containerClass: "h-[450px] sm:h-[510px]",
      hint: null,
    };
  }

  if (safeTotal <= 10) {
    return {
      centerY: 53,
      radiusX: 47,
      radiusY: 42,
      outward: 5,
      tableWidth: 62,
      tableHeight: 44,
      innerWidth: 54,
      innerHeight: 36,
      compactSeats: true,
      compactMeta: true,
      containerClass: "h-[470px] sm:h-[540px]",
      hint: `Dense mode (${safeTotal} players)`,
    };
  }

  return {
    centerY: 53,
    radiusX: 48,
    radiusY: 43,
    outward: 4,
    tableWidth: 60,
    tableHeight: 42,
    innerWidth: 52,
    innerHeight: 34,
    compactSeats: true,
    compactMeta: true,
    containerClass: "h-[490px] sm:h-[560px]",
    hint: `High density (${safeTotal} players)`,
  };
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
  const sessionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tools/planning-poker/${sessionId}`
      : `https://agiletoolhub.com/tools/planning-poker/${sessionId}`;
  const shortSessionId =
    sessionId.length > 16
      ? `${sessionId.slice(0, 8)}...${sessionId.slice(-6)}`
      : sessionId;
  const inviteDisplayUrl =
    typeof window !== "undefined"
      ? `${window.location.host}/tools/planning-poker/${shortSessionId}`
      : `agiletoolhub.com/tools/planning-poker/${shortSessionId}`;
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [nudgeNotice, setNudgeNotice] = useState<{ fromName: string; targetName: string; targetId: string; message: string } | null>(null);
  const [nudgedUserId, setNudgedUserId] = useState<string | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("pp_sound_enabled");
    return saved === null ? true : saved === "true";
  });
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
  const nudgeResetTimerRef = useRef<number | null>(null);
  const nudgeNoticeTimerRef = useRef<number | null>(null);
  const nudgeMessageIndexRef = useRef(0);
  const revealCountdownTimerRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => { myVoteRef.current = myVote; }, [myVote]);
  useEffect(() => { currentStoryRef.current = currentStory; }, [currentStory]);
  useEffect(() => { revealedRef.current = revealed; }, [revealed]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    localStorage.setItem("pp_sound_enabled", String(soundEnabled));
  }, [soundEnabled]);

  const playUiSound = useCallback((kind: "nudge" | "reveal") => {
    if (!soundEnabledRef.current || typeof window === "undefined") return;
    try {
      type WebkitAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const audioWindow = window as WebkitAudioWindow;
      const AudioCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
      if (!AudioCtor) return;

      const audioContext = new AudioCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (kind === "nudge") {
        oscillator.frequency.value = 720;
        gainNode.gain.setValueAtTime(0.16, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.14);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.14);
      } else {
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.22, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.22);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.22);
      }
    } catch {
      // Silent fallback if audio is blocked.
    }
  }, []);

  const clearRevealCountdownTimer = useCallback(() => {
    if (revealCountdownTimerRef.current !== null) {
      window.clearInterval(revealCountdownTimerRef.current);
      revealCountdownTimerRef.current = null;
    }
  }, []);

  const revealCards = useCallback(() => {
    if (revealedRef.current) return;

    clearRevealCountdownTimer();
    setRevealCountdown(null);
    revealedRef.current = true;
    setRevealed(true);
    playUiSound("reveal");
    channelRef.current?.send({
      type: "broadcast",
      event: "my_vote",
      payload: {
        userId: userIdRef.current,
        vote: myVoteRef.current,
        name: myNameRef.current,
      },
    });
  }, [clearRevealCountdownTimer, playUiSound]);

  const startRevealCountdown = useCallback(
    (startedAtMs: number, durationSeconds: number, initiatorId: string) => {
      clearRevealCountdownTimer();

      const tick = () => {
        const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
        const remaining = Math.max(0, durationSeconds - elapsed);

        if (remaining <= 0) {
          setRevealCountdown(null);
          clearRevealCountdownTimer();
          if (initiatorId === userIdRef.current) {
            revealCards();
            channelRef.current?.send({ type: "broadcast", event: "reveal", payload: {} });
          }
          return;
        }

        setRevealCountdown(remaining);
      };

      tick();
      revealCountdownTimerRef.current = window.setInterval(tick, 200);
    },
    [clearRevealCountdownTimer, revealCards],
  );

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
        // Starts a synchronized 3..2..1 reveal countdown.
        .on("broadcast", { event: "reveal_countdown" }, ({ payload }) => {
          const { startedAtMs, durationSeconds, initiatorId } = payload as {
            startedAtMs?: number;
            durationSeconds?: number;
            initiatorId?: string;
          };
          if (!startedAtMs || !durationSeconds || !initiatorId || revealedRef.current) return;
          startRevealCountdown(startedAtMs, durationSeconds, initiatorId);
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
          revealCards();
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
        // Teammate sends a nudge to a specific participant to vote.
        .on("broadcast", { event: "nudge" }, ({ payload }) => {
          const { targetId, fromName } = payload as {
            targetId?: string;
            fromName?: string;
            targetName?: string;
            message?: string;
          };
          if (!targetId) return;

          setNudgedUserId(targetId);
          if (nudgeResetTimerRef.current !== null) {
            window.clearTimeout(nudgeResetTimerRef.current);
          }
          nudgeResetTimerRef.current = window.setTimeout(() => {
            setNudgedUserId((prev) => (prev === targetId ? null : prev));
          }, 3500);

          setNudgeNotice({
            fromName: fromName ?? "A teammate",
            targetName: payload.targetName ?? "teammate",
            targetId,
            message: payload.message ?? "Hurry up! Sleeping or what? 😴",
          });
          if (nudgeNoticeTimerRef.current !== null) {
            window.clearTimeout(nudgeNoticeTimerRef.current);
          }
          nudgeNoticeTimerRef.current = window.setTimeout(() => {
            setNudgeNotice(null);
          }, 4500);

          if (targetId === userIdRef.current) {
            playUiSound("nudge");
          }
        })
        // Next round — resets all state for everyone
        .on("broadcast", { event: "next_story" }, ({ payload }) => {
          const story = payload.story as string | undefined;
          const estimate = payload.estimate as Vote;
          setStories((prev) => appendStorySummary(prev, story, estimate));
          revealedRef.current = false;
          setRevealed(false);
          setMyVote(null);
          myVoteRef.current = null;
          setCurrentStory("");
          setStoryInput("");
          setRevealCountdown(null);
          setFinalEstimate(null);
          setParticipants((prev) => resetVotes(prev));
        })
        // Re-vote for same story
        .on("broadcast", { event: "revote" }, () => {
          revealedRef.current = false;
          setRevealed(false);
          setMyVote(null);
          myVoteRef.current = null;
          setRevealCountdown(null);
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
    [playUiSound, revealCards, sessionId, startRevealCountdown],
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

  useEffect(() => () => {
    channelRef.current?.unsubscribe();
    clearRevealCountdownTimer();
    if (nudgeResetTimerRef.current !== null) window.clearTimeout(nudgeResetTimerRef.current);
    if (nudgeNoticeTimerRef.current !== null) window.clearTimeout(nudgeNoticeTimerRef.current);
  }, [clearRevealCountdownTimer]);

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
      setParticipants((prev) => upsertVoted(prev, userIdRef.current, myNameRef.current));
      channelRef.current?.send({
        type: "broadcast",
        event: "voted",
        payload: { userId: userIdRef.current, name: myNameRef.current },
      });
    } else if (!isVoted && wasVoted) {
      setParticipants((prev) => upsertUnvoted(prev, userIdRef.current, myNameRef.current));
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
    setCurrentStory(name);
    currentStoryRef.current = name;
    setStoryInput(name);
    // self:true — we receive this back ourselves and update currentStory uniformly
    channelRef.current?.send({ type: "broadcast", event: "story", payload: { name } });
  };

  const handleReveal = () => {
    if (!currentStory.trim() || revealCountdown !== null) return;
    const startedAtMs = Date.now();
    const durationSeconds = 3;
    startRevealCountdown(startedAtMs, durationSeconds, userIdRef.current);
    channelRef.current?.send({
      type: "broadcast",
      event: "reveal_countdown",
      payload: {
        startedAtMs,
        durationSeconds,
        initiatorId: userIdRef.current,
      },
    });
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

  const handleNudge = (targetId: string) => {
    if (!targetId || targetId === userIdRef.current || revealed || !hasStory) return;
    const message = NUDGE_MESSAGES[nudgeMessageIndexRef.current % NUDGE_MESSAGES.length];
    nudgeMessageIndexRef.current += 1;
    const targetName = participants[targetId]?.name || "teammate";
    channelRef.current?.send({
      type: "broadcast",
      event: "nudge",
      payload: {
        targetId,
        fromName: myNameRef.current || "A teammate",
        targetName,
        message,
      },
    });
  };

  const participantList = Object.entries(participants);
  const votedCount = participantList.filter(([, p]) => p.hasVoted).length;
  const totalCount = participantList.length;
  const seatingProfile = getSeatingProfile(totalCount);
  const isDenseLayout = totalCount > 8;
  const mySeatSourceIndex = participantList.findIndex(([uid]) => uid === myUserId);
  const targetSeatIndex = totalCount >= 3 ? Math.floor(totalCount / 2) : 0;
  const seatList = totalCount >= 3 && mySeatSourceIndex >= 0
    ? participantList.map((_, seatIndex) => {
        const sourceIndex = (seatIndex + mySeatSourceIndex - targetSeatIndex + totalCount) % totalCount;
        return participantList[sourceIndex];
      })
    : participantList;
  const hasStory = currentStory.trim().length > 0;
  const canReveal = hasStory && (myVote !== null || votedCount > 0);
  const recommendedEstimate = deriveRecommendedEstimate(participantList.map(([, p]) => p.vote));
  const voteProgress = totalCount === 0 ? 0 : Math.round((votedCount / totalCount) * 100);
  const tableStatusLabel =
    revealCountdown !== null
      ? "Reveal countdown"
      : revealed
        ? "Cards revealed"
        : !hasStory
          ? "Waiting for story"
          : votedCount === totalCount && totalCount > 0
            ? "Ready to reveal"
            : "Voting in progress";
  const tableStatusShortLabel =
    revealCountdown !== null
      ? "Countdown"
      : revealed
        ? "Revealed"
        : !hasStory
          ? "Story needed"
          : votedCount === totalCount && totalCount > 0
            ? "Ready"
            : "Voting";
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
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Invite bar */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
          <span className="text-blue-700 font-medium shrink-0">Invite:</span>
          <span title={sessionUrl} className="text-blue-600 flex-1 min-w-0 truncate font-mono text-xs">{inviteDisplayUrl}</span>
          <CopyButton text={sessionUrl} label="Copy Invite" eventName="invite_copy" eventParams={{ tool: "planning_poker" }} />
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

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={[
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              soundEnabled
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100",
            ].join(" ")}
          >
            {soundEnabled ? "🔔 Sound: On" : "🔕 Sound: Off"}
          </button>
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
          <div className="mb-3 flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Team — {votedCount}/{totalCount} voted
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">{tableStatusLabel}</p>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
          {participantList.length === 0 ? (
            <p className="text-sm text-gray-400">Waiting for teammates to join…</p>
          ) : (
            <motion.div
              className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-[radial-gradient(circle_at_50%_42%,#f7fffb_0%,#ecfdf5_42%,#dff7ec_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_50px_rgba(15,118,110,0.12)]"
              variants={ANIMATION_VARIANTS.fadeInUp}
              initial="initial"
              animate={animationsEnabled ? "animate" : false}
              transition={{ duration: DURATIONS.normal / 1000 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">Current table</p>
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {currentStory || "Set a story to start voting"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {seatingProfile.hint && (
                    <span className="hidden rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 sm:inline-flex">
                      {seatingProfile.hint}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-bold text-white">
                    {voteProgress}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${voteProgress}%` }}
                />
              </div>

              <div className={["relative mx-auto mt-4 w-full max-w-[760px] overflow-visible", seatingProfile.containerClass].join(" ")}>
                <div className="absolute inset-x-4 top-1/2 h-20 -translate-y-1/2 rounded-full bg-emerald-950/10 blur-2xl" />
                {/* Poker table */}
                <div
                  className="absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[9999px] border-[12px] border-amber-900 bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-950 shadow-[inset_0_22px_42px_rgba(255,255,255,0.12),inset_0_-18px_30px_rgba(0,0,0,0.18),0_30px_42px_rgba(15,23,42,0.24)]"
                  style={{
                    top: `${seatingProfile.centerY}%`,
                    width: `${seatingProfile.tableWidth}%`,
                    height: `${seatingProfile.tableHeight}%`,
                  }}
                />
                <div
                  className="absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[9999px] border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.14),transparent_42%)]"
                  style={{
                    top: `${seatingProfile.centerY}%`,
                    width: `${seatingProfile.innerWidth}%`,
                    height: `${seatingProfile.innerHeight}%`,
                  }}
                />
                <div
                  className="absolute left-1/2 z-0 h-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/15"
                  style={{
                    top: `${seatingProfile.centerY}%`,
                    width: `${Math.max(seatingProfile.innerWidth - 12, 28)}%`,
                  }}
                />
                <div
                  className="absolute left-1/2 z-0 h-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/10"
                  style={{
                    top: `${seatingProfile.centerY}%`,
                    width: `${Math.max(seatingProfile.innerWidth - 24, 18)}%`,
                  }}
                />
                <div
                  className="absolute left-[34%] z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-100 text-xs font-black text-amber-900 shadow"
                  style={{ top: `calc(${seatingProfile.centerY}% - ${seatingProfile.tableHeight / 2}% + 16px)` }}
                  title="Dealer"
                >
                  D
                </div>
                <div
                  className="absolute left-[18%] z-10 h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow-md"
                  style={{ top: `calc(${seatingProfile.centerY}% + ${seatingProfile.tableHeight / 2}% - 32px)` }}
                />
                <div
                  className="absolute left-[21%] z-10 h-5 w-5 rounded-full border-2 border-white bg-rose-500 shadow-md"
                  style={{ top: `calc(${seatingProfile.centerY}% + ${seatingProfile.tableHeight / 2}% - 24px)` }}
                />
                <div
                  className="absolute right-[19%] z-10 h-5 w-5 rounded-full border-2 border-white bg-yellow-400 shadow-md"
                  style={{ top: `calc(${seatingProfile.centerY}% - ${seatingProfile.tableHeight / 2}% + 36px)` }}
                />

                {/* Chairs around the table */}
                {seatList.map(([uid, p], index) => {
                  const isMe = uid === myUserId;
                  const seatAccent = SEAT_ACCENTS[index % SEAT_ACCENTS.length];
                  const seatStatus = revealed ? "revealed" : p.hasVoted ? "voted" : "waiting";
                  const centerX = 50;
                  const seat = getSeatPosition(
                    index,
                    participantList.length,
                    centerX,
                    seatingProfile.centerY,
                    seatingProfile.radiusX,
                    seatingProfile.radiusY,
                  );
                  const vx = seat.x - centerX;
                  const vy = seat.y - seatingProfile.centerY;
                  const vlen = Math.hypot(vx, vy) || 1;
                  const outwardX = vx / vlen;
                  const outwardY = vy / vlen;
                  const tangentX = -outwardY;
                  const tangentY = outwardX;
                  const ringBoost = isDenseLayout ? (index % 2 === 0 ? 3 : -2) : 0;
                  const tangentShift = isDenseLayout ? (index % 2 === 0 ? 1.8 : -1.8) : 0;
                  // In 2-player mode, pull slightly inward to avoid edge clipping on small viewports.
                  const outwardFactor = totalCount === 2 ? -0.75 : 1;
                  const rawX = seat.x + outwardX * (seatingProfile.outward + ringBoost) * outwardFactor + tangentX * tangentShift;
                  const rawY = seat.y + outwardY * (seatingProfile.outward + ringBoost) * outwardFactor + tangentY * tangentShift;
                  const bounds = totalCount === 2
                    ? { minX: 12, maxX: 88, minY: 22, maxY: 88 }
                    : isDenseLayout
                      ? { minX: 7, maxX: 93, minY: 10, maxY: 92 }
                      : { minX: 6, maxX: 94, minY: 10, maxY: 92 };
                  const posX = clampPercent(rawX, bounds.minX, bounds.maxX);
                  const posY = clampPercent(rawY, bounds.minY, bounds.maxY);
                  const placeMetaAbove = posY < seatingProfile.centerY - 10;
                  const playerMeta = (
                    <>
                      {nudgeNotice && nudgeNotice.targetId === uid && (
                        <span className={["rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 font-semibold text-amber-900 shadow-sm", seatingProfile.compactSeats ? "text-[9px]" : "text-[10px]"].join(" ")}>
                          nudged by {nudgeNotice.fromName}
                        </span>
                      )}
                      <span
                        title={p.name}
                        className={[
                          "truncate rounded-full bg-white/85 px-2 py-0.5 text-center font-semibold text-gray-800 shadow-sm",
                          isMe ? "ring-2 ring-blue-200" : "",
                          seatingProfile.compactSeats ? "max-w-[78px] text-[10px] leading-tight" : "max-w-[120px] text-xs",
                        ].join(" ")}
                      >
                        {p.name}{isMe ? " (you)" : ""}
                      </span>
                      {!seatingProfile.compactMeta && (
                        <span className="rounded-full bg-white/60 px-1.5 text-[10px] font-medium text-gray-500">
                          {seatStatus}
                        </span>
                      )}
                      {!revealed && hasStory && !isMe && !p.hasVoted && (
                        <button
                          type="button"
                          aria-label={`Nudge ${p.name} to vote`}
                          onClick={() => handleNudge(uid)}
                          className={[
                            "rounded-full border border-amber-300 bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100",
                            seatingProfile.compactSeats ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
                          ].join(" ")}
                        >
                          Nudge
                        </button>
                      )}
                    </>
                  );
                  return (
                    <motion.div
                      key={uid}
                      variants={STAGGER_ITEM}
                      initial="initial"
                      animate={animationsEnabled ? "animate" : false}
                      className="absolute z-10"
                      style={{ left: `${posX}%`, top: `${posY}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <div className={["relative flex flex-col items-center", isDenseLayout ? "gap-0.5" : "gap-1.5"].join(" ")}>
                        <div className="absolute top-8 h-16 w-20 rounded-full bg-slate-900/10 blur-xl" />
                        {placeMetaAbove && (
                          <div className={["relative z-20 flex flex-col items-center", isDenseLayout ? "gap-0.5" : "gap-1"].join(" ")}>
                            {playerMeta}
                          </div>
                        )}
                        <div
                          className={[
                            "rounded-t-full border border-slate-300/80 bg-gradient-to-b from-slate-100 to-slate-300 shadow-sm",
                            seatingProfile.compactSeats ? "h-2 w-14" : "h-2.5 w-[72px]",
                          ].join(" ")}
                        />
                        <div
                          className={[
                            "relative flex items-center justify-center rounded-xl border-2 font-black shadow-lg transition-all",
                            seatingProfile.compactSeats ? "h-14 w-11 text-base" : "h-[70px] w-14 text-lg",
                            nudgedUserId === uid ? "ring-4 ring-amber-300 ring-offset-2 ring-offset-emerald-50" : "",
                            revealed && p.vote !== null
                              ? "border-emerald-400 bg-white text-gray-950 shadow-emerald-900/10"
                              : revealed
                                ? "border-gray-200 bg-gray-50 text-gray-400"
                                : p.hasVoted
                                  ? `bg-gradient-to-br text-white ${seatAccent.voted}`
                                  : "border-gray-200 bg-white text-gray-300",
                          ].join(" ")}
                        >
                          <span className={["absolute left-2 top-2 h-1.5 w-7 rounded-full", seatAccent.rail].join(" ")} />
                          <span className={["absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border text-sm shadow", seatAccent.avatar].join(" ")}>
                            {getAvatar(uid, avatarTheme)}
                          </span>
                          <span>{revealed ? (p.vote ?? "–") : p.hasVoted ? "✓" : "·"}</span>
                          {!revealed && p.hasVoted && (
                            <span className="absolute bottom-1 h-1 w-8 rounded-full bg-white/45" />
                          )}
                        </div>
                        {!placeMetaAbove && (
                          <div className={["relative z-20 flex flex-col items-center", isDenseLayout ? "gap-0.5" : "gap-1"].join(" ")}>
                            {playerMeta}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Center content */}
                <div className="pointer-events-none absolute left-1/2 z-20 w-[62%] -translate-x-1/2 -translate-y-1/2 px-4 text-center" style={{ top: `${seatingProfile.centerY}%` }}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-100/90">Planning Table</p>
                  <p className="mt-1 truncate text-sm font-black text-white drop-shadow-sm sm:text-lg">
                    {currentStory || "Set a story to start voting"}
                  </p>
                  <div className="mx-auto mt-3 flex max-w-[220px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-50 sm:gap-2 sm:px-3 sm:text-xs">
                    <span className="sm:hidden">{votedCount}/{totalCount}</span>
                    <span className="hidden sm:inline">{votedCount}/{totalCount} voted</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-200" />
                    <span className="sm:hidden">{tableStatusShortLabel}</span>
                    <span className="hidden sm:inline">{tableStatusLabel}</span>
                  </div>
                  {revealCountdown !== null && (
                    <div className="mt-3 inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-200 bg-white text-3xl font-black text-emerald-900 shadow-xl">
                      {revealCountdown}
                    </div>
                  )}
                  {nudgeNotice && (
                    <div className="pointer-events-auto mt-3 inline-block rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 shadow-sm">
                      <strong>{nudgeNotice.fromName}</strong> nudged <strong>{nudgeNotice.targetName}</strong>: {nudgeNotice.message}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={!canReveal || revealCountdown !== null}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-900/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {!hasStory
              ? "Set story first…"
              : !canReveal
              ? "Pick a card first…"
              : revealCountdown !== null
                ? `Revealing in ${revealCountdown}…`
              : votedCount === totalCount && totalCount > 0
                ? "Everyone's voted! Ready to reveal? 👀"
                : `${votedCount}/${totalCount} voted — let's go! 🚀`}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Results</p>
                  <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                    {currentStory || "Current story"}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Suggested</p>
                  <p className="text-xl font-black text-emerald-950">{recommendedEstimate ?? "–"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {participantList.map(([uid, p], index) => {
                  const isMe = uid === myUserId;
                  const seatAccent = SEAT_ACCENTS[index % SEAT_ACCENTS.length];
                  return (
                    <div key={uid} className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base shadow-sm", seatAccent.avatar].join(" ")}>
                          {getAvatar(uid, avatarTheme)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {p.name}{isMe ? " (you)" : ""}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">revealed</p>
                        </div>
                      </div>
                      <div className="flex h-16 items-center justify-center rounded-lg border border-white bg-white text-3xl font-black text-gray-950 shadow-sm">
                        {p.vote ?? "–"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-800">Final estimate</span>
                <span className="text-xs text-gray-500">
                  {finalEstimate !== null
                    ? `Selected: ${finalEstimate}`
                    : recommendedEstimate !== null
                      ? `Suggested: ${recommendedEstimate}`
                      : "Choose an estimate"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PLANNING_POKER_CARDS.map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setFinalEstimate(finalEstimate === card ? null : card)}
                    className={[
                      "min-w-10 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                      finalEstimate === card
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    {card}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRevote}
                  className="shrink-0 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Re-vote
                </button>
                <button
                  type="button"
                  onClick={handleNextStory}
                  disabled={!currentStory.trim()}
                  className="shrink-0 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next Story →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="w-full shrink-0 xl:w-64">
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
