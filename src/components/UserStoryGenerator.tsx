"use client";
import { useState } from "react";

type StoryType = "feature" | "improvement" | "task";
type Priority = "High" | "Medium" | "Low";

interface FormState {
  featureDescription: string;
  userType: string;
  storyType: StoryType;
  priority: Priority;
}

function generateUserStory(form: FormState): string {
  const { featureDescription, userType, storyType, priority } = form;
  const user = userType.trim() || "user";
  const desc = featureDescription.trim();

  // Derive a concise title from the description
  const title = desc.length > 80 ? desc.slice(0, 77) + "..." : desc;

  const issueTypeLabel =
    storyType === "feature" ? "Story" : storyType === "improvement" ? "Improvement" : "Task";

  return `## Title
As a ${user}, I want to ${title}

## Issue Type
${issueTypeLabel}

## Priority
${priority}

## User Story
As a ${user},
I want to ${desc},
So that [describe the benefit or business value].

## Story Points
[ ] 1  [ ] 2  [ ] 3  [ ] 5  [ ] 8

## Acceptance Criteria
- [ ] Given [starting context], when [action is taken], then [expected outcome]
- [ ] Given [starting context], when [action is taken], then [expected outcome]
- [ ] Error states and edge cases are handled gracefully
- [ ] The feature works correctly on mobile and desktop
- [ ] The implementation meets the team's Definition of Done

## Out of Scope
- [List anything explicitly NOT included in this story]

## Dependencies
- [List any blockers, related tickets, or external dependencies]

## Notes
- [Add any additional context, mockup links, or design references here]`;
}

export default function UserStoryGenerator() {
  const [form, setForm] = useState<FormState>({
    featureDescription: "",
    userType: "",
    storyType: "feature",
    priority: "Medium",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = () => {
    if (!form.featureDescription.trim()) return;
    setOutput(generateUserStory(form));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Feature description */}
      <div>
        <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
          What does this feature do? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="e.g. filter the product list by category so I can find items faster"
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">Write it as the continuation of "I want to…"</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* User type */}
        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
            User type
          </label>
          <input
            id="userType"
            name="userType"
            type="text"
            value={form.userType}
            onChange={handleChange}
            placeholder="e.g. logged-in user"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Story type */}
        <div>
          <label htmlFor="storyType" className="block text-sm font-medium text-gray-700 mb-1">
            Story type
          </label>
          <select
            id="storyType"
            name="storyType"
            value={form.storyType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="feature">Story (new feature)</option>
            <option value="improvement">Improvement</option>
            <option value="task">Task</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!form.featureDescription.trim()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Generate User Story
      </button>

      {output && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated User Story</label>
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
