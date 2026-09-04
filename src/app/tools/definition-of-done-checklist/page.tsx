import type { Metadata } from "next";
import Link from "next/link";
import DefinitionOfDoneChecklist from "@/components/DefinitionOfDoneChecklist";
import ToolFeedbackPanel from "@/components/ToolFeedbackPanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQSchema, buildMetadata, buildToolSchema } from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/definition-of-done-checklist";

export const metadata: Metadata = buildMetadata({
  title: "Definition of Done Checklist - Free Agile DoD Tool",
  description:
    "Create and copy a Definition of Done checklist for Agile teams. Cover code quality, testing, product acceptance, release readiness, and documentation.",
  keywords: [
    "definition of done checklist",
    "definition of done agile",
    "scrum definition of done",
    "dod checklist",
    "agile done criteria",
    "quality checklist",
  ],
  canonical: pageUrl,
});

const faqItems = [
  {
    question: "What is a Definition of Done?",
    answer:
      "A Definition of Done is a shared quality checklist that every story must satisfy before the team calls it complete. It applies across stories, unlike acceptance criteria, which are specific to one story.",
  },
  {
    question: "Who creates the Definition of Done?",
    answer:
      "The whole Scrum team creates and maintains it. Engineering, QA, product, design, security, and operations concerns should all be reflected when relevant.",
  },
  {
    question: "How often should we update the Definition of Done?",
    answer:
      "Review it after retrospectives, production incidents, recurring escaped defects, or major process changes. Keep it practical enough to use every sprint.",
  },
  {
    question: "Is this checklist free?",
    answer:
      "Yes. The checklist is free, runs in your browser, and can be copied into Jira, Confluence, Notion, or team docs.",
  },
];

export default function DefinitionOfDoneChecklistPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Definition of Done Checklist", href: "/tools/definition-of-done-checklist" },
  ]);
  const faqSchema = buildFAQSchema(faqItems);
  const toolSchema = buildToolSchema({
    name: "Definition of Done Checklist",
    description:
      "Interactive Definition of Done checklist for Agile teams covering code quality, testing, acceptance, release readiness, and documentation.",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={toolSchema} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Definition of Done Checklist" }]} />
        <span className="text-xs font-medium text-green-600 uppercase">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Definition of Done Checklist
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Build a practical Definition of Done for your Agile team. Check code quality, testing, acceptance, release readiness, and documentation before calling work complete.
        </p>

        <DefinitionOfDoneChecklist />

        <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Definition of Done vs acceptance criteria</h2>
          <p className="text-gray-600">
            The Definition of Done applies to every story. Acceptance criteria describe what must be true for one specific story.
            A story is complete only when both are satisfied.
          </p>
        </section>

        <ToolFeedbackPanel toolName="Definition of Done Checklist" toolSlug="definition-of-done-checklist" />
        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/templates/definition-of-done-checklist" className="text-blue-600 hover:underline">Definition of Done Template</Link></li>
            <li><Link href="/docs/definition-of-done-explained" className="text-blue-600 hover:underline">Definition of Done Explained</Link></li>
            <li><Link href="/templates/definition-of-ready-template" className="text-blue-600 hover:underline">Definition of Ready Template</Link></li>
            <li><Link href="/tools/acceptance-criteria-generator" className="text-blue-600 hover:underline">Acceptance Criteria Generator</Link></li>
            <li><Link href="/templates/code-review-template" className="text-blue-600 hover:underline">Code Review Template</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
