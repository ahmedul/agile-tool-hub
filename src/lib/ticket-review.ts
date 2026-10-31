import { splitBugNotes } from "@/lib/generator-input";

export type ReviewKind = "bug" | "story" | "criteria";
export const REVIEW_LABELS: Record<ReviewKind, string> = { bug: "Bug report", story: "User story", criteria: "Acceptance criteria" };
export const MAX_TICKET_CHARACTERS = 50_000;
export interface TicketCheck { id: string; label: string; detected: boolean; explanation: string; evidence?: string }
export interface TicketReview { kind: ReviewKind; summary: string; checks: TicketCheck[]; detected: number }

const ALIASES: Record<string, string> = {
  title: "summary", summary: "summary", description: "description", context: "description",
  "steps to reproduce": "steps", "repro steps": "steps", reproduction: "steps", steps: "steps",
  "expected result": "expected", expected: "expected", should: "expected",
  "actual result": "actual", actual: "actual", observed: "actual", instead: "actual",
  environment: "environment", browser: "environment", device: "environment", build: "environment",
  "acceptance criteria": "criteria", "acceptance checks": "criteria", criteria: "criteria",
  "user story": "story", story: "story", "out of scope": "scope", scope: "scope", exclusions: "scope",
  dependencies: "questions", "open questions": "questions", "clarifications needed": "questions", questions: "questions",
};

function readSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  let current = "";
  for (const source of splitBugNotes(text)) {
    if (/^\s*`{3,}/.test(source)) continue;
    const heading = source.match(/^(?:#{1,6}\s+|h[1-6]\.\s+)(.+)$/i);
    const label = (heading?.[1] ?? source).match(/^([^:]+):\s*(.*)$/);
    const name = (label?.[1] ?? heading?.[1] ?? source).trim().toLowerCase();
    const key = Object.hasOwn(ALIASES, name) ? ALIASES[name] : undefined;
    if (key) {
      current = key;
      const value = label?.[2] ?? "";
      sections.set(key, [sections.get(key), value].filter(Boolean).join("\n"));
    } else if (heading) current = "";
    else if (current) sections.set(current, [sections.get(current), source].filter(Boolean).join("\n"));
  }
  return sections;
}

const PLACEHOLDERS = /\b(?:TBD|TODO|TBC|not specified)\b|\{\{[^}\n]+\}\}|\[(?:insert|enter|describe|add|your|user|role|goal|benefit|expected|actual|steps?|list|none detected)[^\]\n]*\](?!\()/gi;
const VAGUE = /\b(?:works? well|works? fast|user[ -]friendly|handle(?:s)? (?:all )?edge cases|as appropriate|as expected|fast and easy)\b/gi;

function meaningful(value: string): string {
  return value.split("\n").map(line => line.replace(/^\s*(?:[-*]\s*(?:\[[ xX]\]\s*)?|\d+[.)]\s*)/, "").trim())
    .filter(line => line && !new RegExp(PLACEHOLDERS.source, "i").test(line) && !/^(?:n\/?a|none detected\b.*|feature behaves as designed(?: without errors)?\.?|unexpected behavior occurs\.?|open the affected page\.?|perform the reported action\.?|observe the issue\.?)$/i.test(line))
    .join("\n");
}

function excerpt(value: string): string { return value.length > 240 ? value.slice(0, 237) + "…" : value; }

export function reviewTicket(text: string, kind: ReviewKind): TicketReview {
  const sections = readSections(text);
  const firstLine = text.trim().split("\n")[0]?.replace(/^#{1,6}\s+/, "").trim() ?? "";
  const firstIsLabel = Object.hasOwn(ALIASES, firstLine.replace(/:.*$/, "").toLowerCase());
  const summary = meaningful(sections.has("summary") ? sections.get("summary")! : firstIsLabel ? "" : firstLine);
  const checks: TicketCheck[] = [];
  const add = (id: string, label: string, evidence: string, missing: string, found: string) => {
    const content = meaningful(evidence);
    checks.push({ id, label, detected: !!content, explanation: content ? found : missing, evidence: content ? excerpt(content) : undefined });
  };
  if (kind === "bug") {
    add("summary", "Summary", /^(?:bug report|bug|test|issue)$/i.test(summary) ? "" : summary, "Add a short summary of the observed problem and its trigger.", "A summary or opening line is present. Check that it identifies this problem.");
    add("steps", "Reproduction steps", sections.get("steps") ?? "", "Reproduction steps were not detected. Add the starting state and actions another person can follow.", "A reproduction section contains text. Confirm that a reviewer can follow it.");
    add("expected", "Expected result", sections.get("expected") ?? "", "State the expected observable result separately from the actual result.", "An expected result is stated. Confirm the intended product behavior.");
    add("actual", "Actual result", sections.get("actual") ?? "", "Describe what was actually observed, keeping unconfirmed causes separate.", "An actual result is stated. Check it against the available evidence.");
    add("environment", "Environment", sections.get("environment") ?? "", "Environment details were not detected. Add relevant build, browser, device, or test context.", "Environment text is present. Confirm that it is specific enough to reproduce the issue.");
  } else if (kind === "story") {
    add("actor", "Actor", text.match(/\bas an?\s+([^,.;\n]+)/i)?.[1] ?? "", "Name the person or role who benefits, for example with an As a statement.", "An actor is mentioned. Decide whether the role is specific enough for this story.");
    add("outcome", "Desired action", text.match(/\bi want(?: to)?\s+(.+?)(?=,?\s+so that\b|[.;\n]|$)/i)?.[1] ?? "", "Describe what the actor wants to be able to do.", "A desired action is stated. Review whether it delivers a useful outcome.");
    add("benefit", "Reason for the work", text.match(/\bso that\s+([^.;\n]+)/i)?.[1] ?? "", "Explain why the outcome matters to the actor.", "A benefit is mentioned. Confirm that it describes value rather than repeating the action.");
    add("criteria", "Acceptance criteria", sections.get("criteria") ?? "", "Add reviewable acceptance criteria, including the important conditions and outcomes.", "Acceptance criteria text is present. Presence alone does not establish testability.");
    add("scope", "Scope boundaries", sections.get("scope") ?? "", "An explicit scope boundary was not detected. Discuss exclusions if the story could be interpreted broadly.", "Scope text is present. Check that requirements have not been listed as exclusions.");
    add("questions", "Dependencies or open questions", sections.get("questions") ?? "", "Record dependencies, open questions, or an explicit decision that none are known.", "A dependency or question section contains text. Confirm owners and next actions where needed.");
  } else {
    const criteria = sections.get("criteria") ?? text;
    const list = criteria.split("\n").filter(line => /^\s*(?:[-*]|\d+[.)])\s+/.test(line)).map(meaningful).filter(Boolean).join("\n");
    const scenario = /\bGiven\b[\s\S]*?\bWhen\b[\s\S]*?\bThen\b/i.test(criteria);
    add("structure", "Criteria structure", list || (scenario ? criteria : ""), "Use a meaningful checklist or a Given/When/Then scenario with a result.", "Checklist text or a Given/When/Then sequence was detected. Confirm each outcome can be checked.");
    add("context", "Context or actor", criteria.match(/\bGiven\b[^\n]+/i)?.[0] ?? criteria.match(/\b(?:user|shopper|customer|administrator|operator|authenticated|authorized)\b[^\n]*/i)?.[0] ?? "", "State the actor or starting condition needed to interpret the behavior.", "Context or an actor is mentioned. Check that the starting condition is sufficient.");
    add("result", "Action and observable result", scenario ? criteria : list, "An action/result sequence was not detected. State what changes and how a reviewer observes it.", "An action/result structure or checklist is present. A reviewer must confirm the meaning of each result.");
    add("failure", "Boundary or failure example", criteria.match(/[^\n]*\b(?:invalid|expired|empty|error|failure|unauthorized|forbidden|timeout|duplicate|retry|maximum|minimum|boundary)\b[^\n]*/i)?.[0] ?? "", "No boundary or failure wording was detected. Discuss which cases are relevant to this story.", "A boundary or failure condition is mentioned. Confirm the expected response is also defined.");
  }
  const placeholders = [...text.matchAll(new RegExp(PLACEHOLDERS.source, "gi"))].map(match => match[0]);
  checks.push({ id: "placeholders", label: "Unfinished template text", detected: placeholders.length === 0, explanation: placeholders.length ? "Replace or explicitly resolve these placeholders before handing off the work." : "No common placeholder markers were detected.", evidence: placeholders.length ? excerpt([...new Set(placeholders)].join(", ")) : undefined });
  const vague = [...text.matchAll(new RegExp(VAGUE.source, "gi"))].map(match => match[0]);
  checks.push({ id: "language", label: "Language to clarify", detected: vague.length === 0, explanation: vague.length ? "These phrases may need concrete conditions or outcomes in this context." : "No phrases from this small ambiguity checklist were detected.", evidence: vague.length ? excerpt([...new Set(vague)].join(", ")) : undefined });
  return { kind, summary, checks, detected: checks.filter(check => check.detected).length };
}

export function ticketReviewMarkdown(review: TicketReview): string {
  const evidence = (text: string) => {
    const width = Math.max(3, ...[...text.matchAll(/`+/g)].map(match => match[0].length + 1));
    const fence = "`".repeat(width);
    return `${fence}text\n${text}\n${fence}`;
  };
  return ["# Jira Ticket Review", `Type: ${REVIEW_LABELS[review.kind]}`, `${review.detected} of ${review.checks.length} checks detected no issue in the pasted text.`, "These are text checks for human review, not approval of correctness, testability, or priority.", ...review.checks.map(check => `## ${check.label}\n${check.detected ? "Detected / no flag" : "Needs review"}\n${check.explanation}${check.evidence ? `\n\n${evidence(check.evidence)}` : ""}`)].join("\n\n");
}

export const TICKET_EXAMPLES: Record<ReviewKind, { weak: string; detailed: string }> = {
  bug: {
    weak: "Checkout is broken. Please fix ASAP.",
    detailed: "## Summary\nCheckout submits twice when Pay is pressed on a slow connection\n\n## Steps to reproduce\n1. Open staging checkout with an in-stock item.\n2. Enter a valid test payment method and enable a slow network profile.\n3. Press Pay twice before a result appears.\n\n## Expected result\nOne paid order is created and a confirmation is displayed.\n\n## Actual result\nTwo requests appear in the log. Whether both create a charge is still unconfirmed.\n\n## Environment\nStaging build 2026.10.31, Chrome on Android.\n\n## Open questions\nDoes the payment service support an idempotent submission?",
  },
  story: {
    weak: "As a user, I want a better dashboard, so that it works well.\nAcceptance criteria:\n- Handle all edge cases.\n- [Add your criteria]",
    detailed: "## Summary\nFilter catalog products by category\n\n## User story\nAs a shopper, I want to filter the catalog by category, so that I can compare relevant products.\n\n## Acceptance criteria\n- Selecting a category shows only products in that category.\n- No matches displays an empty state with a clear-filters action.\n- Clearing the filter restores the full catalog.\n\n## Out of scope\nSaved filters and product recommendations.\n\n## Dependencies\nThe catalog API exposes the category field.\n\n## Open questions\nConfirm the agreed mobile test devices before implementation.",
  },
  criteria: {
    weak: "Acceptance criteria:\n- Works fast.\n- Handle edge cases.\n- [Add expected behavior]",
    detailed: "Acceptance criteria:\nGiven an authenticated shopper has a valid product in the cart\nWhen they submit an order with quantity 1\nThen the API responds with status 201 and identifies the new order\n\nGiven an authenticated shopper has a valid product in the cart\nWhen they submit an invalid quantity of 11\nThen the API responds with status 400 and identifies quantity as invalid\nAnd no order is created for that request",
  },
};
