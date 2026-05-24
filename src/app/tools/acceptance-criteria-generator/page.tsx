import type { Metadata } from "next";
import Link from "next/link";
import AcceptanceCriteriaGenerator from "@/components/AcceptanceCriteriaGenerator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Acceptance Criteria Generator — Free Tool for Agile Teams",
  description: "Generate testable acceptance criteria in Given/When/Then or checklist format instantly. Free tool for product managers, developers, and Scrum teams. No login required.",
};

const faqItems = [
  { question: "Is this tool free?", answer: "Yes, completely free. No login or signup required." },
  { question: "Does this send my data anywhere?", answer: "In Local mode, everything stays in your browser. In AI mode, your input is sent securely to the AI provider to generate higher-quality output." },
  { question: "Is AI mode subscription-based?", answer: "Yes. Free plan includes limited monthly AI generations, and Pro provides higher monthly limits. Local mode remains unlimited." },
  { question: "What's the difference between Given/When/Then and checklist format?", answer: "Given/When/Then (Gherkin) is best for BDD workflows and teams using tools like Cucumber. Checklist format is simpler and works well for most Scrum teams in Jira. When in doubt, use both — the tool generates both by default." },
  { question: "Should I edit the output?", answer: "Yes — the generated criteria use placeholder text. You must replace the generic conditions with specific, testable values relevant to your feature before using them in a ticket." },
  { question: "Can I paste this directly into Jira?", answer: "Yes. Copy and paste into the Jira description or acceptance criteria field. Markdown formatting renders correctly in Jira." },
];

export default function AcceptanceCriteriaGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Acceptance Criteria Generator" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Acceptance Criteria Generator
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Describe your feature and get complete acceptance criteria in Given/When/Then or checklist format — instantly. No login required.
        </p>

        <AcceptanceCriteriaGenerator />

        <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Example input</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700 w-36 shrink-0">Feature:</dt>
              <dd className="text-gray-600 font-mono">filter the product list by category</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700 w-36 shrink-0">User type:</dt>
              <dd className="text-gray-600 font-mono">logged-in shopper</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700 w-36 shrink-0">Format:</dt>
              <dd className="text-gray-600 font-mono">Both</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What makes good acceptance criteria?</h2>
          <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
            <li><strong>Testable</strong> — a QA engineer can write a test case from each criterion</li>
            <li><strong>Specific</strong> — no ambiguity about what "done" means</li>
            <li><strong>Written before dev starts</strong> — not after, when it becomes documentation</li>
            <li><strong>Covers error states</strong> — not just the happy path</li>
            <li><strong>Agreed by the whole team</strong> — dev, QA, and product all sign off</li>
            <li><strong>Behaviour-focused</strong> — describes what, not how</li>
          </ul>
        </div>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
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
