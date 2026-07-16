"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import { scoreAcceptanceCriteria, QualityResult } from "@/lib/ticketQuality";
import OutputFeedback from "@/components/OutputFeedback";

type OutputFormat = "gherkin" | "checklist" | "both";
type GenerationMode = "local" | "ai";
type CriteriaPreset = "product" | "engineering" | "api" | "tech_debt";

interface FormState {
  featureDescription: string;
  userType: string;
  format: OutputFormat;
  preset: CriteriaPreset;
}

interface ParsedCriteriaInput {
  user: string;
  action: string;
  outcome: string;
  constraints: string[];
  clarifications: string[];
  hasMeasurableSignal: boolean;
}

// QualityCriterion and CriteriaQualityResult types are imported from ticketQuality utility
type CriteriaQualityResult = QualityResult;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseCriteriaInput(featureDescription: string, userType: string): ParsedCriteriaInput {
  const normalized = normalizeText(featureDescription);
  const lines = featureDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const user =
    userType.trim() ||
    normalized.match(/\bas an?\s+([^,.;]+)/i)?.[1] ||
    normalized.match(/\bfor\s+([^,.;]+?)\s+(?:to|who|when)/i)?.[1] ||
    "user";

  const action =
    normalized.match(/\b(can|should be able to|needs to|want to)\s+([^.;]+)/i)?.[2] ||
    normalized.match(/\bi want to\s+([^.;]+)/i)?.[1] ||
    normalized ||
    "complete the workflow";

  const outcome =
    normalized.match(/\bso that\s+([^.;]+)/i)?.[1] ||
    normalized.match(/\bresult(?: is| should be)?\s*:?\s*([^.;]+)/i)?.[1] ||
    "the expected result is visible and persisted";

  const constraints = lines
    .filter((line) => /(must|should|cannot|can't|only|within|without|except|under)/i.test(line))
    .slice(0, 3)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const clarifications = lines
    .filter((line) => /\?|tbd|to be decided|unclear|unsure|confirm|decision needed|need input/i.test(line))
    .slice(0, 4)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const hasMeasurableSignal = /\b(\d+%|\d+\s?(ms|s|sec|seconds|min|minutes)|under\s+\d+|less than\s+\d+|at least\s+\d+)\b/i.test(normalized);

  return {
    user,
    action: normalizeText(action),
    outcome: normalizeText(outcome),
    constraints,
    clarifications,
    hasMeasurableSignal,
  };
}

function getPresetChecklistAdditions(preset: CriteriaPreset): string[] {
  if (preset === "engineering") {
    return [
      "- [ ] Unit and integration tests cover critical paths",
      "- [ ] No regression in existing workflows after release",
      "- [ ] Logs/monitoring make failures diagnosable",
    ];
  }

  if (preset === "api") {
    return [
      "- [ ] Request and response schemas match documented contract",
      "- [ ] Invalid payloads return explicit field-level validation errors",
      "- [ ] Error responses include stable codes and actionable messages",
    ];
  }

  if (preset === "tech_debt") {
    return [
      "- [ ] Refactor maintains functional parity with previous behavior",
      "- [ ] Complexity/readability improves in touched modules",
      "- [ ] Rollback path is documented for safe deployment",
    ];
  }

  return [
    "- [ ] Criteria are understandable by product, engineering, and QA",
    "- [ ] User-facing outcomes are explicit and testable",
    "- [ ] Success/failure behavior is clearly defined",
  ];
}

function getPresetGherkinEdgeCase(preset: CriteriaPreset, user: string, desc: string): string {
  if (preset === "api") {
    return `Given the ${user} sends an invalid API request\nWhen they attempt to ${desc}\nThen the system returns a contract-compliant validation error\nAnd no partial data is persisted`;
  }

  if (preset === "tech_debt") {
    return `Given the ${user} triggers a legacy code path\nWhen they ${desc} after refactoring\nThen behavior remains unchanged for existing users\nAnd observability confirms no hidden regressions`;
  }

  if (preset === "engineering") {
    return `Given dependent services are degraded\nWhen the ${user} attempts to ${desc}\nThen the system fails gracefully with clear guidance\nAnd retry/recovery behavior is deterministic`;
  }

  return `Given the ${user} triggers an unexpected condition (e.g. network error, empty state)\nWhen they attempt to ${desc}\nThen the system handles the error gracefully\nAnd the ${user} is shown meaningful next steps`;
}

function generateAcceptanceCriteria(form: FormState): { markdown: string; parsed: ParsedCriteriaInput } {
  const { featureDescription, userType, format } = form;
  const parsed = parseCriteriaInput(featureDescription, userType);
  const user = parsed.user;
  const desc = parsed.action;
  const outcome = parsed.outcome;

  const constraints = parsed.constraints.length
    ? parsed.constraints.map((line) => `- [ ] ${line}`).join("\n")
    : "- [ ] [Add any constraints, limits, or policy requirements here]";

  const clarifications = parsed.clarifications.length
    ? parsed.clarifications.map((line) => `- [ ] ${line}`).join("\n")
    : "- [ ] [No clarifications detected. Add open questions if anything is still ambiguous.]";

  const checklistAdditions = getPresetChecklistAdditions(form.preset).join("\n");
  const presetLabel =
    form.preset === "tech_debt"
      ? "Tech Debt"
      : form.preset === "api"
      ? "API"
      : form.preset === "engineering"
      ? "Engineering"
      : "Product";

  const gherkin = `## Acceptance Criteria (Given/When/Then)

**Happy path:**
\`\`\`
Given the ${user} is on the relevant page
When they ${desc}
Then ${outcome}
And the UI reflects the updated state without ambiguity
\`\`\`

**Validation / error state:**
\`\`\`
Given the ${user} has not completed all required fields
When they attempt to ${desc}
Then a clear error message is shown
And no action is taken until the issue is resolved
\`\`\`

**Edge case:**
\`\`\`
${getPresetGherkinEdgeCase(form.preset, user, desc)}
\`\`\``;

  const checklist = `## Acceptance Criteria (Checklist)

**Functional:**
- [ ] The ${user} can ${desc} successfully under normal conditions
- [ ] The action produces this outcome: ${outcome}
- [ ] Changes are persisted correctly (if applicable)

**Validation:**
- [ ] Required fields are validated before submission
- [ ] Clear error messages are shown for invalid or missing input
- [ ] The form/action cannot be submitted in an invalid state

**Edge cases & error handling:**
- [ ] The feature behaves correctly with empty or boundary data
- [ ] Network errors are handled gracefully with a user-facing message
- [ ] No data loss occurs if the action fails

**Non-functional:**
- [ ] The feature works on mobile and desktop
- [ ] Page/action response time is acceptable (under 2 seconds for typical cases)
- [ ] The feature is accessible (keyboard navigable, screen reader friendly)

**Definition of Done:**
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] QA verified against these criteria
- [ ] Product Owner has accepted the story

**Preset-specific checks (${presetLabel}):**
${checklistAdditions}

**Business constraints from input:**
${constraints}`;

  const commonSections = `\n\n## Clarifications Needed\n${clarifications}\n\n## Preset Guidance\n- Preset: ${presetLabel}`;

  let markdown = "";

  if (format === "gherkin") markdown = `${gherkin}${commonSections}`;
  else if (format === "checklist") markdown = `${checklist}${commonSections}`;
  else markdown = `${gherkin}\n\n---\n\n${checklist}${commonSections}`;

  return { markdown, parsed };
}



export default function AcceptanceCriteriaGenerator() {
  const [form, setForm] = useState<FormState>({
    featureDescription: "",
    userType: "",
    format: "both",
    preset: "product",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState<CriteriaQualityResult | null>(null);

  const quickExamples = [
    {
      label: "Checkout filter",
      description: "User can filter products by category and price. Must respond under 2s and show empty state when no matches.",
      format: "both" as OutputFormat,
      preset: "product" as CriteriaPreset,
      userType: "shopper",
    },
    {
      label: "API contract",
      description: "POST /api/orders validates payload, returns field errors for invalid data, and never persists partial records.",
      format: "gherkin" as OutputFormat,
      preset: "api" as CriteriaPreset,
      userType: "client application",
    },
    {
      label: "Refactor safety",
      description: "Refactor auth module for shared validation while preserving current login behavior and observability.",
      format: "checklist" as OutputFormat,
      preset: "tech_debt" as CriteriaPreset,
      userType: "engineering team",
    },
  ];

  useEffect(() => {
    // Reset for when AI mode is re-enabled
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.featureDescription.trim()) return;
    setError("");
    // Always use local mode (AI mode not yet available)
    trackEvent("generator_run", { tool: "acceptance_criteria", mode: "local", format: form.format, preset: form.preset });
    const generated = generateAcceptanceCriteria(form);
    const qualityResult = scoreAcceptanceCriteria(generated.markdown, form.format, generated.parsed.user.trim().length >= 2, generated.parsed.clarifications, generated.parsed.hasMeasurableSignal);
    setOutput(generated.markdown);
    setQuality(qualityResult);
    trackEvent("ticket_quality_scored", {
      tool: "acceptance_criteria",
      mode: "local",
      score: qualityResult.score,
      grade: qualityResult.grade,
      preset: form.preset,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", { tool: "acceptance_criteria", mode: "local", output_length: output.length });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyExample = (index: number) => {
    const example = quickExamples[index];
    if (!example) return;
    setForm({
      featureDescription: example.description,
      userType: example.userType,
      format: example.format,
      preset: example.preset,
    });
  };

  const canGenerate = Boolean(form.featureDescription.trim()) && !loading;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white">Fast Mode</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">No Login</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">AI Mode Coming Soon</span>
        </div>
        <p className="text-sm text-slate-700">
          Generate testable acceptance criteria instantly. Cleaner tickets, fewer surprises, happier QA.
          <Link href="/pricing" className="text-emerald-700 hover:underline ml-1 font-medium">See plans</Link>
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Step 1</p>
        <label htmlFor="featureDescription" className="block text-sm font-semibold text-slate-800 mb-2">
          What should this feature do? <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="Paste a rough feature note. Example: User can filter products by category and price with under 2s response."
          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">Short prompt or long transcript both work.</p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Need a quick start?</p>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((example, idx) => (
              <button
                key={example.label}
                type="button"
                onClick={() => applyExample(idx)}
                className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:border-emerald-400 hover:text-emerald-700 transition-colors"
              >
                Try: {example.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Step 2</p>
        <p className="text-sm font-semibold text-slate-800 mb-3">Tune output</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-1">User type</label>
            <input
              id="userType"
              name="userType"
              type="text"
              value={form.userType}
              onChange={handleChange}
              placeholder="e.g. logged-in shopper"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-slate-700 mb-1">Output format</label>
            <select
              id="format"
              name="format"
              value={form.format}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="both">Both (Given/When/Then + Checklist)</option>
              <option value="gherkin">Given/When/Then only</option>
              <option value="checklist">Checklist only</option>
            </select>
          </div>

          <div>
            <label htmlFor="preset" className="block text-sm font-medium text-slate-700 mb-1">Preset</label>
            <select
              id="preset"
              name="preset"
              value={form.preset}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="product">Product</option>
              <option value="engineering">Engineering</option>
              <option value="api">API</option>
              <option value="tech_debt">Tech Debt</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Step 3</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Criteria"}
          </button>
          <p className="text-sm text-slate-600">Built for speed and fewer QA surprises.</p>
        </div>
      </section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">Done</p>
          <p className="text-sm font-semibold text-emerald-900 mb-3">Criteria generated. QA handshake unlocked.</p>
          {quality && (
            <div className="mb-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700">Criteria Quality Score</p>
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
            <label className="text-sm font-medium text-gray-700">Generated Acceptance Criteria</label>
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
          <OutputFeedback tool="acceptance_criteria" mode="local" />
        </div>
      )}
    </div>
  );
}
