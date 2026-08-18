export const STORY_POINT_FACTOR_KEYS = [
  "effort",
  "complexity",
  "uncertainty",
  "risk",
  "dependencies",
] as const;

export type StoryPointFactorKey = (typeof STORY_POINT_FACTOR_KEYS)[number];

export type StoryPointFactors = Record<StoryPointFactorKey, number>;

export interface StoryPointEstimate {
  estimate: number;
  label: "Small" | "Medium" | "Large" | "Split candidate";
  confidence: "High" | "Medium" | "Low" | "Very low";
  score: number;
  maxScore: 15;
  highFactors: StoryPointFactorKey[];
  nextActions: string[];
}

export function estimateStoryPoints(score: number): number {
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 7) return 3;
  if (score <= 10) return 5;
  if (score <= 13) return 8;
  if (score <= 16) return 13;
  return 21;
}

function getConfidence(score: number): StoryPointEstimate["confidence"] {
  if (score <= 4) return "High";
  if (score <= 9) return "Medium";
  if (score <= 13) return "Low";
  return "Very low";
}

function getEstimateLabel(estimate: number): StoryPointEstimate["label"] {
  if (estimate <= 2) return "Small";
  if (estimate <= 5) return "Medium";
  if (estimate <= 8) return "Large";
  return "Split candidate";
}

export function calculateStoryPointEstimate(factors: StoryPointFactors): StoryPointEstimate {
  const score = STORY_POINT_FACTOR_KEYS.reduce((sum, key) => sum + factors[key], 0);
  const estimate = estimateStoryPoints(score);
  const confidence = getConfidence(score);

  const nextActions = estimate >= 13
    ? [
        "Split the story into smaller user-visible slices.",
        "Convert unclear parts into acceptance criteria or a spike.",
        "Resolve dependencies before sprint commitment.",
      ]
    : confidence === "Low"
      ? [
          "Review unknowns with engineering and QA before planning.",
          "Confirm the rollback and test strategy.",
          "Use Planning Poker if estimates vary across the team.",
        ]
      : [
          "Confirm acceptance criteria and Definition of Done.",
          "Run Planning Poker if the estimate needs team agreement.",
          "Compare the estimate against sprint capacity before committing.",
        ];

  return {
    estimate,
    label: getEstimateLabel(estimate),
    confidence,
    score,
    maxScore: 15,
    highFactors: STORY_POINT_FACTOR_KEYS.filter((key) => factors[key] >= 2),
    nextActions,
  };
}

export interface SprintCapacityMember {
  name?: string;
  daysAvailable: number;
  velocity: number;
}

export interface SprintCapacityResult {
  maxCapacity: number;
  recommendedCapacity: number;
  sprintDays: number;
  totalAvailableDays: number;
  totalTeamDays: number;
  availabilityPercent: number;
  members: Array<SprintCapacityMember & { capacity: number }>;
}

export function calculateSprintCapacity(
  sprintDays: number,
  members: SprintCapacityMember[],
): SprintCapacityResult {
  const enrichedMembers = members.map((member) => ({
    ...member,
    capacity: Math.round(member.daysAvailable * member.velocity),
  }));
  const maxCapacity = enrichedMembers.reduce((sum, member) => sum + member.daysAvailable * member.velocity, 0);
  const totalAvailableDays = enrichedMembers.reduce((sum, member) => sum + member.daysAvailable, 0);
  const totalTeamDays = enrichedMembers.length * sprintDays;

  return {
    maxCapacity,
    recommendedCapacity: Math.round(maxCapacity * 0.8),
    sprintDays,
    totalAvailableDays,
    totalTeamDays,
    availabilityPercent: totalTeamDays > 0 ? Math.round((totalAvailableDays / totalTeamDays) * 100) : 0,
    members: enrichedMembers,
  };
}
