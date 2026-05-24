"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface OutputFeedbackProps {
  tool: "user_story" | "acceptance_criteria" | "bug_report";
  mode: "local" | "ai";
}

export default function OutputFeedback({ tool, mode }: OutputFeedbackProps) {
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);

  function submit(value: "yes" | "no") {
    setSelected(value);
    trackEvent("output_feedback", {
      tool,
      mode,
      useful: value,
    });
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
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
  );
}
