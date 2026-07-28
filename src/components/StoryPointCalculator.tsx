"use client";

import { useMemo, useState } from "react";

type FactorKey = "effort" | "complexity" | "uncertainty" | "risk" | "dependencies";

type FactorOption = {
  label: string;
  score: number;
  description: string;
};

type Factor = {
  key: FactorKey;
  label: string;
  help: string;
  options: FactorOption[];
};

const FACTORS: Factor[] = [
  {
    key: "effort",
    label: "Effort",
    help: "How much implementation work is involved?",
    options: [
      { label: "Tiny", score: 0, description: "Small config, copy, or one-line change." },
      { label: "Small", score: 1, description: "One component, endpoint, or clear task." },
      { label: "Medium", score: 2, description: "Several files or coordinated changes." },
      { label: "Large", score: 3, description: "Multiple areas or meaningful refactoring." },
    ],
  },
  {
    key: "complexity",
    label: "Complexity",
    help: "How much design or technical reasoning is needed?",
    options: [
      { label: "Routine", score: 0, description: "The team has done this many times." },
      { label: "Known", score: 1, description: "Mostly familiar with minor decisions." },
      { label: "Tricky", score: 2, description: "Requires tradeoffs or edge-case handling." },
      { label: "Complex", score: 3, description: "New patterns, architecture, or deep domain work." },
    ],
  },
  {
    key: "uncertainty",
    label: "Uncertainty",
    help: "How many unknowns remain before work starts?",
    options: [
      { label: "Clear", score: 0, description: "Acceptance criteria are specific and testable." },
      { label: "Minor", score: 1, description: "A few details need confirmation." },
      { label: "Some", score: 2, description: "Requirements need refinement before commit." },
      { label: "High", score: 3, description: "Discovery or spike work is still needed." },
    ],
  },
  {
    key: "risk",
    label: "Risk",
    help: "What could break if this work goes wrong?",
    options: [
      { label: "Low", score: 0, description: "Limited user or system impact." },
      { label: "Moderate", score: 1, description: "Visible workflow, easy rollback." },
      { label: "High", score: 2, description: "Revenue, data, security, or migration impact." },
      { label: "Critical", score: 3, description: "Production stability or compliance impact." },
    ],
  },
  {
    key: "dependencies",
    label: "Dependencies",
    help: "How much does the story rely on other people or systems?",
    options: [
      { label: "None", score: 0, description: "Team can start and finish independently." },
      { label: "One", score: 1, description: "One known dependency or review path." },
      { label: "Several", score: 2, description: "Multiple teams, APIs, or approvals." },
      { label: "Blocked", score: 3, description: "Work cannot start without external input." },
    ],
  },
];

const INITIAL_VALUES: Record<FactorKey, number> = {
  effort: 1,
  complexity: 1,
  uncertainty: 1,
  risk: 0,
  dependencies: 0,
};

function estimateStoryPoints(score: number) {
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 7) return 3;
  if (score <= 10) return 5;
  if (score <= 13) return 8;
  if (score <= 16) return 13;
  return 21;
}

function getConfidence(score: number) {
  if (score <= 4) return "High";
  if (score <= 9) return "Medium";
  if (score <= 13) return "Low";
  return "Very low";
}

export default function StoryPointCalculator() {
  const [summary, setSummary] = useState("");
  const [values, setValues] = useState<Record<FactorKey, number>>(INITIAL_VALUES);
  const [copied, setCopied] = useState(false);

  const totalScore = useMemo(
    () => Object.values(values).reduce((sum, value) => sum + value, 0),
    [values],
  );
  const estimate = estimateStoryPoints(totalScore);
  const confidence = getConfidence(totalScore);
  const highFactors = FACTORS.filter((factor) => values[factor.key] >= 2).map((factor) => factor.label);

  const markdown = useMemo(() => {
    const lines = [
      "## Story Point Estimate",
      "",
      `Story: ${summary.trim() || "[add story summary]"}`,
      `Recommended estimate: ${estimate} story points`,
      `Confidence: ${confidence}`,
      "",
      "### Sizing factors",
      ...FACTORS.map((factor) => {
        const option = factor.options.find((item) => item.score === values[factor.key]);
        return `- ${factor.label}: ${option?.label ?? "Unknown"} - ${option?.description ?? ""}`;
      }),
    ];

    if (estimate >= 13) {
      lines.push("", "### Recommendation", "Split this story before sprint commitment. A 13+ point story has enough risk or uncertainty to hide multiple smaller deliverables.");
    }

    return lines.join("\n");
  }, [confidence, estimate, summary, values]);

  const updateValue = (key: FactorKey, score: number) => {
    setValues((current) => ({ ...current, [key]: score }));
    setCopied(false);
  };

  const copyEstimate = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <label htmlFor="story-summary" className="block text-sm font-semibold text-gray-900 mb-2">
          Story summary
        </label>
        <textarea
          id="story-summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          placeholder="As a returning customer, I want to filter saved payment methods so I can find the right card faster."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {FACTORS.map((factor) => (
          <div key={factor.key} className="border border-gray-200 rounded-lg bg-white p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-semibold text-gray-900">{factor.label}</h2>
              <p className="text-sm text-gray-500">{factor.help}</p>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              {factor.options.map((option) => {
                const selected = values[factor.key] === option.score;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => updateValue(factor.key, option.score)}
                    className={[
                      "rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-5 text-center">
          <p className="text-sm font-semibold text-blue-700">Recommended estimate</p>
          <p className="mt-2 text-6xl font-bold text-blue-800">{estimate}</p>
          <p className="mt-1 text-sm text-blue-700">story points</p>
          <p className="mt-4 text-sm text-blue-900">Confidence: {confidence}</p>
        </div>
        <div className="border border-gray-200 bg-white rounded-lg p-5">
          <h2 className="font-semibold text-gray-900">Planning guidance</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            {highFactors.length > 0 ? (
              <p>
                Discuss {highFactors.join(", ").toLowerCase()} before committing. These factors are adding the most risk to the estimate.
              </p>
            ) : (
              <p>This story looks well understood. Use the estimate as a starting point for team discussion.</p>
            )}
            {estimate >= 13 ? (
              <p>Split this story into smaller user-visible slices before sprint planning.</p>
            ) : (
              <p>Confirm acceptance criteria, testing approach, and rollout expectations before finalizing the estimate.</p>
            )}
          </div>
          <button
            type="button"
            onClick={copyEstimate}
            className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? "Copied" : "Copy estimate"}
          </button>
        </div>
      </div>
    </div>
  );
}
