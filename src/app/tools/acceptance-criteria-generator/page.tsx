import type { Metadata } from "next";
import Link from "next/link";
import AcceptanceCriteriaGenerator from "@/components/AcceptanceCriteriaGenerator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildFAQSchema, buildBreadcrumbSchema, buildToolSchema, buildHowToSchema, KEYWORDS } from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/acceptance-criteria-generator";

export const metadata: Metadata = buildMetadata({
  title: "Free Acceptance Criteria Generator for Jira",
  description:
    "Paste rough feature notes and generate testable acceptance criteria in Given/When/Then or checklist format. Free, no login, Jira-ready.",
  keywords: KEYWORDS.acceptanceCriteria,
  canonical: pageUrl,
});

const faqItems = [
  {
    question: "Is this acceptance criteria generator free?",
    answer: "Yes. It is free, requires no login, and you can generate Jira-ready acceptance criteria directly in the browser.",
  },
  {
    question: "Can I paste rough feature notes?",
    answer:
      "Yes. Paste a short feature idea, rough user story, Jira note, or backlog refinement note. The generator turns it into Given/When/Then scenarios, checklist criteria, or both.",
  },
  {
    question: "Does this generate Given/When/Then acceptance criteria?",
    answer:
      "Yes. You can choose Given/When/Then only, checklist only, or both formats. Given/When/Then is useful for behavior-driven workflows, while checklist format is easier for many Jira teams.",
  },
  {
    question: "Can I paste the output into Jira?",
    answer:
      "Yes. The output is formatted in Markdown-style sections that are easy to paste into Jira descriptions, acceptance criteria fields, or comments.",
  },
  {
    question: "Does the tool use AI?",
    answer:
      "The current Local mode uses deterministic parsing in your browser. AI mode is planned, but the current generator is already useful for fast first drafts and quality checks.",
  },
  {
    question: "What is the Criteria Quality Score?",
    answer:
      "The quality score checks whether the criteria include clear actors, testable outcomes, error handling, measurable signals, and clarification prompts before you copy them to Jira.",
  },
  {
    question: "Should I edit the generated criteria?",
    answer:
      "Yes. Treat the result as a strong first draft. Confirm business rules, edge cases, data requirements, and Product Owner expectations before development starts.",
  },
];

export default function AcceptanceCriteriaGeneratorPage() {
  const faqSchema = buildFAQSchema(faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Acceptance Criteria Generator", href: "/tools/acceptance-criteria-generator" },
  ]);
  const toolSchema = buildToolSchema({
    name: "Acceptance Criteria Generator",
    description: "Free tool that turns rough feature notes into testable acceptance criteria in Given/When/Then or checklist format for Jira tickets.",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
  });
  const howToSchema = buildHowToSchema({
    title: "How to Generate Acceptance Criteria for Jira",
    description:
      "Create testable acceptance criteria from rough feature notes, user stories, or backlog refinement notes.",
    url: pageUrl,
    estimatedTime: "PT2M",
    steps: [
      {
        name: "Paste rough feature notes",
        description: "Enter the feature, user story, Jira note, or backlog item you want to clarify.",
      },
      {
        name: "Choose output format",
        description: "Select Given/When/Then, checklist format, or both depending on your team's workflow.",
      },
      {
        name: "Select a preset",
        description: "Choose Product, Engineering, API, or Tech Debt so the criteria match the work type.",
      },
      {
        name: "Generate and review",
        description: "Generate criteria, review the quality score, and adjust any assumptions or open questions.",
      },
      {
        name: "Copy to Jira",
        description: "Copy the generated acceptance criteria into your Jira ticket or backlog item.",
      },
    ],
  });

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={toolSchema} />
      <JsonLd data={howToSchema} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Acceptance Criteria Generator" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool · No Login · Jira-ready</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Free Acceptance Criteria Generator for Jira
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Paste a rough feature note or user story and generate testable acceptance criteria in Given/When/Then, checklist, or both formats. Built for Jira tickets, backlog refinement, and QA handoff.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-3 border-y border-gray-200 py-4 sm:grid-cols-3">
          {[
            { title: "Given/When/Then", description: "BDD-style scenarios for behavior and edge cases." },
            { title: "Checklist output", description: "Simple Jira-ready criteria for product and QA review." },
            { title: "Quality score", description: "Checks actors, outcomes, errors, and open questions." },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <AcceptanceCriteriaGenerator />

        <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Example input</h2>
          <p className="text-sm text-gray-600 mb-4">
            Paste something rough. The generator will structure it into testable criteria and flag clarifications.
          </p>
          <div className="rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-700">
            User can filter products by category and price. Results must update in under 2 seconds.
            Show an empty state when no products match. Needs to work for logged-in shoppers on mobile and desktop.
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What the generator creates</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Given/When/Then</h3>
              <p className="text-sm text-gray-600 mb-3">
                Best for workflows, QA automation, and behavior that needs clear preconditions.
              </p>
              <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">{`Given the shopper is viewing products
When they filter by category and price
Then matching products are shown
And results update in under 2 seconds`}</pre>
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Checklist format</h3>
              <p className="text-sm text-gray-600 mb-3">
                Best for Jira tickets where the team wants quick, scannable acceptance conditions.
              </p>
              <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">{`- [ ] User can filter by category
- [ ] User can filter by price
- [ ] Empty state appears for no matches
- [ ] Mobile and desktop are supported`}</pre>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">When to use each format</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[42rem] text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Format</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Use it for</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Best next step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Given/When/Then</td>
                  <td className="px-4 py-3 text-gray-600">User flows, behavior rules, BDD, automation-ready scenarios</td>
                  <td className="px-4 py-3 text-gray-600">Review with QA and Product Owner</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Checklist</td>
                  <td className="px-4 py-3 text-gray-600">Simple stories, non-UI work, Jira tickets, quick refinement</td>
                  <td className="px-4 py-3 text-gray-600">Confirm missing edge cases</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Both</td>
                  <td className="px-4 py-3 text-gray-600">Important stories where behavior and QA coverage both matter</td>
                  <td className="px-4 py-3 text-gray-600">Copy to Jira and refine with the team</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What makes good acceptance criteria?</h2>
          <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
            <li><strong>Testable</strong> - a QA engineer can write a test case from each criterion</li>
            <li><strong>Specific</strong> - no ambiguity about what &quot;done&quot; means</li>
            <li><strong>Written before dev starts</strong> - not after, when it becomes documentation</li>
            <li><strong>Covers error states</strong> - not just the happy path</li>
            <li><strong>Agreed by the whole team</strong> - dev, QA, and product all sign off</li>
            <li><strong>Behavior-focused</strong> - describes what should happen, not how to build it</li>
          </ul>
        </section>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/guides/ai-backlog-refinement-prompts" className="text-blue-600 hover:underline">→ AI Backlog Refinement Prompts</Link></li>
            <li><Link href="/templates/acceptance-criteria-template" className="text-blue-600 hover:underline">→ Acceptance Criteria Template</Link></li>
            <li><Link href="/guides/how-to-write-acceptance-criteria" className="text-blue-600 hover:underline">→ How to Write Acceptance Criteria</Link></li>
            <li><Link href="/examples/acceptance-criteria-examples-for-api" className="text-blue-600 hover:underline">→ Acceptance Criteria Examples for API</Link></li>
            <li><Link href="/examples/acceptance-criteria-examples-for-checkout" className="text-blue-600 hover:underline">→ Acceptance Criteria Examples for Checkout</Link></li>
            <li><Link href="/tools/user-story-generator" className="text-blue-600 hover:underline">→ User Story Generator</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
