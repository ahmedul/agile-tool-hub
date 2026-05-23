import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";

export const metadata: Metadata = {
  title: "Free Agile & Scrum Templates for Software Teams",
  description: "Browse free Jira, Scrum, and Agile templates. Bug report templates, user story templates, retrospective templates, postmortem templates and more.",
};

const templates = [
  { title: "Jira Bug Report Template", description: "Clear, structured bug reports with steps to reproduce, expected vs actual results, and priority.", href: "/templates/jira-bug-report-template", category: "Bug Reports" },
  { title: "User Story Template", description: "Write better user stories with acceptance criteria, story points, and clear business value.", href: "/templates/user-story-template", category: "User Stories" },
  { title: "Acceptance Criteria Template", description: "Define clear, testable acceptance criteria that dev, QA, and product all agree on.", href: "/templates/acceptance-criteria-template", category: "Acceptance Criteria" },
  { title: "Sprint Retrospective Template", description: "Run effective retros with What Went Well, What Didn't, and Action Items.", href: "/templates/sprint-retrospective-template", category: "Retrospectives" },
  { title: "Incident Postmortem Template", description: "Document incidents clearly with timeline, root cause, impact, and follow-up actions.", href: "/templates/incident-postmortem-template", category: "Postmortems" },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Agile & Scrum Templates</h1>
      <p className="text-lg text-gray-600 mb-10">Copy-paste templates for software teams. Structured, practical, and ready to use in Jira, Notion, or any tool.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <TemplateCard key={t.href} {...t} />
        ))}
      </div>
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Looking for examples or guides?</h2>
        <div className="flex gap-4">
          <Link href="/examples" className="text-blue-600 hover:underline">Browse Examples →</Link>
          <Link href="/guides" className="text-blue-600 hover:underline">Read Guides →</Link>
        </div>
      </div>
    </div>
  );
}
