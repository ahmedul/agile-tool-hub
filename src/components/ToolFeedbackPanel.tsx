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
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const [detailedStatus, setDetailedStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [detailedMessage, setDetailedMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const pageUrl = `https://agiletoolhub.com/tools/${toolSlug}`;

  const selectedOption = feedbackOptions.find((option) => option.id === selected);
  const trimmedMessage = message.trim();
  const canSendDetailed = selected === "issue" || selected === "feature";
  const issueTitle = selectedOption
    ? `${selectedOption.label}: ${toolName}`
    : `${toolName} feedback`;

  const githubIssueUrl = useMemo(() => {
    const body = [
      "## Feedback",
      "",
      `- Tool: ${toolName}`,
      `- Page: ${pageUrl}`,
      `- Type: ${selectedOption?.label ?? "Not selected"}`,
      "",
      "## Details",
      "",
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
    setQuickSubmitted(false);
    setDetailedStatus("idle");
    setDetailedMessage("");
    setIssueUrl("");
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
    });
    setQuickSubmitted(true);
    setDetailedStatus("idle");
    setDetailedMessage("");
    setIssueUrl("");
  }

  async function sendDetailedRequest() {
    if (!canSendDetailed || detailedStatus === "sending") return;

    if (trimmedMessage.length < 10) {
      setDetailedStatus("error");
      setDetailedMessage("Add a short description before sending a detailed request.");
      setIssueUrl(githubIssueUrl);
      return;
    }

    setDetailedStatus("sending");
    setDetailedMessage("");
    setIssueUrl("");

    trackEvent("tool_feedback_detail_submit_attempt", {
      tool: toolSlug,
      feedback_type: selected,
      has_details: trimmedMessage.length > 0,
    });

    try {
      const response = await fetch("/api/tool-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName,
          toolSlug,
          feedbackType: selected,
          message: trimmedMessage,
        }),
      });

      const data = (await response.json()) as {
        issueUrl?: string;
        fallbackUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        setDetailedStatus("error");
        setDetailedMessage(
          data.error === "Feedback storage is not configured."
            ? "Automatic detailed requests are not configured yet. Use the prefilled GitHub issue link instead."
            : data.error || "Could not send the detailed request.",
        );
        setIssueUrl(data.fallbackUrl || githubIssueUrl);
        trackEvent("tool_feedback_detail_failed", {
          tool: toolSlug,
          feedback_type: selected,
          status: response.status,
        });
        return;
      }

      setDetailedStatus("sent");
      setDetailedMessage("Detailed request sent.");
      setIssueUrl(data.issueUrl || githubIssueUrl);
      setQuickSubmitted(false);
      trackEvent("tool_feedback_detail_submitted", {
        tool: toolSlug,
        feedback_type: selected,
      });
    } catch {
      setDetailedStatus("error");
      setDetailedMessage("Could not send automatically. Use the prefilled GitHub issue link instead.");
      setIssueUrl(githubIssueUrl);
      trackEvent("tool_feedback_detail_failed", {
        tool: toolSlug,
        feedback_type: selected,
        status: 0,
      });
    }
  }

  return (
    <section className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-blue-700">
            Feedback
          </span>
          <span className="mt-1 block text-base font-semibold text-gray-900">
            Help improve {toolName}
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-blue-700">
          {expanded ? "Hide" : "Give feedback"}
        </span>
      </button>

      {expanded && <div className="mt-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Improve this tool
        </span>
        <h2 className="text-xl font-bold text-gray-900">How should we improve {toolName}?</h2>
        <p className="max-w-2xl text-sm text-gray-600">
          Quick votes help decide what to build next. Detailed requests can send your written note to the backlog.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {feedbackOptions.map((option) => {
          const active = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
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
          {canSendDetailed ? (
            <>
              <label htmlFor={`${toolSlug}-feedback`} className="block text-sm font-semibold text-gray-800">
                Details to send
              </label>
              <textarea
                id={`${toolSlug}-feedback`}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value.slice(0, 600));
                  setQuickSubmitted(false);
                  setDetailedStatus("idle");
                  setDetailedMessage("");
                  setIssueUrl("");
                }}
                placeholder="Example: Add a meeting-time deduction field, or explain how velocity per day should be chosen."
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Submit a vote only if this tool works well. No written message is needed.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              {canSendDetailed
                ? "Submit vote only records the category. Send detailed request sends your note to the backlog."
                : "Submit vote only records the category. It does not create a request."}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitQuickFeedback}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Submit vote only
              </button>
              {canSendDetailed && (
                <button
                  type="button"
                  onClick={sendDetailedRequest}
                  disabled={detailedStatus === "sending"}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {detailedStatus === "sending" ? "Sending..." : "Send detailed request"}
                </button>
              )}
            </div>
          </div>

          {quickSubmitted && (
            <p className="mt-3 text-sm font-medium text-green-700" role="status">
              Vote submitted. Written details were not sent.
            </p>
          )}

          {detailedMessage && (
            <p
              className={
                detailedStatus === "sent"
                  ? "mt-3 text-sm font-medium text-green-700"
                  : "mt-3 text-sm font-medium text-red-700"
              }
              role={detailedStatus === "sent" ? "status" : "alert"}
            >
              {detailedMessage}
            </p>
          )}

          {issueUrl && (
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
            >
              {detailedStatus === "sent" ? "View GitHub issue" : "Open prefilled GitHub issue"}
            </a>
          )}
        </div>
      )}
      </div>}
    </section>
  );
}
