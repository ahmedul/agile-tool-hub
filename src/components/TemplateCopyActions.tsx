"use client";

import CopyButton from "./CopyButton";
import { useState } from "react";
import type { TemplateSection } from "@/lib/template-copy";

interface TemplateCopyActionsProps {
  sections: TemplateSection[];
  slug: string;
}

export default function TemplateCopyActions({ sections, slug }: TemplateCopyActionsProps) {
  const [selected, setSelected] = useState(0);
  const markdown = sections[selected]?.markdown ?? "";
  const params = { template_slug: slug, section: selected + 1 };

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Quick copy</p>
          <p className="text-xs text-gray-600">
            Copy the selected template and adapt it to your team.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton key={`markdown-${selected}`} text={markdown} label="Copy Markdown" eventName="template_copy" eventParams={{ ...params, format: "markdown" }} />
          <CopyButton key={`jira-${selected}`} text={markdown} label="Copy for Jira" eventName="template_copy" eventParams={{ ...params, format: "jira" }} />
          <CopyButton key={`github-${selected}`} text={markdown} label="Copy for GitHub" eventName="template_copy" eventParams={{ ...params, format: "github" }} />
          <CopyButton key={`linear-${selected}`} text={markdown} label="Copy for Linear" eventName="template_copy" eventParams={{ ...params, format: "linear" }} />
        </div>
      </div>
      {sections.length > 1 && (
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Template section
          <select value={selected} onChange={(event) => setSelected(Number(event.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
            {sections.map((section, index) => <option key={index} value={index}>{section.title}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}
