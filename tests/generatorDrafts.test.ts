import {
  criteriaDraftSchema,
  memberIdSchema,
  qualityDraftSchema,
  standupDraftSchema,
  standupFormatSchema,
  standupMembersSchema,
  standupModeSchema,
  textDraftSchema,
  userStoryDraftSchema,
} from "@/lib/generator-drafts";

it("keeps older story drafts and fills missing optional settings", () => {
  expect(userStoryDraftSchema.parse({ featureDescription: "Save café orders ☕" })).toEqual({
    featureDescription: "Save café orders ☕", userType: "", storyType: "feature", priority: "Medium", preset: "product",
  });
  expect(criteriaDraftSchema.parse({ featureDescription: "Return field errors" }).format).toBe("both");
});

it("rejects valid JSON with an invalid form shape or unknown selection", () => {
  for (const value of [null, [], "notes", { featureDescription: 42 }, { featureDescription: "notes", preset: "unknown" }]) {
    expect(userStoryDraftSchema.safeParse(value).success).toBe(false);
    expect(criteriaDraftSchema.safeParse(value).success).toBe(false);
  }
  expect(userStoryDraftSchema.safeParse({ featureDescription: "notes", priority: "Urgent" }).success).toBe(false);
  expect(criteriaDraftSchema.safeParse({ featureDescription: "notes", format: "html" }).success).toBe(false);
});

it("only restores strings as generated output and free-text notes", () => {
  for (const value of [null, 42, {}, []]) expect(textDraftSchema.safeParse(value).success).toBe(false);
  expect(textDraftSchema.parse("# Story\n\n<notes> café ☕")).toBe("# Story\n\n<notes> café ☕");
});

it("rejects unusable scores and criteria before the UI renders them", () => {
  const quality = { score: 85, grade: "Excellent", criteria: [{ label: "Testable", met: true }] };
  expect(qualityDraftSchema.parse(quality)).toEqual(quality);
  expect(qualityDraftSchema.parse(null)).toBeNull();
  for (const value of [{ ...quality, score: 101 }, { ...quality, score: -1 }, { ...quality, grade: "Perfect" }, { ...quality, criteria: null }, { ...quality, criteria: [{ label: "Testable", met: "yes" }] }]) {
    expect(qualityDraftSchema.safeParse(value).success).toBe(false);
  }
});

it("preserves standup notes and supplies missing sections", () => {
  expect(standupDraftSchema.parse({ today: "Review API errors" })).toEqual({
    yesterday: "", today: "Review API errors", blockers: "", context: "",
  });
  expect(standupDraftSchema.safeParse({ today: null }).success).toBe(false);
});

it("rejects invalid team members, duplicate IDs, and empty teams", () => {
  const member = { id: 4, name: "Sam", today: "Review API errors" };
  expect(standupMembersSchema.parse([member])).toEqual([{ ...member, yesterday: "", blockers: "" }]);
  for (const value of [null, [], [null], [{ ...member, id: "4" }], [{ ...member, name: null }], [member, member]]) {
    expect(standupMembersSchema.safeParse(value).success).toBe(false);
  }
});

it("rejects unknown standup settings and unsafe member counters", () => {
  expect(standupModeSchema.safeParse("unknown").success).toBe(false);
  expect(standupFormatSchema.safeParse("html").success).toBe(false);
  for (const value of [0, -1, 1.5, "3", Number.MAX_SAFE_INTEGER + 1]) expect(memberIdSchema.safeParse(value).success).toBe(false);
});
