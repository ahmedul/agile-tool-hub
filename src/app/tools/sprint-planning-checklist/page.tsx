import type { Metadata } from "next";
import Link from "next/link";
import SprintPlanningChecklist from "@/components/SprintPlanningChecklist";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQSchema, buildHowToSchema, buildMetadata, buildToolSchema } from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/sprint-planning-checklist";

export const metadata: Metadata = buildMetadata({
  title: "Sprint Planning Checklist - Free Scrum Planning Tool",
  description:
    "Use a free sprint planning checklist to validate backlog readiness, team capacity, sprint goals, and commitment before your Scrum sprint starts.",
  keywords: [
    "sprint planning checklist",
    "scrum planning checklist",
    "sprint planning template",
    "agile sprint planning",
    "sprint goal checklist",
    "sprint commitment checklist",
  ],
  canonical: pageUrl,
});

const faqItems = [
  {
    question: "What should be checked before sprint planning?",
    answer:
      "The team should confirm backlog priority, acceptance criteria, story sizing, dependencies, capacity, recent velocity, sprint goal, and Definition of Done before committing to sprint scope.",
  },
  {
    question: "Who owns the sprint planning checklist?",
    answer:
      "The Scrum team owns it together. Product brings priorities and context, engineering validates feasibility and capacity, and the whole team agrees on the sprint commitment.",
  },
  {
    question: "Can I paste this checklist into Jira or Confluence?",
    answer:
      "Yes. Use the copy button to export the checklist as Markdown, then paste it into Jira, Confluence, Notion, or your sprint planning notes.",
  },
  {
    question: "Is this sprint planning tool free?",
    answer:
      "Yes. It is free, requires no account, and stores nothing on a server.",
  },
];

export default function SprintPlanningChecklistPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Sprint Planning Checklist", href: "/tools/sprint-planning-checklist" },
  ]);
  const faqSchema = buildFAQSchema(faqItems);
  const toolSchema = buildToolSchema({
    name: "Sprint Planning Checklist",
    description:
      "Interactive sprint planning checklist for Scrum teams to validate readiness, capacity, sprint goals, and commitment.",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
  });
  const howToSchema = buildHowToSchema({
    title: "How to run sprint planning with a checklist",
    description:
      "Use backlog readiness, capacity, sprint goal, and commitment checks before starting a sprint.",
    url: pageUrl,
    estimatedTime: "PT20M",
    steps: [
      { name: "Confirm backlog readiness", description: "Check that priority stories are refined, sized, and have acceptance criteria." },
      { name: "Calculate capacity", description: "Deduct time off, support duties, and ceremonies before selecting sprint scope." },
      { name: "Write the sprint goal", description: "Create one clear outcome that selected stories support." },
      { name: "Confirm commitment", description: "Review risks, dependencies, and Definition of Done before the team commits." },
    ],
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={toolSchema} />
      <JsonLd data={howToSchema} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Sprint Planning Checklist" }]} />
        <span className="text-xs font-medium text-green-600 uppercase">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Sprint Planning Checklist
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Validate backlog readiness, team capacity, sprint goals, and commitment before your Scrum sprint starts. Copy the checklist into Jira or Confluence.
        </p>

        <SprintPlanningChecklist />

        <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">What this prevents</h2>
          <p className="text-gray-600">
            Most failed sprints start with unclear scope, missing acceptance criteria, hidden dependencies, or unrealistic capacity.
            This checklist catches those issues before the team commits.
          </p>
        </section>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/tools/sprint-planning-tools" className="text-blue-600 hover:underline">Sprint Planning Tools</Link></li>
            <li><Link href="/templates/sprint-planning-template" className="text-blue-600 hover:underline">Sprint Planning Template</Link></li>
            <li><Link href="/tools/sprint-capacity-calculator" className="text-blue-600 hover:underline">Sprint Capacity Calculator</Link></li>
            <li><Link href="/tools/story-point-calculator" className="text-blue-600 hover:underline">Story Point Calculator</Link></li>
            <li><Link href="/guides/complete-guide-to-sprint-planning-and-estimation" className="text-blue-600 hover:underline">Complete Guide to Sprint Planning</Link></li>
            <li><Link href="/guides/how-to-write-sprint-goals" className="text-blue-600 hover:underline">How to Write Sprint Goals</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
