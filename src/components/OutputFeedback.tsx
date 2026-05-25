"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface OutputFeedbackProps {
  tool: "user_story" | "acceptance_criteria" | "bug_report" | "daily_standup";
  mode: "local" | "ai";
}

export default function OutputFeedback({ tool, mode }: OutputFeedbackProps) {
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(value: "yes" | "no") {
    setSelected(value);
    trackEvent("output_feedback", {
      tool,
      mode,
      useful: value,
    });
  }

  function submitTextFeedback() {
    if (feedbackText.trim()) {
      trackEvent("feedback_text_submitted", {
        tool,
        mode,
        text: feedbackText.slice(0, 200), // truncate to 200 chars for privacy
      });
    }
    setSubmitted(true);
    setTimeout(() => {
      setFeedbackText("");
      setSelected(null);
      setSubmitted(false);
    }, 2000);
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Was this output useful?</span>
        <button
          type="button"
          onClick={() => submit("yes")}
          className={`px-2.5 py-1 rounded border transition-colors ${
            selected === "yes"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => submit("no")}
          className={`px-2.5 py-1 rounded border transition-colors ${
            selected === "no"
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          No
        </button>
        {selected && <span className="text-xs text-gray-500">Thanks for the feedback.</span>}
      </div>

      {selected === "no" && !submitted && (
        <div className="ml-0 space-y-2 rounded-md bg-gray-50 p-3 border border-gray-200">
          <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700">
            What was missing or incorrect?
          </label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value.slice(0, 200))}
            placeholder="E.g., 'Didn't detect priority correctly' or 'Missing error handling criteria'"
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setFeedbackText("");
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={submitTextFeedback}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="text-xs text-gray-500 text-center py-1">
          Thank you for the detailed feedback. It helps us improve.
        </div>
      )}
    </div>
  );
}
