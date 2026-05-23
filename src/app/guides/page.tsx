import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";

export const metadata: Metadata = {
  title: "Agile & Scrum Guides for Software Teams",
  description: "Practical guides on how to write Jira tickets, bug reports, user stories, and acceptance criteria for engineering teams.",
};

const guides = [
  { title: "How to Write a Good Jira Ticket", description: "A practical guide to writing Jira tickets that developers, QA, and PMs actually understand.", href: "/guides/how-to-write-a-good-jira-ticket", category: "Guides" },
  { title: "Bug Report vs Jira Ticket: What's the Difference?", description: "Understand when to write a bug report, when to create a Jira ticket, and how they relate.", href: "/guides/bug-report-vs-jira-ticket", category: "Guides" },
];

export default function GuidesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Agile & Scrum Guides</h1>
      <p className="text-lg text-gray-600 mb-10">Practical, no-fluff guides for engineering teams on how to write better tickets, reports, and stories.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
        {guides.map((g) => (
          <TemplateCard key={g.href} {...g} />
        ))}
      </div>
    </div>
  );
}
