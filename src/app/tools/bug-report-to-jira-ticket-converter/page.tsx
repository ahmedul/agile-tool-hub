import type { Metadata } from "next";
import Link from "next/link";
import BugReportConverter from "@/components/BugReportConverter";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildFAQSchema, buildBreadcrumbSchema, buildToolSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Bug Report to Jira Ticket Converter — AI-Powered Free Tool",
  description: "Convert messy bug notes into a clean, structured Jira ticket in seconds. Free tool for software teams. Includes quality scoring. No login required.",
  keywords: KEYWORDS.bugReport,
  canonical: "https://agiletoolhub.com/tools/bug-report-to-jira-ticket-converter",
});

const faqItems = [
  { question: "Is this tool free?", answer: "Yes, completely free. No login or signup required." },
  { question: "What is Local mode?", answer: "Local mode uses fast, deterministic parsing that runs entirely in your browser. No data leaves your computer." },
  { question: "Is AI mode available?", answer: "AI mode is coming soon! It will deliver higher-quality rewrites from messy chats and transcripts. We'll announce when it's ready." },
  { question: "Can I use the output directly in Jira?", answer: "Yes. Copy the output and paste it into the Jira ticket description field. The Markdown formatting will render correctly." },
  { question: "What will AI mode cost?", answer: "AI mode will be available as a paid add-on once launched. Local mode will always be free." },
  { question: "Can I export to GitHub Issues or Linear?", answer: "Export to other formats like GitHub Issues, Linear, and Azure DevOps is on the roadmap." },
];

export default function BugReportConverterPage() {
  const faqSchema = buildFAQSchema(faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Bug Report Converter", href: "/tools/bug-report-to-jira-ticket-converter" },
  ]);
  const toolSchema = buildToolSchema({
    name: "Bug Report to Jira Ticket Converter",
    description: "Convert messy bug notes into a clean, structured Jira ticket with quality scoring.",
    url: "https://agiletoolhub.com/tools/bug-report-to-jira-ticket-converter",
    applicationCategory: "BusinessApplication",
  });

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={toolSchema} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Bug Report Converter" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Bug Report to Jira Ticket Converter
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Paste your messy bug notes below and get a clean, structured Jira ticket with all the right fields — instantly. No login required.
        </p>

        <BugReportConverter />

        <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Example input</h2>
          <p className="text-sm text-gray-600 font-mono bg-white border border-gray-200 rounded p-4">
            Login does not work on Chrome. I click login and nothing happens. Tried on version 114. Works fine on Firefox.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What does a good Jira ticket need?</h2>
          <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
            <li><strong>Title</strong> — Clear, specific, describes the problem not the symptom</li>
            <li><strong>Steps to Reproduce</strong> — Numbered, repeatable steps</li>
            <li><strong>Expected Result</strong> — What should have happened</li>
            <li><strong>Actual Result</strong> — What actually happened</li>
            <li><strong>Environment</strong> — Browser, OS, version, URL</li>
            <li><strong>Priority</strong> — Critical, High, Medium, Low</li>
            <li><strong>Acceptance Criteria</strong> — What needs to be true for this to be closed</li>
          </ul>
        </div>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/templates/jira-bug-report-template" className="text-blue-600 hover:underline">→ Jira Bug Report Template</Link></li>
            <li><Link href="/examples/bug-report-example-for-web-application" className="text-blue-600 hover:underline">→ Bug Report Example for Web Application</Link></li>
            <li><Link href="/guides/how-to-write-a-good-jira-ticket" className="text-blue-600 hover:underline">→ How to Write a Good Jira Ticket</Link></li>
            <li><Link href="/guides/bug-report-vs-jira-ticket" className="text-blue-600 hover:underline">→ Bug Report vs Jira Ticket</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
