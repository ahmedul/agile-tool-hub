"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import { trackEvent } from "@/lib/analytics";

interface ToolOutputActionsProps {
  text: string;
  tool: string;
  filename: string;
  format?: "markdown" | "jira";
  copyLabel?: string;
  eventParams?: Record<string, string | number | boolean>;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export default function ToolOutputActions({
  text,
  tool,
  filename,
  format = "markdown",
  copyLabel = "Copy for Jira",
  eventParams,
  onRegenerate,
  canRegenerate = true,
}: ToolOutputActionsProps) {
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "started" | "error">("idle");
  const analyticsParams = { ...eventParams, tool, mode: "local", format, output_length: text.length };

  function download() {
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      const mimeType = format === "markdown" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
      url = URL.createObjectURL(new Blob([text], { type: mimeType }));
      link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
    } catch {
      setDownloadStatus("error");
      return;
    } finally {
      link?.remove();
      // Give the browser time to start reading the file before releasing it.
      if (url) {
        const downloadUrl = url;
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
    }
    setDownloadStatus("started");
    trackEvent("output_download", analyticsParams);
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        {onRegenerate && (
          <button type="button" onClick={onRegenerate} disabled={!canRegenerate} className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
            Regenerate
          </button>
        )}
        <CopyButton text={text} label={copyLabel} eventName="output_copy" eventParams={analyticsParams} />
        <button type="button" onClick={download} className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          {format === "markdown" ? "Download Markdown" : "Download text"}
        </button>
      </div>
      <span role="status" className="sr-only">
        {downloadStatus === "started" ? "Download started." : ""}
      </span>
      {downloadStatus === "error" && (
        <p role="alert" className="text-sm text-red-700">Could not start the download. Copy the result instead.</p>
      )}
    </div>
  );
}
