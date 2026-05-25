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

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
          What does the feature do? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="e.g. Paste notes/chat: User should be able to filter product list by category. Must respond under 2s. Should handle empty state gracefully."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">Works with short prompts or pasted meeting/chat transcripts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
            User type
          </label>
          <input
            id="userType"
            name="userType"
            type="text"
            value={form.userType}
            onChange={handleChange}
            placeholder="e.g. logged-in shopper"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Output format
          </label>
          <select
            id="format"
            name="format"
            value={form.format}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="both">Both (Given/When/Then + Checklist)</option>
            <option value="gherkin">Given/When/Then only</option>
            <option value="checklist">Checklist only</option>
          </select>
        </div>

        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-gray-700 mb-1">
            Preset
          </label>
          <select
            id="preset"
            name="preset"
            value={form.preset}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="product">Product</option>
            <option value="engineering">Engineering</option>
            <option value="api">API</option>
            <option value="tech_debt">Tech Debt</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white">
            Local mode (Free)
          </span>
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            AI mode (Pro)
          </button>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">Coming Soon</span>
        </div>
        <p className="text-xs text-gray-600">
          Local mode is free and works entirely in your browser. AI mode is coming soon with Pro plan.
          <Link href="/pricing" className="text-blue-600 hover:underline ml-1">
            View plans
          </Link>
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!form.featureDescription.trim() || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Generating..." : "Generate Acceptance Criteria"}
      </button>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6">
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
            <button
              onClick={handleCopy}
              className="text-sm px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
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
