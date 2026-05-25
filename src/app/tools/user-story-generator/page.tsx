import type { Metadata } from "next";
import Link from "next/link";
import UserStoryGenerator from "@/components/UserStoryGenerator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "User Story Generator — Free Tool for Agile Teams",
  description: "Generate a complete, structured user story with acceptance criteria in seconds. Free tool for product managers, developers, and Scrum teams. No login required.",
};

const faqItems = [
  { question: "Is this tool free?", answer: "Yes, completely free. No login or signup required." },
  { question: "What is Local mode?", answer: "Local mode uses deterministic parsing in your browser — your data never leaves your computer." },
  { question: "Is AI mode available?", answer: "AI mode is coming soon! It will generate even better stories from messy notes and chat transcripts. We'll announce when it's ready." },
  { question: "Can I paste the output directly into Jira?", answer: "Yes. Copy the output and paste it into the Jira description field. The Markdown formatting renders correctly in Jira." },
  { question: "What's the difference between a Story, Improvement, and Task?", answer: "A Story is a new feature from the user's perspective. An Improvement is an enhancement to existing functionality. A Task is technical work that doesn't directly deliver user-facing value, like refactoring or infrastructure changes." },
  { question: "Should I edit the output?", answer: "Yes — the generated text uses placeholders. You should customize it with specific details about your actual feature before sharing with your team." },
];

export default function UserStoryGeneratorPage() {
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
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "User Story Generator" }]} />
      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool</span>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
        User Story Generator
      </h1>
      <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
        Describe your feature and get a complete, Jira-ready user story with acceptance criteria, story points, and all required fields — instantly. No login required.
      </p>

      <UserStoryGenerator />

      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Example input</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700 w-36 shrink-0">Feature description:</dt>
            <dd className="text-gray-600 font-mono">filter the product list by category so I can find items faster</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700 w-36 shrink-0">User type:</dt>
            <dd className="text-gray-600 font-mono">logged-in shopper</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700 w-36 shrink-0">Story type:</dt>
            <dd className="text-gray-600 font-mono">Story (new feature)</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What makes a good user story?</h2>
        <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
          <li><strong>User-centric</strong> — written from the user's perspective, not the developer's</li>
          <li><strong>Specific title</strong> — anyone reading the backlog knows exactly what it's about</li>
          <li><strong>Clear business value</strong> — the "so that" explains why it matters</li>
          <li><strong>Testable acceptance criteria</strong> — QA can write test cases from them</li>
          <li><strong>Appropriately sized</strong> — completable within one sprint; if not, split it</li>
          <li><strong>Independent</strong> — doesn't depend on another story being done first</li>
        </ul>
      </div>

      <FAQ items={faqItems} />

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
        <ul className="space-y-2">
          <li><Link href="/templates/user-story-template" className="text-blue-600 hover:underline">→ User Story Template</Link></li>
          <li><Link href="/templates/acceptance-criteria-template" className="text-blue-600 hover:underline">→ Acceptance Criteria Template</Link></li>
          <li><Link href="/guides/how-to-write-acceptance-criteria" className="text-blue-600 hover:underline">→ How to Write Acceptance Criteria</Link></li>
          <li><Link href="/examples/user-story-examples-for-login-page" className="text-blue-600 hover:underline">→ User Story Examples for Login Page</Link></li>
          <li><Link href="/docs/story-points-explained" className="text-blue-600 hover:underline">→ Story Points Explained</Link></li>
        </ul>
      </div>
    </div>
    </>
  );
}
