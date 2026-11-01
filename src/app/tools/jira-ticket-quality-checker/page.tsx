import type { Metadata } from "next";
import Link from "next/link";
import TicketQualityChecker from "@/components/TicketQualityChecker";
import ToolFeedbackPanel from "@/components/ToolFeedbackPanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQSchema, buildMetadata, buildToolSchema } from "@/lib/seo";

const name = "Jira Ticket Quality Checker";
const href = "/tools/jira-ticket-quality-checker";
const url = `https://agiletoolhub.com${href}`;
const description = "Review bug reports, user stories, and acceptance criteria for missing sections, placeholders, and wording to clarify. Free browser-based Jira ticket checker.";
export const metadata: Metadata = buildMetadata({ title: "Jira Ticket Quality Checker – Free Ticket Review", description, canonical: url, keywords: ["jira ticket quality checker", "user story checker", "acceptance criteria checker", "bug report review"] });
const faq = [
  { question: "What does this Jira ticket checker check?", answer: "It looks for section content, common template placeholders, and a small list of vague phrases. Bug checks cover summary, reproduction steps, expected and actual results, and environment. Story and criteria checks use their own text patterns." },
  { question: "Does a ticket with no flags mean it is ready for development?", answer: "No. A matching text pattern only confirms that text is present. The tool cannot verify facts, testability, dependencies, priority, or whether the team agrees on the scope. Use the findings to guide a human review." },
  { question: "Is my ticket uploaded or saved?", answer: "Checks run locally in your browser and this input is not automatically saved. Refreshing clears it. If you choose to move the text between tools, a temporary transfer is saved in this tab, consumed once, and rejected after ten minutes." },
  { question: "Can I review a ticket without a Jira account?", answer: "Yes. Paste plain text, Markdown, or Jira-style section headings. No Jira connection or account is needed. You can copy the review or download it as Markdown." },
];

export default function TicketQualityCheckerPage() {
  return <>
    <JsonLd data={buildBreadcrumbSchema([{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: name, href }])} />
    <JsonLd data={buildFAQSchema(faq)} />
    <JsonLd data={buildToolSchema({ name, description, url, applicationCategory: "BusinessApplication" })} />
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: name }]} />
      <span className="text-xs font-semibold uppercase text-green-700">Free tool · No signup</span>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">{name}</h1>
      <p className="mb-8 mt-4 text-lg text-gray-600">Find missing context and unfinished template text before a ticket reaches your team. Review a bug report, user story, or acceptance criteria, then use the findings to improve the original.</p>
      <TicketQualityChecker />
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">Example: a checkout bug that needs clarification</h2>
        <p className="mt-3 text-gray-700">“Checkout is broken. Please fix ASAP.” has an opening summary, but gives a reviewer no reproduction steps, separate expected and actual results, or environment.</p>
        <p className="mt-3 text-gray-700">A more useful report describes the starting cart, the actions taken, the observed requests, and the intended order behavior. If a double charge is unconfirmed, keep it as an open question. The detailed sample in the tool shows this distinction without treating a suspected cause as fact.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">Use the review in backlog refinement</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
          <li>Choose the ticket type and paste the current wording.</li>
          <li>Discuss flagged checks with the author. A missing pattern may also mean the same information is written differently.</li>
          <li>Edit the original text and review it again. Check correctness and testability with your team.</li>
          <li>Copy the review, or move the ticket into the <Link className="text-blue-700 underline" href="/tools/jira-csv-builder">Jira CSV Builder and Validator</Link> to prepare import rows.</li>
        </ol>
      </section>
      <ToolFeedbackPanel toolName={name} toolSlug="jira-ticket-quality-checker" />
      <FAQ items={faq} />
      <section className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Related tools and guides</h2>
        <ul className="space-y-2 text-blue-700">
          <li><Link href="/templates/jira-csv-import-template" className="hover:underline">Download Jira CSV import examples</Link></li>
          <li><Link href="/tools/bug-report-to-jira-ticket-converter" className="hover:underline">Structure rough bug notes</Link></li>
          <li><Link href="/tools/user-story-generator" className="hover:underline">Draft a user story</Link></li>
          <li><Link href="/tools/acceptance-criteria-generator" className="hover:underline">Draft acceptance criteria</Link></li>
          <li><Link href="/guides/how-to-write-a-good-jira-ticket" className="hover:underline">How to write a good Jira ticket</Link></li>
          <li><Link href="/guides/how-to-write-acceptance-criteria" className="hover:underline">How to write acceptance criteria</Link></li>
        </ul>
      </section>
    </div>
  </>;
}
