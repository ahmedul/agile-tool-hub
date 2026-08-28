"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChecklistItem = {
  id: string;
  text: string;
  required?: boolean;
};

type ChecklistSection = {
  title: string;
  items: ChecklistItem[];
};

const SECTIONS: ChecklistSection[] = [
  {
    title: "Backlog readiness",
    items: [
      { id: "prioritized-backlog", text: "Top backlog items are prioritized by product value.", required: true },
      { id: "clear-acceptance", text: "Each candidate story has clear acceptance criteria.", required: true },
      { id: "story-sizes", text: "Large stories are split before planning.", required: true },
      { id: "dependencies-known", text: "Dependencies and blockers are visible before commitment." },
    ],
  },
  {
    title: "Team capacity",
    items: [
      { id: "team-availability", text: "Vacation, holidays, support rotation, and ceremonies are deducted.", required: true },
      { id: "velocity-reviewed", text: "Recent velocity is reviewed before choosing sprint scope.", required: true },
      { id: "buffer-included", text: "The plan includes a realistic buffer for unplanned work." },
      { id: "specialists-accounted", text: "Specialist availability is checked for QA, design, data, or security work." },
    ],
  },
  {
    title: "Sprint goal",
    items: [
      { id: "goal-written", text: "The sprint goal is written in one clear sentence.", required: true },
      { id: "goal-connected", text: "Selected stories support the sprint goal.", required: true },
      { id: "tradeoffs-clear", text: "The team knows which items can move out if scope changes." },
      { id: "demo-outcome", text: "The team knows what can be shown in sprint review." },
    ],
  },
  {
    title: "Commitment",
    items: [
      { id: "questions-answered", text: "Open product, technical, and testing questions are answered.", required: true },
      { id: "owners-clear", text: "Initial owners or pairing plans are clear." },
      { id: "dod-agreed", text: "Definition of Done is understood for this sprint.", required: true },
      { id: "commitment-confirmed", text: "The team explicitly agrees the sprint plan is realistic.", required: true },
    ],
  },
];

const REQUIRED_IDS = SECTIONS.flatMap((section) => section.items)
  .filter((item) => item.required)
  .map((item) => item.id);

export default function SprintPlanningChecklist() {
  const [sprintName, setSprintName] = useState("Sprint 1");
  const [sprintGoal, setSprintGoal] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);
  const skipNextWrite = useRef(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tool-draft-sprint-planning-checklist") || "null") as { sprintName?: string; sprintGoal?: string; capacity?: string; checked?: string[] } | null;
      if (saved) {
        queueMicrotask(() => {
          if (saved.sprintName) setSprintName(saved.sprintName);
          if (saved.sprintGoal !== undefined) setSprintGoal(saved.sprintGoal);
          if (saved.capacity !== undefined) setCapacity(saved.capacity);
          if (saved.checked) setChecked(new Set(saved.checked));
        });
      }
    } catch {
      // Keep the checklist usable if the saved draft is unavailable.
    } finally {
      hydrated.current = true;
      skipNextWrite.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current || skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    localStorage.setItem("tool-draft-sprint-planning-checklist", JSON.stringify({ sprintName, sprintGoal, capacity, checked: [...checked] }));
  }, [sprintName, sprintGoal, capacity, checked]);

  const allItems = SECTIONS.flatMap((section) => section.items);
  const checkedCount = checked.size;
  const progress = Math.round((checkedCount / allItems.length) * 100);
  const requiredComplete = REQUIRED_IDS.every((id) => checked.has(id));
  const status = requiredComplete ? "Ready for commitment" : "Needs more planning";

  const markdown = useMemo(() => {
    const lines = [
      "# Sprint Planning Checklist",
      "",
      `Sprint: ${sprintName || "[Sprint name]"}`,
      `Sprint goal: ${sprintGoal || "[Write the sprint goal]"}`,
      `Planned capacity: ${capacity || "[Capacity]"} story points`,
      `Readiness: ${progress}% - ${status}`,
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
  }, [capacity, checked, progress, sprintGoal, sprintName, status]);

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

  const checkRequired = () => {
    setChecked((current) => new Set([...current, ...REQUIRED_IDS]));
  };

  const resetChecklist = () => {
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
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-gray-900">Sprint name</span>
          <input
            type="text"
            value={sprintName}
            onChange={(event) => setSprintName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-900">Capacity</span>
          <input
            type="number"
            min={0}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">{status}</p>
          <div className="mt-3 h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{checkedCount} of {allItems.length} checks complete</p>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-gray-900">Sprint goal</span>
        <textarea
          value={sprintGoal}
          onChange={(event) => setSprintGoal(event.target.value)}
          rows={3}
          placeholder="Improve checkout reliability by reducing failed payment retries and improving error handling."
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

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
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    {item.text}
                    {item.required ? <span className="ml-2 text-xs font-semibold text-blue-700">Required</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-5">
        <button
          type="button"
          onClick={checkRequired}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Check required items
        </button>
        <button
          type="button"
          onClick={copyChecklist}
          className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
        >
          {copied ? "Copied" : "Copy checklist"}
        </button>
        <button
          type="button"
          onClick={resetChecklist}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
