"use client";
import { useState } from "react";

type OutputFormat = "gherkin" | "checklist" | "both";

interface FormState {
  featureDescription: string;
  userType: string;
  format: OutputFormat;
}

function generateAcceptanceCriteria(form: FormState): string {
  const { featureDescription, userType, format } = form;
  const user = userType.trim() || "user";
  const desc = featureDescription.trim();

  const gherkin = `## Acceptance Criteria (Given/When/Then)

**Happy path:**
\`\`\`
Given the ${user} is on the relevant page
When they ${desc}
Then the expected outcome occurs successfully
And the UI reflects the updated state
\`\`\`

**Validation / error state:**
\`\`\`
Given the ${user} has not completed all required fields
When they attempt to ${desc}
Then a clear error message is shown
And no action is taken until the issue is resolved
\`\`\`

**Edge case:**
\`\`\`
Given the ${user} triggers an unexpected condition (e.g. network error, empty state)
When they attempt to ${desc}
Then the system handles the error gracefully
And the ${user} is shown a meaningful message with next steps
\`\`\``;

  const checklist = `## Acceptance Criteria (Checklist)

**Functional:**
- [ ] The ${user} can ${desc} successfully under normal conditions
- [ ] The action produces the expected result in the UI
- [ ] Changes are persisted correctly (if applicable)

**Validation:**
- [ ] Required fields are validated before submission
- [ ] Clear error messages are shown for invalid or missing input
- [ ] The form/action cannot be submitted in an invalid state

**Edge cases & error handling:**
- [ ] The feature behaves correctly with empty or boundary data
- [ ] Network errors are handled gracefully with a user-facing message
- [ ] No data loss occurs if the action fails

**Non-functional:**
- [ ] The feature works on mobile and desktop
- [ ] Page/action response time is acceptable (under 2 seconds for typical cases)
- [ ] The feature is accessible (keyboard navigable, screen reader friendly)

**Definition of Done:**
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] QA verified against these criteria
- [ ] Product Owner has accepted the story`;

  if (format === "gherkin") return gherkin;
  if (format === "checklist") return checklist;
  return `${gherkin}\n\n---\n\n${checklist}`;
}

export default function AcceptanceCriteriaGenerator() {
  const [form, setForm] = useState<FormState>({
    featureDescription: "",
    userType: "",
    format: "both",
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
    setOutput(generateAcceptanceCriteria(form));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
          What does the feature do? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="featureDescription"
          name="featureDescription"
          value={form.featureDescription}
          onChange={handleChange}
          placeholder="e.g. filter the product list by category"
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">Write it as the continuation of "The user can…"</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="e.g. logged-in shopper"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Output format
          </label>
          <select
            id="format"
            name="format"
            value={form.format}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="both">Both (Given/When/Then + Checklist)</option>
            <option value="gherkin">Given/When/Then only</option>
            <option value="checklist">Checklist only</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!form.featureDescription.trim()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Generate Acceptance Criteria
      </button>

      {output && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Generated Acceptance Criteria</label>
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
