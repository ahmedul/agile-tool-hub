"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import OutputFeedback from "@/components/OutputFeedback";

type OutputFormat = "gherkin" | "checklist" | "both";
type GenerationMode = "local" | "ai";

interface FormState {
  featureDescription: string;
  userType: string;
  format: OutputFormat;
}

interface ParsedCriteriaInput {
  user: string;
  action: string;
  outcome: string;
  constraints: string[];
}

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

  return {
    user,
    action: normalizeText(action),
    outcome: normalizeText(outcome),
    constraints,
  };
}

function generateAcceptanceCriteria(form: FormState): string {
  const { featureDescription, userType, format } = form;
  const parsed = parseCriteriaInput(featureDescription, userType);
  const user = parsed.user;
  const desc = parsed.action;
  const outcome = parsed.outcome;

  const constraints = parsed.constraints.length
    ? parsed.constraints.map((line) => `- [ ] ${line}`).join("\n")
    : "- [ ] [Add any constraints, limits, or policy requirements here]";

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
Given the ${user} triggers an unexpected condition (e.g. network error, empty state)
When they attempt to ${desc}
Then the system handles the error gracefully
And the ${user} is shown a meaningful message with next steps
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

**Business constraints from input:**
${constraints}`;

  if (format === "gherkin") return gherkin;
  if (format === "checklist") return checklist;
  return `${gherkin}\n\n---\n\n${checklist}`;
}

export default function AcceptanceCriteriaGenerator() {
  const [form, setForm] = useState<FormState>({
    featureDescription: "",
    userType: "",
    format: "both",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<GenerationMode>("local");
  const [aiRunsLeft, setAiRunsLeft] = useState(0);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const status = getAiUsageStatus();
    setAiRunsLeft(status.remaining);
    setPlan(status.plan);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.featureDescription.trim()) return;
    setError("");
    trackEvent("generator_run", { tool: "acceptance_criteria", mode, format: form.format });

    if (mode === "local") {
      setOutput(generateAcceptanceCriteria(form));
      return;
    }

    if (plan === "free" && aiRunsLeft <= 0) {
      setError("You used all free AI generations for this month. Upgrade to Pro for higher limits.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "acceptance-criteria",
          input: form.featureDescription,
          options: {
            format: form.format,
            userType: form.userType,
          },
        }),
      });

      const data = (await response.json()) as { output?: string; error?: string };
      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate AI output.");
      }

      setOutput(data.output);
      const next = incrementAiUsage();
      setAiRunsLeft(next.remaining);
      setPlan(next.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", { tool: "acceptance_criteria", mode, output_length: output.length });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode("local")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "local" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Local mode (Free)
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "ai" ? "bg-violet-600 text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            AI mode (Pro)
          </button>
        </div>
        <p className="text-xs text-gray-600">
          {plan === "free"
            ? `Free plan: ${aiRunsLeft} AI generations left this month. Local mode stays unlimited.`
            : `Pro plan: ${aiRunsLeft} AI generations left this month.`}
          {" "}
          <Link href="/pricing" className="text-blue-600 hover:underline">
            View plans
          </Link>
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!form.featureDescription.trim() || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Generating..." : mode === "ai" ? "Generate with AI" : "Generate Acceptance Criteria"}
      </button>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6">
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
          <OutputFeedback tool="acceptance_criteria" mode={mode} />
        </div>
      )}
    </div>
  );
}
