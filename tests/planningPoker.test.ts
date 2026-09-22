import {
  appendStorySummary,
  deriveRecommendedEstimate,
  SKIP_DEFER_CARDS,
  resetVotes,
  upsertMyVote,
  upsertUnvoted,
  upsertVoted,
  type ParticipantState,
  type StorySummary,
} from "@/lib/planningPoker";

describe("planning poker utilities", () => {
  it("defaults to highest numeric estimate when revealed votes differ", () => {
    const estimate = deriveRecommendedEstimate([3, 8, 5, null, 2]);
    expect(estimate).toBe(8);
  });

  it("returns question mark when only uncertain votes exist", () => {
    const estimate = deriveRecommendedEstimate(["?", null, "?"]);
    expect(estimate).toBe("?");
  });

  it("returns null when no votes exist", () => {
    const estimate = deriveRecommendedEstimate([null, null]);
    expect(estimate).toBeNull();
  });

  it("includes potato in the skip/defer choices without adding it to estimates", () => {
    expect(SKIP_DEFER_CARDS).toContain("🥔");
    expect(deriveRecommendedEstimate(["🥔"])).toBeNull();
  });

  it("upserts voted participant if missing", () => {
    const participants: Record<string, ParticipantState> = {};
    const next = upsertVoted(participants, "u1", "Ahmed");

    expect(next.u1).toEqual({ name: "Ahmed", hasVoted: true, vote: null });
  });

  it("upserts unvoted participant if missing", () => {
    const participants: Record<string, ParticipantState> = {};
    const next = upsertUnvoted(participants, "u2", "Carl");

    expect(next.u2).toEqual({ name: "Carl", hasVoted: false, vote: null });
  });

  it("upserts revealed vote if participant was missing (late presence sync race)", () => {
    const participants: Record<string, ParticipantState> = {};
    const next = upsertMyVote(participants, "u3", 13, "Nina");

    expect(next.u3).toEqual({ name: "Nina", hasVoted: true, vote: 13 });
  });

  it("resets all votes for revote/next story", () => {
    const participants: Record<string, ParticipantState> = {
      u1: { name: "Ahmed", hasVoted: true, vote: 5 },
      u2: { name: "Carl", hasVoted: true, vote: "?" },
    };

    const next = resetVotes(participants);
    expect(next.u1).toEqual({ name: "Ahmed", hasVoted: false, vote: null });
    expect(next.u2).toEqual({ name: "Carl", hasVoted: false, vote: null });
  });

  it("appends estimated story and deduplicates exact duplicate entries", () => {
    let stories: StorySummary[] = [];

    stories = appendStorySummary(stories, "Story A", 8);
    stories = appendStorySummary(stories, "Story A", 8);

    expect(stories).toHaveLength(1);
    expect(stories[0]).toEqual({ name: "Story A", estimate: 8 });
  });

  it("does not append when estimate is null", () => {
    const stories: StorySummary[] = [];
    const next = appendStorySummary(stories, "Story B", null);

    expect(next).toHaveLength(0);
  });
});
