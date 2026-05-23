"use client";
import { useState } from "react";

function convertBugReport(input: string): string {
  const lines = input.trim().split("\n").filter(Boolean);
  const firstLine = lines[0] || "Untitled bug";

  // Generate a rough title from the first sentence
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine;

  return `## Title
${title}

## Issue Type
Bug

## Priority
Medium

## Description
${input.trim()}

## Steps to Reproduce
1. [Describe the first step]
2. [Describe the second step]
3. [Describe the step that triggers the issue]

## Expected Result
[Describe what should happen]

## Actual Result
[Describe what actually happens]

## Environment
- Browser/OS: 
- Version: 
- URL: 

## Acceptance Criteria
- [ ] The issue described above is fixed
- [ ] The fix works in all supported browsers/environments
- [ ] No regression is introduced
- [ ] QA has verified the fix`;
}

export default function BugReportConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!input.trim()) return;
    setOutput(convertBugReport(input));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste your bug notes here
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Login does not work on Chrome. I click login and nothing happens."
          className="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-800 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={!input.trim()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Generate Jira Ticket
      </button>

      {output && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated Jira Ticket</label>
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
