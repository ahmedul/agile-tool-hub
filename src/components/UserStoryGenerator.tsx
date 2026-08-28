"use client";
import Link from "next/link";
import { useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { trackEvent } from "@/lib/analytics";
import { scoreUserStory, QualityResult } from "@/lib/ticketQuality";
import OutputFeedback from "@/components/OutputFeedback";
import ToolStepCard from "@/components/ToolStepCard";
import ToolSuccessBanner from "@/components/ToolSuccessBanner";

type StoryType = "feature" | "improvement" | "task";
type Priority = "High" | "Medium" | "Low";
type StoryPreset = "product" | "engineering" | "api" | "tech_debt";

interface FormState {
  featureDescription: string;
  userType: string;
  storyType: StoryType;
  priority: Priority;
  preset: StoryPreset;
}

interface ParsedStoryInput {
  user: string;
  goal: string;
  benefit: string;
  constraints: string[];
  dependencies: string[];
  clarifications: string[];
  hasMeasurableOutcome: boolean;
  sourceContext: string;
  isIncidentLike: boolean;
}

// QualityCriterion and StoryQualityResult types are imported from ticketQuality utility
type StoryQualityResult = QualityResult;

function trimToSentence(text: string, fallback: string): string {
  const value = text.trim();
  if (!value) return fallback;
  return value.replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ");
}

function extractMarkdownSection(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s+${escaped}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = markdown.match(regex);
  return match?.[1]?.trim() ?? "";
}

function sanitizeStoryInput(input: string): string {
  const hasTemplateHeadings = [
    "## Title",
    "## User Story",
    "## Acceptance Criteria",
    "## Dependencies",
    "## Notes",
  ].filter((heading) => input.includes(heading)).length >= 2;

  if (!hasTemplateHeadings) return input;

  const userStory = extractMarkdownSection(input, "User Story");
  const description = extractMarkdownSection(input, "Description");
  return (userStory || description || input).replace(/\s+/g, " ").trim();
}

function firstMeaningfulLine(lines: string[]): string {
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^dear\b/i.test(line)) continue;
    if (/^hi\b/i.test(line)) continue;
    if (/^hello\b/i.test(line)) continue;
    if (/^(thanks|thank you|best regards|regards|cheers)\b/i.test(line)) continue;
    return line;
  }
  return lines[0] ?? "complete the workflow";
}

function redactPeopleMentions(text: string): string {
  return text
    .replace(
      /\b(i\s+have\s+worked\s+with|worked\s+with|coordinated\s+with|talked\s+to|spoke\s+with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g,
      "$1 [redacted]"
    )
    .replace(
      /\b(confirmed\s+by|reviewed\s+by|reported\s+by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g,
      "$1 [redacted]"
    );
}

function isIncidentInput(normalized: string): boolean {
  return /(outage|incident|impact(ed)?|degradation|service placement|desire\s*db|vprn|edge\d+\.|fra\d+|mad|ams)/i.test(
    normalized
  );
}

function deriveIncidentStoryFields(normalized: string): {
  user: string;
  goal: string;
  benefit: string;
} {
  const vprn = normalized.match(/\bvprn\s*[:#-]?\s*(\d+)\b/i)?.[1];
  const serviceIds = normalized
    .match(/service\s*id\s*[:#]?\s*([\d\s|,]+)/i)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  const location = normalized.match(/\b([a-z]{3}\d{2})\b/i)?.[1]?.toUpperCase();

  const scope = vprn
    ? `service placement discrepancy for VPRN ${vprn}${serviceIds ? ` (Service ID ${serviceIds})` : ""}`
    : "service placement discrepancy";

  return {
    user: "cloud operations engineer",
    goal: `verify and resolve ${scope}`,
    benefit: location
      ? `operations can confirm whether the ${location} outage impacted production services and restore data consistency`
      : "operations can confirm outage impact and restore data consistency across systems",
  };
}

function parseStoryInput(featureDescription: string, userType: string): ParsedStoryInput {
  const sourceInput = sanitizeStoryInput(featureDescription);
  const normalized = sourceInput.replace(/\s+/g, " ").trim();
  const lines = sourceInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const userFromText =
    normalized.match(/\bas an?\s+([^,.;]+)/i)?.[1] ??
    normalized.match(/\bfor\s+([^,.;]+?)\s+(?:to|who|when)/i)?.[1] ??
    userType;

  const incidentLike = isIncidentInput(normalized);
  const incidentFields = incidentLike ? deriveIncidentStoryFields(normalized) : null;

  const goalFromText =
    normalized.match(/\bi want to\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bneed to\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bshould be able to\s+([^.;]+)/i)?.[1] ??
    firstMeaningfulLine(lines);

  const benefitFromText =
    normalized.match(/\bso that\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bbecause\s+([^.;]+)/i)?.[1] ??
    "the user can complete the job faster with fewer errors";

  const constraints = lines
    .filter((line) => /(must|cannot|can't|within|without|except|limit|only if|must not)/i.test(line))
    .slice(0, 4)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const dependencies = lines
    .filter((line) => /(depends on|blocked by|requires|needs|integration|api|design)/i.test(line))
    .slice(0, 3)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const clarifications = lines
    .filter((line) => /\?|tbd|to be decided|unclear|unsure|decision needed|need input|please confirm/i.test(line))
    .slice(0, 4)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const hasMeasurableOutcome = /\b(\d+%|\d+\s?(ms|s|sec|seconds|min|minutes)|under\s+\d+|less than\s+\d+|at least\s+\d+)\b/i.test(normalized);
  const sourceContext = redactPeopleMentions(sourceInput.trim());

  return {
    user: trimToSentence(incidentFields?.user ?? userFromText ?? "", "user"),
    goal: trimToSentence(incidentFields?.goal ?? goalFromText ?? "", "complete the workflow"),
    benefit: trimToSentence(
      incidentFields?.benefit ?? benefitFromText ?? "",
      "the user can complete the job faster with fewer errors"
    ),
    constraints,
    dependencies,
    clarifications,
    hasMeasurableOutcome,
    sourceContext,
    isIncidentLike: incidentLike,
  };
}

function getPresetAcceptanceCriteria(preset: StoryPreset, user: string, desc: string): string[] {
  if (preset === "engineering") {
    return [
      `Given a ${user}, when they ${desc}, then the workflow completes without regressions`,
      "Given existing functionality, when this change ships, then backward compatibility is preserved",
      "Given production telemetry, when the change runs, then logs/metrics are available for debugging",
      "Code paths include tests for happy path and at least one failure mode",
      "Performance remains within team baseline for this flow",
    ];
  }

  if (preset === "api") {
    return [
      `Given an authorized ${user}, when they ${desc}, then the API returns a valid success response schema`,
      "Given invalid input, when the request is submitted, then field-level validation errors are returned",
      "Given dependency/service failure, when requests retry, then errors are handled without data corruption",
      "Response codes and error payloads follow the documented contract",
      "API behavior is covered by integration tests",
    ];
  }

  if (preset === "tech_debt") {
    return [
      `Given the existing implementation, when refactoring ${desc}, then behavior remains functionally equivalent`,
      "Given the code changes, when reviewed, then complexity/readability improves measurably",
      "Given CI checks, when tests run, then all existing tests pass and new safeguards are added",
      "Rollback path is documented if deployment introduces regressions",
      "Operational visibility (logs/alerts) is preserved or improved",
    ];
  }

  return [
    `Given a ${user} with required permissions, when they ${desc}, then the expected value is returned in the UI`,
    `Given invalid or incomplete input, when the ${user} attempts this flow, then a clear validation message is shown`,
    `Given a dependency failure (API/network), when the ${user} retries, then failure is handled without data loss`,
    "Analytics/audit event is recorded for this action (if required by product)",
    "The flow meets accessibility baseline (keyboard + screen reader labels)",
  ];
}

function getPresetNotes(preset: StoryPreset): string[] {
  if (preset === "engineering") {
    return [
      "Implementation focus: maintainability, test coverage, and safe rollout",
      "Document any migration or config change required by this task",
    ];
  }

  if (preset === "api") {
    return [
      "Include endpoint contract examples (request/response) before implementation starts",
      "Align error codes with existing API standards",
    ];
  }

  if (preset === "tech_debt") {
    return [
      "Capture current pain (bugs, slow delivery, complexity) in measurable terms",
      "Define how we verify no functional regressions after refactor",
    ];
  }

  return [
    "Prioritize user value and testable business outcomes",
    "Ensure criteria can be validated by PM, QA, and engineering",
  ];
}

function generateUserStory(form: FormState): { markdown: string; parsed: ParsedStoryInput } {
  const { featureDescription, userType, storyType, priority } = form;
  const parsed = parseStoryInput(featureDescription, userType);
  const user = parsed.user;
  const desc = parsed.goal;
  const benefit = parsed.benefit;
  const criteria = getPresetAcceptanceCriteria(form.preset, user, desc);
  const presetNotes = getPresetNotes(form.preset);

  // Derive a concise title from the description
  const title = desc.length > 80 ? desc.slice(0, 77) + "..." : desc;

  const issueTypeLabel = parsed.isIncidentLike
    ? "Task"
    : storyType === "feature"
    ? "Story"
    : storyType === "improvement"
    ? "Improvement"
    : "Task";

  const incidentAcceptanceCriteria = [
    `Given reported outage indicators, when ${user} compares system data vs edge CLI, then discrepancies are identified and documented`,
    "Given conflicting placement data, when investigation is completed, then source-of-truth is established",
    "Given affected services, when impact analysis is performed, then impacted and non-impacted locations are explicitly listed",
    "Investigation outcome includes remediation recommendation and operational owner",
    "Evidence links (dashboards/logs/CLI output) are attached for auditability",
  ];

  const markdown = `## Title
As a ${user}, I want to ${title}

## Issue Type
${issueTypeLabel}

## Priority
${priority}

## User Story
As a ${user},
I want to ${desc},
So that ${benefit}.

## Story Points
[ ] 1  [ ] 2  [ ] 3  [ ] 5  [ ] 8

## Acceptance Criteria
${(parsed.isIncidentLike ? incidentAcceptanceCriteria : criteria).map((item) => `- [ ] ${item}`).join("\n")}

## Out of Scope
${parsed.constraints.length ? parsed.constraints.map((item) => `- ${item}`).join("\n") : parsed.isIncidentLike ? "- No service configuration changes are included in this investigation task" : "- [List anything explicitly NOT included in this story]"}

## Dependencies
${parsed.dependencies.length ? parsed.dependencies.map((item) => `- ${item}`).join("\n") : "- [List any blockers, related tickets, or external dependencies]"}

## Clarifications Needed
${parsed.clarifications.length ? parsed.clarifications.map((item) => `- ${item}`).join("\n") : "- [None detected. If scope is still unclear, add open questions here before sprint planning.]"}

## Preset Guidance
- Preset: ${form.preset === "tech_debt" ? "Tech Debt" : form.preset === "api" ? "API" : form.preset === "engineering" ? "Engineering" : "Product"}
${presetNotes.map((item) => `- ${item}`).join("\n")}
${parsed.isIncidentLike ? "- Incident-like input detected: output is optimized for operations investigation tasks" : ""}

## Notes
- Source context pasted by author:
${parsed.sourceContext || featureDescription.trim()}`;

  return { markdown, parsed };
}



export default function UserStoryGenerator() {
  const [form, setForm] = usePersistentState<FormState>("tool-draft-user-story", {
    featureDescription: "",
    userType: "",
    storyType: "feature",
    priority: "Medium",
    preset: "product",
  });
  const [output, setOutput] = usePersistentState("tool-output-user-story", "");
  const [copied, setCopied] = useState(false);
  const loading = false;
  const [error, setError] = useState("");
  const [quality, setQuality] = usePersistentState<StoryQualityResult | null>("tool-quality-user-story", null);

  const quickExamples = [
    {
      label: "Checkout speedup",
      text: "Users abandon checkout when card validation is slow. Add real-time validation and clearer inline errors. Must work on mobile and desktop.",
      userType: "shopper",
      storyType: "feature" as StoryType,
      preset: "product" as StoryPreset,
      priority: "High" as Priority,
    },
    {
      label: "API reliability",
      text: "Rate limit spikes are causing intermittent 500 errors on POST /api/orders. Add retry-safe handling and clear 429 responses.",
      userType: "platform engineer",
      storyType: "improvement" as StoryType,
      preset: "api" as StoryPreset,
      priority: "High" as Priority,
    },
    {
      label: "Tech debt cleanup",
      text: "Legacy auth module has duplicated logic and no shared validation utility. Refactor to reduce maintenance cost and keep behavior unchanged.",
      userType: "engineering team",
      storyType: "task" as StoryType,
      preset: "tech_debt" as StoryPreset,
      priority: "Medium" as Priority,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.featureDescription.trim()) return;
    setError("");
    // Always use local mode (AI mode not yet available)
    trackEvent("generator_run", { tool: "user_story", mode: "local", preset: form.preset });
    const generated = generateUserStory(form);
    const qualityResult = scoreUserStory(generated.markdown, generated.parsed.hasMeasurableOutcome, generated.parsed.dependencies);
    setOutput(generated.markdown);
    setQuality(qualityResult);
    trackEvent("ticket_quality_scored", {
      tool: "user_story",
      mode: "local",
      score: qualityResult.score,
      grade: qualityResult.grade,
      preset: form.preset,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", { tool: "user_story", mode: "local", output_length: output.length });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyExample = (index: number) => {
    const example = quickExamples[index];
    if (!example) return;
    setForm({
      featureDescription: example.text,
      userType: example.userType,
      storyType: example.storyType,
      preset: example.preset,
      priority: example.priority,
    });
  };

  const canGenerate = Boolean(form.featureDescription.trim()) && !loading;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-700 text-white">Fast Mode</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">No Login</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">AI Mode Coming Soon</span>
        </div>
        <p className="text-sm text-slate-700">
          Describe your idea, tweak a few knobs, and get a Jira-ready story in seconds. Less typing, more shipping.
          <Link href="/pricing" className="text-sky-700 hover:underline ml-1 font-medium">See plans</Link>
        </p>
      </div>

      <ToolStepCard accentClassName="text-sky-700" stepLabel="Step 1">
        <label htmlFor="featureDescription" className="block text-sm font-semibold text-slate-800 mb-2">
          What should this feature do? <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="Paste rough notes or one clear sentence. Example: Users should save payment methods and reuse them at checkout."
          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">Tip: Messy notes are welcome. The generator will structure them for you.</p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Need a quick start?</p>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((example, idx) => (
              <button
                key={example.label}
                type="button"
                onClick={() => applyExample(idx)}
                className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:border-sky-400 hover:text-sky-700 transition-colors"
              >
                Try: {example.label}
              </button>
            ))}
          </div>
        </div>
      </ToolStepCard>

      <ToolStepCard
        accentClassName="text-sky-700"
        stepLabel="Step 2"
        title="Add context (optional but helpful)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-1">User type</label>
            <input
              id="userType"
              name="userType"
              type="text"
              value={form.userType}
              onChange={handleChange}
              placeholder="e.g. logged-in user"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="storyType" className="block text-sm font-medium text-slate-700 mb-1">Story type</label>
            <select
              id="storyType"
              name="storyType"
              value={form.storyType}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="feature">Story (new feature)</option>
              <option value="improvement">Improvement</option>
              <option value="task">Task</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="preset" className="block text-sm font-medium text-slate-700 mb-1">Preset</label>
            <select
              id="preset"
              name="preset"
              value={form.preset}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="product">Product</option>
              <option value="engineering">Engineering</option>
              <option value="api">API</option>
              <option value="tech_debt">Tech Debt</option>
            </select>
          </div>
        </div>
      </ToolStepCard>

      <ToolStepCard accentClassName="text-sky-700" stepLabel="Step 3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="bg-sky-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate My Story"}
          </button>
          <p className="text-sm text-slate-600">Usually ready in 1-2 seconds.</p>
        </div>
      </ToolStepCard>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <ToolSuccessBanner title="Done" subtitle="Your story is ready. Nice. Very PM-friendly." />
          {quality && (
            <div className="mb-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700">Story Quality Score</p>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${
                    quality.grade === "Excellent"
                      ? "bg-green-100 text-green-700"
                      : quality.grade === "Good"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {quality.score}/100 · {quality.grade}
                </span>
              </div>
              <div className="h-2 w-full rounded bg-gray-100 mb-3">
                <div
                  className={`h-2 rounded transition-all ${
                    quality.score >= 85
                      ? "bg-green-500"
                      : quality.score >= 65
                      ? "bg-blue-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${quality.score}%` }}
                />
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                {quality.criteria.map((item) => (
                  <li key={item.label} className="flex items-center gap-1.5">
                    <span className={item.met ? "text-green-600" : "text-amber-600"}>{item.met ? "✓" : "!"}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated User Story</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="text-sm px-3 py-1.5 rounded border border-slate-300 hover:bg-white transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="text-sm px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy for Jira"}
              </button>
            </div>
          </div>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
            {output}
          </pre>
          <OutputFeedback tool="user_story" mode="local" />
        </div>
      )}
    </div>
  );
}
