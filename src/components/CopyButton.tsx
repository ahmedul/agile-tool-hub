"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
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
