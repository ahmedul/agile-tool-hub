"use client";

import { useMemo, useState } from "react";

type DoneItem = {
  id: string;
  text: string;
};

type DoneSection = {
  title: string;
  items: DoneItem[];
};

const SECTIONS: DoneSection[] = [
  {
    title: "Code quality",
    items: [
      { id: "self-reviewed", text: "Code is self-reviewed before opening a pull request." },
      { id: "peer-reviewed", text: "Pull request is reviewed and approved by at least one peer." },
      { id: "lint-clean", text: "No new linting, formatting, or type errors are introduced." },
      { id: "simple-design", text: "Implementation follows existing patterns and avoids unnecessary complexity." },
    ],
  },
  {
    title: "Testing",
    items: [
      { id: "unit-tests", text: "Unit tests are added or updated for changed behavior." },
      { id: "integration-tests", text: "Integration or workflow tests cover the main user path." },
      { id: "regression-tested", text: "Known regression risks are tested manually or automatically." },
      { id: "edge-cases", text: "Error states, empty states, and permission cases are covered." },
    ],
  },
  {
    title: "Product acceptance",
    items: [
      { id: "acceptance-met", text: "All acceptance criteria are satisfied." },
      { id: "po-accepted", text: "Product owner or stakeholder has accepted the result." },
      { id: "copy-reviewed", text: "User-facing copy is accurate and understandable." },
      { id: "analytics-ready", text: "Important events, metrics, or logging are in place if needed." },
    ],
  },
  {
    title: "Release readiness",
    items: [
      { id: "docs-updated", text: "Docs, runbooks, or release notes are updated when needed." },
      { id: "deploy-safe", text: "Deployment and rollback path are understood." },
      { id: "observability", text: "Monitoring, alerts, or dashboards cover new critical behavior." },
      { id: "flag-cleanup", text: "Feature flags, migrations, and cleanup tasks are tracked." },
    ],
  },
];

export default function DefinitionOfDoneChecklist() {
  const [teamName, setTeamName] = useState("Team Definition of Done");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const allItems = SECTIONS.flatMap((section) => section.items);
  const progress = Math.round((checked.size / allItems.length) * 100);
  const status = progress >= 90 ? "Release ready" : progress >= 70 ? "Nearly done" : "Quality risk";

  const markdown = useMemo(() => {
    const lines = [
      `# ${teamName || "Team Definition of Done"}`,
      "",
      `Completion: ${progress}% - ${status}`,
      "",
    ];

    for (const section of SECTIONS) {
      lines.push(`## ${section.title}`);
      for (const item of section.items) {
        lines.push(`- [${checked.has(item.id) ? "x" : " "}] ${item.text}`);
      }
      lines.push("");
    }

    return lines.join("\n").trim();
  }, [checked, progress, status, teamName]);

  const toggleItem = (id: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setCopied(false);
  };

  const markAllDone = () => {
    setChecked(new Set(allItems.map((item) => item.id)));
  };

  const reset = () => {
    setChecked(new Set());
    setCopied(false);
  };

  const copyChecklist = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <label className="block">
          <span className="text-sm font-semibold text-gray-900">Checklist name</span>
          <input
            type="text"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">{status}</p>
          <div className="mt-3 h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-green-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{checked.size} of {allItems.length} checks complete</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">{section.title}</h2>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <label key={item.id} className="flex gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold text-gray-900">How to use this Definition of Done</h2>
        <p className="mt-2 text-sm text-gray-600">
          Treat this as a team working agreement. If a story fails one of these checks, it is not done yet.
          Keep the checklist short enough to use every sprint, then adjust it after retrospectives.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={markAllDone}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Mark all done
          </button>
          <button
            type="button"
            onClick={copyChecklist}
            className="rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
          >
            {copied ? "Copied" : "Copy checklist"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
