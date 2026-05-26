export const PLANNING_POKER_CARDS = [1, 2, 3, 5, 8, 13, 21, "?"] as const;

export type CardValue = (typeof PLANNING_POKER_CARDS)[number];
export type NumericCardValue = Exclude<CardValue, "?">;
export type Vote = CardValue | null;

export interface ParticipantState {
  name: string;
  hasVoted: boolean;
  vote: Vote;
}

export interface StorySummary {
  name: string;
  estimate: Vote;
}

export function deriveRecommendedEstimate(votes: Vote[]): Vote {
  const numericVotes = votes.filter(
    (v): v is NumericCardValue => typeof v === "number"
  );
  if (numericVotes.length === 0) return votes.includes("?") ? "?" : null;

  // Product decision: default to highest revealed numeric vote.
  return numericVotes.reduce((max, current) => (current > max ? current : max), numericVotes[0]);
}

export function upsertVoted(
  prev: Record<string, ParticipantState>,
  userId: string,
  name?: string
): Record<string, ParticipantState> {
  if (!userId) return prev;
  return {
    ...prev,
    [userId]: prev[userId]
      ? { ...prev[userId], hasVoted: true }
      : { name: name ?? "Participant", hasVoted: true, vote: null },
  };
}

export function upsertUnvoted(
  prev: Record<string, ParticipantState>,
  userId: string,
  name?: string
): Record<string, ParticipantState> {
  if (!userId) return prev;
  return {
    ...prev,
    [userId]: prev[userId]
      ? { ...prev[userId], hasVoted: false }
      : { name: name ?? "Participant", hasVoted: false, vote: null },
  };
}

export function upsertMyVote(
  prev: Record<string, ParticipantState>,
  userId: string,
  vote: Vote,
  name?: string
): Record<string, ParticipantState> {
  if (!userId) return prev;
  return {
    ...prev,
    [userId]: prev[userId]
      ? { ...prev[userId], vote }
      : { name: name ?? "Participant", hasVoted: vote !== null, vote },
  };
}

export function resetVotes(prev: Record<string, ParticipantState>): Record<string, ParticipantState> {
  const next: Record<string, ParticipantState> = {};
  for (const [k, p] of Object.entries(prev)) {
    next[k] = { ...p, hasVoted: false, vote: null };
  }
  return next;
}

export function appendStorySummary(
  prev: StorySummary[],
  story?: string,
  estimate?: Vote
): StorySummary[] {
  if (!story || estimate === null || typeof estimate === "undefined") return prev;
  const alreadyLogged = prev.some((item) => item.name === story && item.estimate === estimate);
  return alreadyLogged ? prev : [...prev, { name: story, estimate }];
}