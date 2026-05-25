"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import OutputFeedback from "@/components/OutputFeedback";

interface FormState {
  yesterday: string;
  today: string;
  blockers: string;
  context: string;
}

function toBullets(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const normalized = line.replace(/^[\-•*]\s*/, "").trim();
      if (!normalized) return [];
      return normalized
        .split(/\s*\|\s*|\s*;\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
    });
}

function parseTranscript(input: string): { yesterday: string[]; today: string[]; blockers: string[] } {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const yesterday: string[] = [];
  const today: string[] = [];
  const blockers: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[\-•*]\s*/, "").trim();

    if (/^(yesterday|done|completed)\s*:/i.test(line)) {
      yesterday.push(line.replace(/^(yesterday|done|completed)\s*:/i, "").trim());
      continue;
    }

    if (/^(today|next|plan)\s*:/i.test(line)) {
      today.push(line.replace(/^(today|next|plan)\s*:/i, "").trim());
      continue;
    }

    if (/^(blocker|blocked|risk|issue)\s*:/i.test(line)) {
      blockers.push(line.replace(/^(blocker|blocked|risk|issue)\s*:/i, "").trim());
      continue;
    }

    if (/\b(blocked|waiting on|dependency|cannot|can't)\b/i.test(line)) {
      blockers.push(line);
      continue;
    }

    if (today.length <= yesterday.length) {
      today.push(line);
    } else {
      yesterday.push(line);
    }
  }

  return {
    yesterday: yesterday.filter(Boolean),
    today: today.filter(Boolean),
    blockers: blockers.filter(Boolean),
  };
}

function formatSection(title: string, items: string[], fallback: string): string {
  if (items.length === 0) {
    return `## ${title}\n- ${fallback}`;
  }

  return `## ${title}\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function generateStandup(form: FormState): string {
  const transcript = parseTranscript(form.context);

  const yesterdayItems = [
    ...toBullets(form.yesterday),
    ...transcript.yesterday,
  ].slice(0, 8);

  const todayItems = [
    ...toBullets(form.today),
    ...transcript.today,
  ].slice(0, 8);

  const blockerItems = [
    ...toBullets(form.blockers),
    ...transcript.blockers,
  ].slice(0, 6);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return [
    `# Daily Standup Update (${dateLabel})`,
    "",
    formatSection("Yesterday", yesterdayItems, "No completed items added yet."),
    "",
    formatSection("Today", todayItems, "No planned items added yet."),
    "",
    formatSection("Blockers", blockerItems, "No blockers."),
    "",
    "## Support Needed",
    "- [ ] Reviewer needed",
    "- [ ] Product clarification needed",
    "- [ ] Dependency owner follow-up needed",
  ].join("\n");
}

export default function DailyStandupGenerator() {
  const [form, setForm] = useState<FormState>({
    yesterday: "",
    today: "",
    blockers: "",
    context: "",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = () => {
    trackEvent("generator_run", { tool: "daily_standup", mode: "local" });
    setOutput(generateStandup(form));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", { tool: "daily_standup", mode: "local", output_length: output.length });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="yesterday" className="block text-sm font-medium text-gray-700 mb-1">
            What did you complete yesterday?
          </label>
          <textarea
            id="yesterday"
            name="yesterday"
            value={form.yesterday}
            onChange={handleChange}
            placeholder="- Finished API auth middleware\n- Reviewed PR #142"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div>
          <label htmlFor="today" className="block text-sm font-medium text-gray-700 mb-1">
            What will you work on today?
          </label>
          <textarea
            id="today"
            name="today"
            value={form.today}
            onChange={handleChange}
            placeholder="- Implement pagination\n- Pair with QA on regression test"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </div>

      <div>
        <label htmlFor="blockers" className="block text-sm font-medium text-gray-700 mb-1">
          Any blockers or risks?
        </label>
        <textarea
          id="blockers"
          name="blockers"
          value={form.blockers}
          onChange={handleChange}
          placeholder="- Waiting on staging DB access\n- Need PM decision on scope"
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
          Optional: paste rough notes or transcript
        </label>
        <textarea
          id="context"
          name="context"
          value={form.context}
          onChange={handleChange}
          placeholder="Paste Slack notes or meeting transcript. The tool will auto-sort lines into Yesterday/Today/Blockers."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
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
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Generate Daily Standup
      </button>

      {output && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated Standup Update</label>
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
          <OutputFeedback tool="daily_standup" mode="local" />
        </div>
      )}
    </div>
  );
}
