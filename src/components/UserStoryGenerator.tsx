"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/subscription";

type StoryType = "feature" | "improvement" | "task";
type Priority = "High" | "Medium" | "Low";
type GenerationMode = "local" | "ai";

interface FormState {
  featureDescription: string;
  userType: string;
  storyType: StoryType;
  priority: Priority;
}

interface ParsedStoryInput {
  user: string;
  goal: string;
  benefit: string;
  constraints: string[];
  dependencies: string[];
}

function trimToSentence(text: string, fallback: string): string {
  const value = text.trim();
  if (!value) return fallback;
  return value.replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ");
}

function parseStoryInput(featureDescription: string, userType: string): ParsedStoryInput {
  const normalized = featureDescription.replace(/\s+/g, " ").trim();
  const lines = featureDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const userFromText =
    normalized.match(/\bas an?\s+([^,.;]+)/i)?.[1] ??
    normalized.match(/\bfor\s+([^,.;]+?)\s+(?:to|who|when)/i)?.[1] ??
    userType;

  const goalFromText =
    normalized.match(/\bi want to\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bneed to\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bshould be able to\s+([^.;]+)/i)?.[1] ??
    normalized;

  const benefitFromText =
    normalized.match(/\bso that\s+([^.;]+)/i)?.[1] ??
    normalized.match(/\bbecause\s+([^.;]+)/i)?.[1] ??
    "the user can complete the job faster with fewer errors";

  const constraints = lines
    .filter((line) => /(must|should|cannot|can't|only|within|without|except|limit)/i.test(line))
    .slice(0, 4)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const dependencies = lines
    .filter((line) => /(depends on|blocked by|requires|needs|integration|api|design)/i.test(line))
    .slice(0, 3)
    .map((line) => line.replace(/^[-*]\s*/, ""));

  return {
    user: trimToSentence(userFromText ?? "", "user"),
    goal: trimToSentence(goalFromText ?? "", "complete the workflow"),
    benefit: trimToSentence(benefitFromText ?? "", "the user can complete the job faster with fewer errors"),
    constraints,
    dependencies,
  };
}

function generateUserStory(form: FormState): string {
  const { featureDescription, userType, storyType, priority } = form;
  const parsed = parseStoryInput(featureDescription, userType);
  const user = parsed.user;
  const desc = parsed.goal;
  const benefit = parsed.benefit;

  // Derive a concise title from the description
  const title = desc.length > 80 ? desc.slice(0, 77) + "..." : desc;

  const issueTypeLabel =
    storyType === "feature" ? "Story" : storyType === "improvement" ? "Improvement" : "Task";

  return `## Title
As a ${user}, I want to ${title}

## Issue Type
${issueTypeLabel}

## Priority
${priority}

## User Story
As a ${user},
I want to ${desc},
So that ${benefit}.

## Story Points
[ ] 1  [ ] 2  [ ] 3  [ ] 5  [ ] 8

## Acceptance Criteria
- [ ] Given a ${user} with required permissions, when they ${desc}, then the expected value is returned in the UI
- [ ] Given invalid or incomplete input, when the ${user} attempts this flow, then a clear validation message is shown
- [ ] Given a dependency failure (API/network), when the ${user} retries, then failure is handled without data loss
- [ ] Analytics/audit event is recorded for this action (if required by product)
- [ ] The flow meets accessibility baseline (keyboard + screen reader labels)

## Out of Scope
${parsed.constraints.length ? parsed.constraints.map((item) => `- ${item}`).join("\n") : "- [List anything explicitly NOT included in this story]"}

## Dependencies
${parsed.dependencies.length ? parsed.dependencies.map((item) => `- ${item}`).join("\n") : "- [List any blockers, related tickets, or external dependencies]"}

## Notes
- Source context pasted by author:
${featureDescription.trim()}`;
}

export default function UserStoryGenerator() {
  const [form, setForm] = useState<FormState>({
    featureDescription: "",
    userType: "",
    storyType: "feature",
    priority: "Medium",
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

    if (mode === "local") {
      setOutput(generateUserStory(form));
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
          tool: "user-story",
          input: form.featureDescription,
          options: {
            storyType: form.storyType,
            priority: form.priority,
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Feature description */}
      <div>
        <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
          What does this feature do? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="e.g. Paste chat: PM wants users to filter product list by category and price. Must work on mobile. Depends on search API v2."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">You can write a short sentence or paste a transcript from Slack/meeting notes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* User type */}
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
            placeholder="e.g. logged-in user"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Story type */}
        <div>
          <label htmlFor="storyType" className="block text-sm font-medium text-gray-700 mb-1">
            Story type
          </label>
          <select
            id="storyType"
            name="storyType"
            value={form.storyType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="feature">Story (new feature)</option>
            <option value="improvement">Improvement</option>
            <option value="task">Task</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
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
        {loading ? "Generating..." : mode === "ai" ? "Generate with AI" : "Generate User Story"}
      </button>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated User Story</label>
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
        </div>
      )}
    </div>
  );
}
