"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FeedbackKind = "worked" | "issue" | "feature";

interface ToolFeedbackPanelProps {
  toolName: string;
  toolSlug: string;
}

const feedbackOptions: Array<{
  id: FeedbackKind;
  label: string;
  description: string;
}> = [
  {
    id: "worked",
    label: "Works well",
    description: "Tell us this tool is useful as-is.",
  },
  {
    id: "issue",
    label: "Bug or confusing result",
    description: "Report something broken, unclear, or misleading.",
  },
  {
    id: "feature",
    label: "Feature request",
    description: "Suggest an improvement for this tool.",
  },
];

export default function ToolFeedbackPanel({ toolName, toolSlug }: ToolFeedbackPanelProps) {
  const [selected, setSelected] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const pageUrl = `https://agiletoolhub.com/tools/${toolSlug}`;

  const selectedOption = feedbackOptions.find((option) => option.id === selected);
  const trimmedMessage = message.trim();
  const issueTitle = selectedOption
    ? `${toolName} feedback: ${selectedOption.label}`
    : `${toolName} feedback`;

  const githubIssueUrl = useMemo(() => {
    const body = [
      `Tool: ${toolName}`,
      `Page: ${pageUrl}`,
      `Feedback type: ${selectedOption?.label ?? "Not selected"}`,
      "",
      "What happened or what should improve?",
      trimmedMessage || "[Add details here]",
    ].join("\n");

    const params = new URLSearchParams({
      title: issueTitle,
      body,
    });

    return `https://github.com/ahmedul/agile-tool-hub/issues/new?${params.toString()}`;
  }, [issueTitle, pageUrl, selectedOption?.label, toolName, trimmedMessage]);

  function selectFeedback(kind: FeedbackKind) {
    setSelected(kind);
    setSubmitted(false);
    trackEvent("tool_feedback_selected", {
      tool: toolSlug,
      feedback_type: kind,
    });
  }

  function submitQuickFeedback() {
    if (!selected) return;

    trackEvent("tool_feedback_submitted", {
      tool: toolSlug,
      feedback_type: selected,
      has_details: trimmedMessage.length > 0,
      detail_length: Math.min(trimmedMessage.length, 500),
    });
    setSubmitted(true);
  }

  function trackDetailedRequest() {
    if (!selected) return;

    trackEvent("tool_feedback_github_issue_opened", {
      tool: toolSlug,
      feedback_type: selected,
      has_details: trimmedMessage.length > 0,
    });
  }

  return (
    <section className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Improve this tool
        </span>
        <h2 className="text-xl font-bold text-gray-900">How should we improve {toolName}?</h2>
        <p className="max-w-2xl text-sm text-gray-600">
          Quick feedback helps decide what to build next. No login is required for the quick vote.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {feedbackOptions.map((option) => {
          const active = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectFeedback(option.id)}
              className={[
                "rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-blue-600 bg-white text-blue-900"
                  : "border-blue-100 bg-white/70 text-gray-700 hover:border-blue-300 hover:bg-white",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs text-gray-500">{option.description}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-5 rounded-lg border border-blue-100 bg-white p-4">
          <label htmlFor={`${toolSlug}-feedback`} className="block text-sm font-semibold text-gray-800">
            Optional details
          </label>
          <textarea
            id={`${toolSlug}-feedback`}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value.slice(0, 600));
              setSubmitted(false);
            }}
            placeholder="Example: Add a meeting-time deduction field, or explain how velocity per day should be chosen."
            rows={3}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              Quick feedback records the category only. Detailed requests open a prefilled GitHub issue.
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitQuickFeedback}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Submit quick feedback
              </button>
              <a
                href={githubIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackDetailedRequest}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                Open detailed request
              </a>
            </div>
          </div>

          {submitted && (
            <p className="mt-3 text-sm font-medium text-green-700">
              Thanks. We will use this signal to decide which tool improvements to build next.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
