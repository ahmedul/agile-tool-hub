import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";

export const metadata: Metadata = {
  title: "Agile & Scrum Examples for Software Teams",
  description: "Real-world examples of bug reports, user stories, and acceptance criteria for software teams. Copy, adapt, and use in your own projects.",
};

const examples = [
  { title: "Bug Report Example for Web Application", description: "A complete bug report example for a frontend web app, including environment, steps, and logs.", href: "/examples/bug-report-example-for-web-application", category: "Bug Reports" },
  { title: "User Story Examples for Login Page", description: "Real user story examples for a login page with acceptance criteria and edge cases.", href: "/examples/user-story-examples-for-login-page", category: "User Stories" },
  { title: "Acceptance Criteria Examples for API", description: "Practical acceptance criteria examples for REST API endpoints, including error handling.", href: "/examples/acceptance-criteria-examples-for-api", category: "Acceptance Criteria" },
];

export default function ExamplesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Agile & Scrum Examples</h1>
      <p className="text-lg text-gray-600 mb-10">Real-world examples to show you what good tickets, user stories, and acceptance criteria look like in practice.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {examples.map((e) => (
          <TemplateCard key={e.href} {...e} />
        ))}
      </div>
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Want templates instead?</h2>
        <Link href="/templates" className="text-blue-600 hover:underline">Browse Templates →</Link>
      </div>
    </div>
  );
}
