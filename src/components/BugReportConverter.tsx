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

function detectPriority(text: string): ParsedBugReport["priority"] {
  const lower = text.toLowerCase();
  if (/(production down|outage|data loss|payment failed|cannot login|can't login|crash on launch)/.test(lower)) return "Critical";
  if (/(blocked|cannot proceed|major|high impact|fails every time)/.test(lower)) return "High";
  if (/(minor|cosmetic|typo|low impact)/.test(lower)) return "Low";
  return "Medium";
}

function parseBugReport(input: string): ParsedBugReport {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const normalized = input.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  const explicitExpected = lines.find((line) => /^(expected|should|expected result)[:\s]/i.test(line));
  const explicitActual = lines.find((line) => /^(actual|observed|actual result|instead)[:\s]/i.test(line));

  const numberedSteps = lines
    .filter((line) => /^\d+[.)]\s+/.test(line))
    .map(cleanLine)
    .filter(Boolean);

  const actionSentences = normalized
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\b(open|go to|navigate|click|tap|select|submit|enter|refresh|try)\b/i.test(sentence));

  const steps = numberedSteps.length
    ? numberedSteps
    : actionSentences.slice(0, 5).map((sentence, index) =>
        index === 0 ? `Open the app/page and prepare the scenario (${sentence})` : sentence,
      );

  const browserMatch = BROWSERS.find((browser) => lower.includes(browser));
  const osMatch = OSS.find((os) => lower.includes(os));
  const urlMatch = normalized.match(/https?:\/\/[^\s)]+/i);
  const versionMatch = normalized.match(/\b(v(?:ersion)?\s*\d+(?:\.\d+){0,3}|\d{1,3}(?:\.\d+){1,3})\b/i);

  const titleSource = explicitActual ?? lines[0] ?? "Untitled bug";
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
  }

  if (!explicitActual) {
    const failureSentence = normalized.match(/\b(doesn'?t|does not|fails|failed|error|stuck|blank|nothing happens|crash(?:es|ed)?)\b[^.?!]*/i)?.[0];
    if (failureSentence) actual = failureSentence;
  }

  const priority = detectPriority(normalized);

  return {
    title: toSentence(title, "Untitled bug").replace(/[.!?]$/, ""),
    priority,
    description: normalized,
    steps: steps.length ? steps.map((step) => toSentence(cleanLine(step), "")) : ["Open the affected page.", "Perform the reported action.", "Observe the issue."],
    expected: toSentence(expected, "Feature behaves as designed."),
    actual: toSentence(actual, "Unexpected behavior occurs."),
    environment: {
      browser: browserMatch ? browserMatch[0].toUpperCase() + browserMatch.slice(1) : "Not specified",
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
- [ ] Repro steps no longer produce the issue
- [ ] Expected result is met in the affected environment(s)
- [ ] Regression checks pass on related flows
- [ ] QA can verify with clear pass/fail outcome`;
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
