/**
 * Shared ticket quality scoring utility for AgileToolHub generators.
 * Provides consistent quality assessment across Bug Report, User Story, and Acceptance Criteria tools.
 */

export interface QualityCriterion {
  label: string;
  met: boolean;
}

export interface QualityResult {
  score: number;
  grade: "Excellent" | "Good" | "Needs Work";
  criteria: QualityCriterion[];
}

export type ToolType = "bug_report" | "user_story" | "acceptance_criteria";

/**
 * Extract markdown section content by heading.
 * Used by all quality scorers to parse generated output.
 */
export function getSectionValue(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s+${escaped}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = markdown.match(regex);
  return match?.[1]?.trim() ?? "";
}

/**
 * Grade score into Excellent/Good/Needs Work.
 */
export function gradeScore(score: number): QualityResult["grade"] {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  return "Needs Work";
}

/**
 * Score a bug report ticket based on practical readiness.
 * Evaluated criteria: title clarity, description depth, numbered steps, explicit expected/actual,
 * environment details, acceptance criteria presence.
 */
export function scoreBugReport(markdown: string): QualityResult {
  const title = getSectionValue(markdown, "Title").split("\n")[0]?.trim() ?? "";
  const description = getSectionValue(markdown, "Description");
  const stepsText = getSectionValue(markdown, "Steps to Reproduce");
  const expected = getSectionValue(markdown, "Expected Result");
  const actual = getSectionValue(markdown, "Actual Result");
  const environment = getSectionValue(markdown, "Environment");
  const acceptanceCriteria = getSectionValue(markdown, "Acceptance Criteria");

  const stepCount = stepsText
    .split("\n")
    .filter((line) => /^\d+[.)]\s+/.test(line.trim())).length;

  const specifiedEnvCount = environment
    .split("\n")
    .filter((line) => line.includes(":"))
    .map((line) => line.split(":").slice(1).join(":").trim().toLowerCase())
    .filter((value) => value && value !== "not specified").length;

  const criteria: QualityCriterion[] = [
    { label: "Clear, concise title", met: title.length >= 8 && title.length <= 90 },
    { label: "Detailed description", met: description.length >= 40 },
    { label: "Repro steps are numbered", met: stepCount >= 3 },
    { label: "Expected result is explicit", met: expected.length >= 15 },
    { label: "Actual result is explicit", met: actual.length >= 15 },
    { label: "Environment details included", met: specifiedEnvCount >= 2 },
    { label: "Acceptance criteria included", met: acceptanceCriteria.includes("[ ]") || acceptanceCriteria.includes("- [") },
  ];

  const metCount = criteria.filter((item) => item.met).length;
  const score = Math.round((metCount / criteria.length) * 100);

  return { score, grade: gradeScore(score), criteria };
}

/**
 * Score a user story based on practical readiness.
 * Evaluated criteria: clear actor, explicit business value, testable AC, scope boundaries,
 * dependencies, clarifications section, measurable outcome signal.
 */
export function scoreUserStory(markdown: string, hasMeasurableOutcome: boolean, dependencies: string[]): QualityResult {
  const normalized = markdown.toLowerCase();

  const criteria: QualityCriterion[] = [
    { label: "Clear actor in user story", met: /as a\s+[^\n,]+/i.test(markdown) },
    { label: "Explicit business value", met: /so that\s+[^\n]+/i.test(markdown) },
    { label: "At least 4 acceptance criteria", met: (markdown.match(/- \[ \]/g) ?? []).length >= 4 },
    { label: "Scope boundaries included", met: normalized.includes("## out of scope") },
    { label: "Dependencies captured", met: dependencies.length > 0 || normalized.includes("## dependencies") },
    { label: "Clarifications section included", met: normalized.includes("## clarifications needed") },
    { label: "Measurable outcome signal", met: hasMeasurableOutcome || /kpi|metric|latency|conversion|error rate/i.test(markdown) },
  ];

  const metCount = criteria.filter((item) => item.met).length;
  const score = Math.round((metCount / criteria.length) * 100);

  return { score, grade: gradeScore(score), criteria };
}

/**
 * Score acceptance criteria based on practical readiness.
 * Evaluated criteria: clear user/actor, action and outcome specified, gherkin scenarios,
 * checklist depth, error handling, constraints, clarifications, measurable signal.
 */
export function scoreAcceptanceCriteria(
  markdown: string,
  format: "gherkin" | "checklist" | "both",
  hasUser: boolean,
  clarifications: string[],
  hasMeasurableSignal: boolean
): QualityResult {
  const criteria: QualityCriterion[] = [
    { label: "Clear user/actor defined", met: hasUser },
    { label: "Action and expected outcome specified", met: /when|then/i.test(markdown) },
    {
      label: "Gherkin scenarios included",
      met: format === "checklist" || /Given[\s\S]*When[\s\S]*Then/i.test(markdown),
    },
    {
      label: "Checklist depth included",
      met: format === "gherkin" || (markdown.match(/- \[ \]/g) ?? []).length >= 8,
    },
    {
      label: "Error handling covered",
      met: /error|validation|fails gracefully|unexpected condition/i.test(markdown),
    },
    {
      label: "Constraints captured",
      met: markdown.includes("Business constraints from input"),
    },
    {
      label: "Clarifications section included",
      met: markdown.includes("## Clarifications Needed"),
    },
    {
      label: "Measurable signal present",
      met: hasMeasurableSignal || /under\s+\d+|latency|kpi|metric|percent|%/i.test(markdown),
    },
  ];

  const metCount = criteria.filter((item) => item.met).length;
  const score = Math.round((metCount / criteria.length) * 100);

  return { score, grade: gradeScore(score), criteria };
}

/**
 * Generic scorer for any tool type. Dispatches to the appropriate tool-specific scorer.
 */
export function scoreTicket(
  toolType: ToolType,
  markdown: string,
  context?: {
    hasMeasurableOutcome?: boolean;
    dependencies?: string[];
    format?: "gherkin" | "checklist" | "both";
    hasUser?: boolean;
    clarifications?: string[];
    hasMeasurableSignal?: boolean;
  }
): QualityResult {
  if (toolType === "bug_report") {
    return scoreBugReport(markdown);
  }

  if (toolType === "user_story") {
    return scoreUserStory(
      markdown,
      context?.hasMeasurableOutcome ?? false,
      context?.dependencies ?? []
    );
  }

  if (toolType === "acceptance_criteria") {
    return scoreAcceptanceCriteria(
      markdown,
      context?.format ?? "both",
      context?.hasUser ?? false,
      context?.clarifications ?? [],
      context?.hasMeasurableSignal ?? false
    );
  }

  // Fallback for unknown tool type
  return {
    score: 0,
    grade: "Needs Work",
    criteria: [{ label: "Unknown tool type", met: false }],
  };
}
