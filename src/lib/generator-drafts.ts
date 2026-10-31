import { z } from "zod";

export const textDraftSchema = z.string();

export const userStoryDraftSchema = z.object({
  featureDescription: z.string(),
  userType: z.string().default(""),
  storyType: z.enum(["feature", "improvement", "task"]).default("feature"),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  preset: z.enum(["product", "engineering", "api", "tech_debt"]).default("product"),
});

export const criteriaDraftSchema = z.object({
  featureDescription: z.string(),
  userType: z.string().default(""),
  format: z.enum(["gherkin", "checklist", "both"]).default("both"),
  preset: z.enum(["product", "engineering", "api", "tech_debt"]).default("product"),
});

export const qualityDraftSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(["Excellent", "Good", "Needs Work"]),
  criteria: z.array(z.object({ label: z.string(), met: z.boolean() })),
}).nullable();

export const standupDraftSchema = z.object({
  yesterday: z.string().default(""),
  today: z.string().default(""),
  blockers: z.string().default(""),
  context: z.string().default(""),
});

export const standupModeSchema = z.enum(["individual", "team"]);
export const standupFormatSchema = z.enum(["markdown", "jira"]);
export const memberIdSchema = z.number().int().positive();
export const standupMembersSchema = z.array(z.object({
  id: memberIdSchema,
  name: z.string(),
  yesterday: z.string().default(""),
  today: z.string().default(""),
  blockers: z.string().default(""),
})).min(1).refine(members => new Set(members.map(member => member.id)).size === members.length);
