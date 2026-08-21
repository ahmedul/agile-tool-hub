import { scoreAcceptanceCriteria, scoreUserStory, type QualityResult } from "@/lib/ticketQuality";

export const CONTENT_TOOL_PRESETS = ["product", "engineering", "api", "tech_debt"] as const;
export type ContentToolPreset = (typeof CONTENT_TOOL_PRESETS)[number];
export type AcceptanceCriteriaFormat = "gherkin" | "checklist" | "both";
export type StoryType = "feature" | "improvement" | "task";
export type StoryPriority = "High" | "Medium" | "Low";

export interface UserStoryInput {
  feature: string;
  user?: string;
  storyType?: StoryType;
  priority?: StoryPriority;
  preset?: ContentToolPreset;
}

export interface AcceptanceCriteriaInput {
  story: string;
  user?: string;
  format?: AcceptanceCriteriaFormat;
  preset?: ContentToolPreset;
}

interface ParsedStory {
  user: string;
  goal: string;
  benefit: string;
  constraints: string[];
  dependencies: string[];
  clarifications: string[];
  hasMeasurableOutcome: boolean;
}

function clean(value: string, fallback: string): string {
  const result = value.trim().replace(/^['"`]+|['"`]+$/g, "").replace(/\s+/g, " ");
  return result || fallback;
}

function firstLine(input: string): string {
  return input.split("\n").map((line) => line.trim()).find(Boolean) ?? "complete the workflow";
}

function parseStory(input: string, userInput = ""): ParsedStory {
  const normalized = input.replace(/\s+/g, " ").trim();
  const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
  const user = normalized.match(/\bas an?\s+([^,.;]+)/i)?.[1]
    ?? normalized.match(/\bfor\s+([^,.;]+?)\s+(?:to|who|when)/i)?.[1]
    ?? userInput;
  const goal = normalized.match(/\bi want to\s+([^.;]+)/i)?.[1]
    ?? normalized.match(/\bneed to\s+([^.;]+)/i)?.[1]
    ?? normalized.match(/\bshould be able to\s+([^.;]+)/i)?.[1]
    ?? firstLine(input);
  const benefit = normalized.match(/\bso that\s+([^.;]+)/i)?.[1]
    ?? normalized.match(/\bbecause\s+([^.;]+)/i)?.[1]
    ?? "the user can complete the job faster with fewer errors";
  const constraints = lines.filter((line) => /(must|cannot|can't|within|without|except|limit|only if|must not)/i.test(line)).slice(0, 4);
  const dependencies = lines.filter((line) => /(depends on|blocked by|requires|needs|integration|api|design)/i.test(line)).slice(0, 3);
  const clarifications = lines.filter((line) => /\?|tbd|to be decided|unclear|unsure|decision needed|need input|please confirm/i.test(line)).slice(0, 4);
  return {
    user: clean(user, "user"),
    goal: clean(goal, "complete the workflow"),
    benefit: clean(benefit, "the user can complete the job faster with fewer errors"),
    constraints,
    dependencies,
    clarifications,
    hasMeasurableOutcome: /\b(\d+%|\d+\s?(ms|s|sec|seconds|min|minutes)|under\s+\d+|less than\s+\d+|at least\s+\d+)\b/i.test(normalized),
  };
}

function storyCriteria(preset: ContentToolPreset, user: string, goal: string): string[] {
  if (preset === "api") return [
    `Given an authorized ${user}, when they ${goal}, then the API returns a valid success response schema`,
    "Given invalid input, when the request is submitted, then field-level validation errors are returned",
    "Given dependency failure, when requests retry, then errors are handled without data corruption",
    "Response codes and error payloads follow the documented contract",
    "API behavior is covered by integration tests",
  ];
  if (preset === "engineering") return [
    `Given a ${user}, when they ${goal}, then the workflow completes without regressions`,
    "Backward compatibility is preserved for existing workflows",
    "Logs and metrics are available for diagnosing failures",
    "Tests cover the happy path and at least one failure mode",
    "Performance remains within the team baseline",
  ];
  if (preset === "tech_debt") return [
    `Given the existing implementation, when refactoring ${goal}, then behavior remains equivalent`,
    "Complexity and readability improve in the touched modules",
    "All existing tests pass and new safeguards are added",
    "A rollback path is documented",
    "Operational visibility is preserved or improved",
  ];
  return [
    `Given a ${user} with required permissions, when they ${goal}, then the expected value is returned`,
    `Given invalid or incomplete input, when the ${user} attempts this flow, then a clear validation message is shown`,
    `Given a dependency failure, when the ${user} retries, then failure is handled without data loss`,
    "The flow meets the team's accessibility baseline",
    "Analytics or audit events are recorded if required",
  ];
}

export function generateAgentUserStory(input: UserStoryInput): {
  markdown: string;
  parsed: ParsedStory;
  quality: QualityResult;
} {
  const preset = input.preset ?? "product";
  const parsed = parseStory(input.feature, input.user);
  const storyType = input.storyType ?? "feature";
  const issueType = storyType === "feature" ? "Story" : storyType === "improvement" ? "Improvement" : "Task";
  const priority = input.priority ?? "Medium";
  const title = parsed.goal.length > 80 ? `${parsed.goal.slice(0, 77)}...` : parsed.goal;
  const criteria = storyCriteria(preset, parsed.user, parsed.goal);
  const markdown = `## Title\nAs a ${parsed.user}, I want to ${title}\n\n## Issue Type\n${issueType}\n\n## Priority\n${priority}\n\n## User Story\nAs a ${parsed.user},\nI want to ${parsed.goal},\nSo that ${parsed.benefit}.\n\n## Story Points\n[ ] 1  [ ] 2  [ ] 3  [ ] 5  [ ] 8\n\n## Acceptance Criteria\n${criteria.map((item) => `- [ ] ${item}`).join("\n")}\n\n## Out of Scope\n${parsed.constraints.length ? parsed.constraints.map((item) => `- ${item}`).join("\n") : "- [List anything explicitly NOT included in this story]"}\n\n## Dependencies\n${parsed.dependencies.length ? parsed.dependencies.map((item) => `- ${item}`).join("\n") : "- [List blockers, related tickets, or external dependencies]"}\n\n## Clarifications Needed\n${parsed.clarifications.length ? parsed.clarifications.map((item) => `- ${item}`).join("\n") : "- [No clarifications detected. Add open questions before sprint planning.]"}\n\n## Notes\n- Preset: ${preset}\n- Source context: ${input.feature.trim()}`;
  return { markdown, parsed, quality: scoreUserStory(markdown, parsed.hasMeasurableOutcome, parsed.dependencies) };
}

function criteriaParts(preset: ContentToolPreset, user: string, action: string, outcome: string) {
  const fence = "```";
  const gherkin = [
    "## Acceptance Criteria (Given/When/Then)",
    "",
    "**Happy path:**",
    fence,
    `Given the ${user} is on the relevant page`,
    `When they ${action}`,
    `Then ${outcome}`,
    "And the updated state is clear",
    fence,
    "",
    "**Validation / error state:**",
    fence,
    `Given the ${user} has incomplete or invalid input`,
    `When they attempt to ${action}`,
    "Then a clear validation error is shown",
    "And no invalid action is persisted",
    fence,
    "",
    "**Edge case:**",
    fence,
    "Given a dependency or network failure",
    `When the ${user} attempts to ${action}`,
    "Then the system fails gracefully and explains next steps",
    fence,
  ].join("\n");
  const additions = preset === "api"
    ? "- [ ] Request and response schemas match the documented contract\n- [ ] Invalid payloads return field-level errors\n- [ ] Error responses use stable codes"
    : preset === "engineering"
      ? "- [ ] Unit and integration tests cover critical paths\n- [ ] Logs and monitoring make failures diagnosable\n- [ ] Existing workflows have no regression"
      : "- [ ] User-facing outcomes are explicit and testable\n- [ ] Success and failure behavior is clearly defined\n- [ ] Product, engineering, and QA can understand the criteria";
  const checklist = `## Acceptance Criteria (Checklist)\n\n**Functional:**\n- [ ] The ${user} can ${action} under normal conditions\n- [ ] The action produces this outcome: ${outcome}\n- [ ] Changes are persisted correctly if applicable\n\n**Validation and edge cases:**\n- [ ] Required fields are validated\n- [ ] Empty, boundary, and invalid data are handled\n- [ ] Network errors are handled without data loss\n\n**Definition of Done:**\n- [ ] Code reviewed and approved\n- [ ] Tests written and passing\n- [ ] QA verified against these criteria\n\n**Preset-specific checks (${preset}):**\n${additions}`;
  return { gherkin, checklist };
}

export function generateAgentAcceptanceCriteria(input: AcceptanceCriteriaInput): {
  markdown: string;
  parsed: { user: string; action: string; outcome: string; clarifications: string[]; hasMeasurableSignal: boolean };
  quality: QualityResult;
} {
  const preset = input.preset ?? "product";
  const format = input.format ?? "both";
  const parsedStory = parseStory(input.story, input.user);
  const action = parsedStory.goal;
  const parsed = {
    user: parsedStory.user,
    action,
    outcome: parsedStory.benefit,
    clarifications: parsedStory.clarifications,
    hasMeasurableSignal: parsedStory.hasMeasurableOutcome,
  };
  const parts = criteriaParts(preset, parsed.user, action, parsed.outcome);
  const markdown = format === "gherkin" ? parts.gherkin : format === "checklist" ? parts.checklist : `${parts.gherkin}\n\n---\n\n${parts.checklist}`;
  return {
    markdown: `${markdown}\n\n## Clarifications Needed\n${parsed.clarifications.length ? parsed.clarifications.map((item) => `- [ ] ${item}`).join("\n") : "- [ ] [No clarifications detected. Add open questions if anything is ambiguous.]"}`,
    parsed,
    quality: scoreAcceptanceCriteria(markdown, format, parsed.user.length >= 2, parsed.clarifications, parsed.hasMeasurableSignal),
  };
}
