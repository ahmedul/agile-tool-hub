"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import OutputFeedback from "@/components/OutputFeedback";

type StandupMode = "individual" | "team";
type OutputFormat = "markdown" | "jira";

interface FormState {
  yesterday: string;
  today: string;
  blockers: string;
  context: string;
}

interface TeamMemberUpdate {
  id: number;
  name: string;
  yesterday: string;
  today: string;
  blockers: string;
}

const DEFAULT_TEAM_MEMBERS: TeamMemberUpdate[] = [
  { id: 1, name: "Engineer 1", yesterday: "", today: "", blockers: "" },
  { id: 2, name: "Engineer 2", yesterday: "", today: "", blockers: "" },
];

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

function formatJiraSection(title: string, items: string[], fallback: string): string {
  if (items.length === 0) {
    return `h3. ${title}\n* ${fallback}`;
  }

  return `h3. ${title}\n${items.map((item) => `* ${item}`).join("\n")}`;
}

function extractIndividualSections(form: FormState): { yesterday: string[]; today: string[]; blockers: string[] } {
  const transcript = parseTranscript(form.context);

  return {
    yesterday: [
    ...toBullets(form.yesterday),
    ...transcript.yesterday,
  ].slice(0, 8),
    today: [
    ...toBullets(form.today),
    ...transcript.today,
  ].slice(0, 8),
    blockers: [
    ...toBullets(form.blockers),
    ...transcript.blockers,
  ].slice(0, 6),
  };
}

function getDateLabel(): string {
  const today = new Date();
  return today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildIndividualMarkdown(form: FormState): string {
  const sections = extractIndividualSections(form);
  const dateLabel = getDateLabel();

  return [
    `# Daily Standup Update (${dateLabel})`,
    "",
    formatSection("Yesterday", sections.yesterday, "No completed items added yet."),
    "",
    formatSection("Today", sections.today, "No planned items added yet."),
    "",
    formatSection("Blockers", sections.blockers, "No blockers."),
    "",
    "## Support Needed",
    "- [ ] Reviewer needed",
    "- [ ] Product clarification needed",
    "- [ ] Dependency owner follow-up needed",
  ].join("\n");
}

function buildIndividualJira(form: FormState): string {
  const sections = extractIndividualSections(form);
  const dateLabel = getDateLabel();

  return [
    `h2. Daily Standup Update (${dateLabel})`,
    "",
    formatJiraSection("Yesterday", sections.yesterday, "No completed items added yet."),
    "",
    formatJiraSection("Today", sections.today, "No planned items added yet."),
    "",
    formatJiraSection("Blockers", sections.blockers, "No blockers."),
    "",
    "h3. Support Needed",
    "* Reviewer needed",
    "* Product clarification needed",
    "* Dependency owner follow-up needed",
  ].join("\n");
}

function buildTeamMarkdown(members: TeamMemberUpdate[]): string {
  const dateLabel = getDateLabel();
  const populatedMembers = members.filter((member) => {
    return [member.yesterday, member.today, member.blockers].some((value) => value.trim().length > 0);
  });

  const membersToRender = populatedMembers.length > 0 ? populatedMembers : members;

  return [
    `# Team Daily Standup (${dateLabel})`,
    "",
    ...membersToRender.flatMap((member) => {
      const yesterday = toBullets(member.yesterday).slice(0, 6);
      const today = toBullets(member.today).slice(0, 6);
      const blockers = toBullets(member.blockers).slice(0, 4);

      return [
        `## ${member.name || "Unnamed Member"}`,
        "",
        `- Yesterday: ${yesterday.length ? yesterday.join(" | ") : "No updates."}`,
        `- Today: ${today.length ? today.join(" | ") : "No updates."}`,
        `- Blockers: ${blockers.length ? blockers.join(" | ") : "No blockers."}`,
        "",
      ];
    }),
    "## Team Support Needed",
    "- [ ] Cross-team dependency owner updates",
    "- [ ] Reviewer assignment confirmation",
    "- [ ] Scope clarifications from product",
  ].join("\n");
}

function buildTeamJira(members: TeamMemberUpdate[]): string {
  const dateLabel = getDateLabel();
  const populatedMembers = members.filter((member) => {
    return [member.yesterday, member.today, member.blockers].some((value) => value.trim().length > 0);
  });

  const membersToRender = populatedMembers.length > 0 ? populatedMembers : members;

  return [
    `h2. Team Daily Standup (${dateLabel})`,
    "",
    ...membersToRender.flatMap((member) => {
      const yesterday = toBullets(member.yesterday).slice(0, 6);
      const today = toBullets(member.today).slice(0, 6);
      const blockers = toBullets(member.blockers).slice(0, 4);

      return [
        `h3. ${member.name || "Unnamed Member"}`,
        `* Yesterday: ${yesterday.length ? yesterday.join(" | ") : "No updates."}`,
        `* Today: ${today.length ? today.join(" | ") : "No updates."}`,
        `* Blockers: ${blockers.length ? blockers.join(" | ") : "No blockers."}`,
        "",
      ];
    }),
    "h3. Team Support Needed",
    "* Cross-team dependency owner updates",
    "* Reviewer assignment confirmation",
    "* Scope clarifications from product",
  ].join("\n");
}

function generateStandup(form: FormState, members: TeamMemberUpdate[], standupMode: StandupMode, outputFormat: OutputFormat): string {
  if (standupMode === "team") {
    return outputFormat === "jira" ? buildTeamJira(members) : buildTeamMarkdown(members);
  }

  return outputFormat === "jira" ? buildIndividualJira(form) : buildIndividualMarkdown(form);
}

export default function DailyStandupGenerator() {
  const [form, setForm] = useState<FormState>({
    yesterday: "",
    today: "",
    blockers: "",
    context: "",
  });
  const [standupMode, setStandupMode] = useState<StandupMode>("individual");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [teamMembers, setTeamMembers] = useState<TeamMemberUpdate[]>(DEFAULT_TEAM_MEMBERS);
  const [nextMemberId, setNextMemberId] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateTeamMember = (
    id: number,
    field: "name" | "yesterday" | "today" | "blockers",
    value: string
  ) => {
    setTeamMembers((prev) => prev.map((member) => (member.id === id ? { ...member, [field]: value } : member)));
  };

  const addTeamMember = () => {
    setTeamMembers((prev) => [...prev, { id: nextMemberId, name: `Engineer ${nextMemberId}`, yesterday: "", today: "", blockers: "" }]);
    setNextMemberId((prev) => prev + 1);
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((member) => member.id !== id);
    });
  };

  const handleGenerate = () => {
    trackEvent("generator_run", {
      tool: "daily_standup",
      mode: "local",
      standup_mode: standupMode,
      output_format: outputFormat,
      team_size: standupMode === "team" ? teamMembers.length : 1,
    });
    setOutput(generateStandup(form, teamMembers, standupMode, outputFormat));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    trackEvent("output_copy", {
      tool: "daily_standup",
      mode: "local",
      output_length: output.length,
      standup_mode: standupMode,
      output_format: outputFormat,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 p-3 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">Standup mode</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStandupMode("individual")}
              className={[
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                standupMode === "individual"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setStandupMode("team")}
              className={[
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                standupMode === "team"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              Team
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">Output format</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOutputFormat("markdown")}
              className={[
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                outputFormat === "markdown"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setOutputFormat("jira")}
              className={[
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                outputFormat === "jira"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              Jira Wiki
            </button>
          </div>
        </div>
      </div>

      {standupMode === "individual" ? (
        <>
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
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Team member updates</h3>
            <button
              type="button"
              onClick={addTeamMember}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add member
            </button>
          </div>

          {teamMembers.map((member) => (
            <div key={member.id} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                  placeholder="Engineer name"
                  className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="text-sm px-2.5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <textarea
                  value={member.yesterday}
                  onChange={(e) => updateTeamMember(member.id, "yesterday", e.target.value)}
                  placeholder="Yesterday updates"
                  className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <textarea
                  value={member.today}
                  onChange={(e) => updateTeamMember(member.id, "today", e.target.value)}
                  placeholder="Today plan"
                  className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <textarea
                  value={member.blockers}
                  onChange={(e) => updateTeamMember(member.id, "blockers", e.target.value)}
                  placeholder="Blockers"
                  className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
        Generate {standupMode === "team" ? "Team" : "Daily"} Standup
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
