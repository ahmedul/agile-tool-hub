"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function CopyButton({
  text,
  label = "Copy",
  eventName = "copy_clicked",
  eventParams,
}: {
  text: string;
  label?: string;
  eventName?: string;
  eventParams?: Record<string, string | number | boolean>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    trackEvent(eventName, {
      label,
      text_length: text.length,
      ...eventParams,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}
