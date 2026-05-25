"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/subscription";
import { trackEvent } from "@/lib/analytics";
import { scoreBugReport, QualityResult } from "@/lib/ticketQuality";
import OutputFeedback from "@/components/OutputFeedback";

type GenerationMode = "local" | "ai";

interface ParsedBugReport {
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  environment: {
    browser: string;
    os: string;
    appVersion: string;
    url: string;
  };
}

// QualityCriterion and TicketQualityResult types are imported from ticketQuality utility
type TicketQualityResult = QualityResult;

const BROWSERS = ["chrome", "firefox", "safari", "edge", "opera", "brave"];
const OSS = ["windows", "mac", "macos", "linux", "android", "ios"];

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
  return lines[0] ?? "Untitled bug";
}

function inferTitle(lines: string[], normalized: string): string {
  const impactLine = lines.find((line) => /(impacted|impact|outage|incident)/i.test(line));
  const serviceIdMatch = normalized.match(/service\s*id\s*[:#]?\s*([\d\s|,]+)/i);
  const vprnMatch = normalized.match(/\bvprn\s*[:#-]?\s*(\d+)\b/i);

  if (impactLine && (serviceIdMatch || vprnMatch)) {
    const serviceId = serviceIdMatch?.[1]?.replace(/\s+/g, " ").trim();
    const vprn = vprnMatch?.[1];
    if (vprn && serviceId) return `Outage impact check for VPRN ${vprn} (Service ID ${serviceId})`;
    if (vprn) return `Outage impact check for VPRN ${vprn}`;
    if (serviceId) return `Outage impact check for Service ID ${serviceId}`;
  }

  if (/\boutage\b/i.test(normalized)) {
    const location = normalized.match(/\b([a-z]{3}\d{2})\b/i)?.[1]?.toUpperCase();
    return location ? `Outage investigation for ${location} services` : "Service outage impact investigation";
  }

  return cleanLine(firstMeaningfulLine(lines));
}

function detectBrowser(normalized: string): string {
  const lower = normalized.toLowerCase();

  // Prefer explicit browser mentions to avoid false positives like hostnames (edge03.fra12)
  const explicit = lower.match(/\b(?:browser|using|in|on)\s+(chrome|firefox|safari|edge|opera|brave)\b/i);
  if (explicit?.[1]) {
    const value = explicit[1];
    return value[0].toUpperCase() + value.slice(1);
  }

  for (const browser of BROWSERS) {
    const pattern = new RegExp(`\\b${browser}\\b`, "i");
    if (pattern.test(normalized)) {
      return browser[0].toUpperCase() + browser.slice(1);
    }
  }

  return "Not specified";
}

function deriveIncidentSteps(normalized: string): string[] {
  const steps: string[] = [];

  if (/\boutage\b/i.test(normalized)) {
    steps.push("Identify the outage window and affected location/service.");
  }
  if (/desire\s*db/i.test(normalized)) {
    steps.push("Check Desire DB service placement data for the affected VPRN/service.");
  }
  if (/cli|edge/i.test(normalized)) {
    steps.push("Validate actual service placement directly on edge CLI.");
  }
  if (/mad|ams|fra\d+/i.test(normalized)) {
    steps.push("Compare reported locations versus actual active locations.");
  }
  if (/confirm|could you please confirm|verify/i.test(normalized)) {
    steps.push("Confirm whether data source mismatch or outage propagation caused the discrepancy.");
  }

  return steps.slice(0, 5);
}

function cleanLine(line: string): string {
  return line
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .trim();
}

function toSentence(value: string, fallback: string): string {
  const text = value.trim();
  if (!text) return fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function extractMarkdownSection(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s+${escaped}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = markdown.match(regex);
  return match?.[1]?.trim() ?? "";
}

function sanitizeInput(input: string): string {
  const hasTemplateHeadings = [
    "## Title",
    "## Description",
    "## Steps to Reproduce",
    "## Expected Result",
    "## Actual Result",
    "## Environment",
  ].filter((heading) => input.includes(heading)).length >= 3;

  if (!hasTemplateHeadings) return input;

  const description = extractMarkdownSection(input, "Description");
  if (!description) return input;

  // If the description itself contains nested template headings, strip them.
  return description
    .replace(/##\s+(Title|Issue Type|Priority|Description|Steps to Reproduce|Expected Result|Actual Result|Environment|Acceptance Criteria)\b/gi, " ")
    .replace(/-\s+(Browser|OS|Version|URL):\s*[^\n]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeIncidentDescription(normalized: string): string {
  const vprn = normalized.match(/\bvprn\s*[:#-]?\s*(\d+)\b/i)?.[1];
  const serviceIdsRaw = normalized.match(/service\s*id\s*[:#]?\s*([\d\s|,]+)/i)?.[1];
  const serviceIds = serviceIdsRaw?.replace(/\s+/g, " ").trim();
  const location = normalized.match(/\b([a-z]{3}\d{2})\b/i)?.[1]?.toUpperCase();
  const placementMismatch = /desire\s*db/i.test(normalized) && /cli/i.test(normalized);

  if (!/\boutage\b/i.test(normalized)) return normalized;

  const parts: string[] = [];
  if (vprn || serviceIds) {
    parts.push(
      `Reported outage impact investigation for ${
        vprn ? `VPRN ${vprn}` : "the affected service"
      }${serviceIds ? ` (Service ID ${serviceIds})` : ""}.`
    );
  } else {
    parts.push("Reported outage impact investigation for the affected cloud service.");
  }

  if (placementMismatch) {
    parts.push(
      "Desire DB indicates placement on additional edges, while direct edge CLI verification shows service presence only on expected locations."
    );
  }

  parts.push(
    `Need confirmation whether this is a data-consistency issue in Desire DB${
      location ? ` or an impact related to the ${location} outage` : " or outage-related propagation impact"
    }.`
  );

  return parts.join(" ");
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

function detectPriority(text: string): ParsedBugReport["priority"] {
  const lower = text.toLowerCase();
  if (/(production down|outage|data loss|payment failed|cannot login|can't login|crash on launch)/.test(lower)) return "Critical";
  if (/(blocked|cannot proceed|major|high impact|fails every time)/.test(lower)) return "High";
  if (/(minor|cosmetic|typo|low impact)/.test(lower)) return "Low";
  return "Medium";
}

function parseBugReport(input: string): ParsedBugReport {
  const sourceInput = sanitizeInput(input);
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sanitizedLines = sourceInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const normalized = sourceInput.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  const explicitExpected = lines.find((line) => /^(expected|should|expected result)[:\s]/i.test(line));
  const explicitActual = lines.find((line) => /^(actual|observed|actual result|instead)[:\s]/i.test(line));

  const numberedSteps = sanitizedLines
    .filter((line) => /^\d+[.)]\s+/.test(line))
    .map(cleanLine)
    .filter(Boolean);

  const placeholderSteps = [
    "open the affected page.",
    "perform the reported action.",
    "observe the issue.",
  ];

  const hasOnlyPlaceholderNumberedSteps =
    numberedSteps.length === placeholderSteps.length &&
    numberedSteps.every((step, index) => step.toLowerCase() === placeholderSteps[index]);

  const actionSentences = normalized
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\b(open|go to|navigate|click|tap|select|submit|enter|refresh|try)\b/i.test(sentence));

  const incidentSteps = deriveIncidentSteps(normalized);

  const steps = numberedSteps.length && !hasOnlyPlaceholderNumberedSteps
    ? numberedSteps
    : incidentSteps.length
      ? incidentSteps
    : actionSentences.slice(0, 5).map((sentence, index) =>
        index === 0 ? `Open the app/page and prepare the scenario (${sentence})` : sentence,
      );

  const browser = detectBrowser(normalized);
  const osMatch = OSS.find((os) => new RegExp(`\\b${os}\\b`, "i").test(normalized));
  const urlMatch = normalized.match(/https?:\/\/[^\s)]+/i);
  const versionMatch = normalized.match(/\b(v(?:ersion)?\s*\d+(?:\.\d+){0,3}|\d{1,3}(?:\.\d+){1,3})\b/i);

  const titleSource = explicitActual ?? inferTitle(sanitizedLines.length ? sanitizedLines : lines, normalized);
  const title = cleanLine(titleSource)
    .replace(/^(actual|observed|expected|description)\s*:\s*/i, "")
    .slice(0, 90);

  let expected = "Feature behaves as designed without errors.";
  let actual = "Unexpected behavior occurs.";

  if (explicitExpected) expected = cleanLine(explicitExpected.replace(/^(expected|should|expected result)\s*:\s*/i, ""));
  if (explicitActual) actual = cleanLine(explicitActual.replace(/^(actual|observed|actual result|instead)\s*:\s*/i, ""));

  if (!explicitExpected) {
    const shouldSentence = normalized.match(/\bshould\b[^.?!]*/i)?.[0];
    if (shouldSentence) expected = shouldSentence;
    else if (/\boutage\b/i.test(normalized)) {
      expected = "Service metadata and placement should remain consistent across systems during and after outage events.";
    }
  }

  if (!explicitActual) {
    const failureSentence = normalized.match(/\b(doesn'?t|does not|fails|failed|error|stuck|blank|nothing happens|crash(?:es|ed)?)\b[^.?!]*/i)?.[0];
    if (failureSentence) actual = failureSentence;
    else if (/\boutage\b/i.test(normalized) && /desire\s*db/i.test(normalized)) {
      actual = "Desire DB appears to report service placement on additional edges not confirmed via direct CLI checks.";
    } else if (/\boutage\b/i.test(normalized)) {
      actual = "Service behavior/data appears inconsistent after the reported outage window.";
    }
  }

  const priority = detectPriority(normalized);

  const description = /\boutage\b/i.test(normalized)
    ? summarizeIncidentDescription(normalized)
    : normalized;

  const redactedDescription = redactPeopleMentions(description);

  return {
    title: toSentence(title, "Untitled bug").replace(/[.!?]$/, ""),
    priority,
    description: redactedDescription,
    steps: steps.length ? steps.map((step) => toSentence(cleanLine(step), "")) : ["Open the affected page.", "Perform the reported action.", "Observe the issue."],
    expected: toSentence(expected, "Feature behaves as designed."),
    actual: toSentence(actual, "Unexpected behavior occurs."),
    environment: {
      browser,
      os: osMatch ? osMatch.toUpperCase() : "Not specified",
      appVersion: versionMatch ? versionMatch[0] : "Not specified",
      url: urlMatch ? urlMatch[0] : "Not specified",
    },
  };
}

function convertBugReport(input: string): string {
  const parsed = parseBugReport(input);

  const title = parsed.title.length > 80 ? `${parsed.title.slice(0, 77)}...` : parsed.title;
  const steps = parsed.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const isIncident = /\boutage|incident|impact investigation|service placement|desire db\b/i.test(
    `${parsed.title} ${parsed.description}`
  );

  const acceptanceCriteria = isIncident
    ? [
        "- [ ] System-of-record data (e.g., Desire DB) matches direct edge CLI verification for affected services",
        "- [ ] Unexpected service placement entries are corrected or explained with root cause",
        "- [ ] Outage impact scope is confirmed (affected vs unaffected locations/services)",
        "- [ ] Findings, remediation steps, and follow-up owner are documented for operations",
      ].join("\n")
    : [
        "- [ ] Repro steps no longer produce the issue",
        "- [ ] Expected result is met in the affected environment(s)",
        "- [ ] Regression checks pass on related flows",
        "- [ ] QA can verify with clear pass/fail outcome",
      ].join("\n");

  return `## Title
${title}

## Issue Type
Bug

## Priority
${parsed.priority}

## Description
${parsed.description}

## Steps to Reproduce
${steps}

## Expected Result
${parsed.expected}

## Actual Result
${parsed.actual}

## Environment
- Browser: ${parsed.environment.browser}
- OS: ${parsed.environment.os}
- Version: ${parsed.environment.appVersion}
- URL: ${parsed.environment.url}

## Acceptance Criteria
${acceptanceCriteria}`;
}



export default function BugReportConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState<TicketQualityResult | null>(null);

  useEffect(() => {
    // Reset for when AI mode is re-enabled
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setError("");
    // Always use local mode (AI mode not yet available)
    trackEvent("generator_run", { tool: "bug_report", mode: "local" });

    const generated = convertBugReport(input);
    const qualityResult = scoreBugReport(generated);
    setOutput(generated);
    setQuality(qualityResult);
    trackEvent("ticket_quality_scored", {
      tool: "bug_report",
      mode: "local",
      score: qualityResult.score,
      grade: qualityResult.grade,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", { tool: "bug_report", mode: "local", output_length: output.length });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste bug notes or a chat transcript
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. From Slack: login is broken in Chrome 124 on macOS. Steps: 1) open /login 2) enter valid credentials 3) click Login. Expected: dashboard opens. Actual: spinner runs forever."
          className="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-800 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: include steps, expected vs actual result, environment, and URL for better output.
        </p>
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
        disabled={!input.trim() || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Generating..." : "Generate Jira Ticket"}
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
                <p className="text-sm font-medium text-gray-700">Ticket Quality Score</p>
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
            <label className="text-sm font-medium text-gray-700">Generated Jira Ticket</label>
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
          <OutputFeedback tool="bug_report" mode="local" />
        </div>
      )}
    </div>
  );
}
