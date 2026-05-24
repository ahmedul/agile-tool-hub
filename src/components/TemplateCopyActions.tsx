"use client";

import CopyButton from "./CopyButton";

interface TemplateCopyActionsProps {
  markdown: string;
}

export default function TemplateCopyActions({ markdown }: TemplateCopyActionsProps) {
  const jira = markdown;
  const github = markdown;
  const linear = markdown;

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Quick copy</p>
          <p className="text-xs text-gray-600">
            One-click copy for your issue tracker format.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={markdown} label="Copy Markdown" />
          <CopyButton text={jira} label="Copy Jira" />
          <CopyButton text={github} label="Copy GitHub" />
          <CopyButton text={linear} label="Copy Linear" />
        </div>
      </div>
    </div>
  );
}
