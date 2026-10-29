"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "manual">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualHintId = useId();
  const selectManualText = useCallback((element: HTMLTextAreaElement | null) => {
    if (element) {
      element.focus();
      element.select();
    }
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleCopy = async () => {
    if (status === "copying") return;
    if (timer.current) clearTimeout(timer.current);
    setStatus("copying");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
    } catch {
      setStatus("manual");
      return;
    }
    setStatus("copied");
    timer.current = setTimeout(() => setStatus("idle"), 2000);
    trackEvent(eventName, { label, text_length: text.length, ...eventParams });
  };

  return (
    <div className="inline-flex max-w-full flex-col items-start gap-2">
      <button type="button" onClick={handleCopy} disabled={status === "copying"} className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60">
        {status === "copied" ? "✓ Copied!" : status === "copying" ? "Copying…" : label}
      </button>
      <span role="status" className="sr-only">{status === "copied" ? "Copied to clipboard." : ""}</span>
      {status === "manual" && (
        <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p id={manualHintId} role="status" className="mb-2 text-sm text-amber-900">Automatic copying is unavailable. Select and copy the text below.</p>
          <textarea ref={selectManualText} readOnly value={text} rows={5} aria-describedby={manualHintId} aria-label={`${label} text for manual copying`} onFocus={(event) => event.currentTarget.select()} className="block w-full min-w-0 rounded border border-amber-300 bg-white p-2 font-mono text-xs text-gray-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600" />
        </div>
      )}
    </div>
  );
}
