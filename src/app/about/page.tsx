import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About AgileToolHub",
  description:
    "Why AgileToolHub exists: practical Jira-ready templates and tools for software teams that need cleaner tickets and smoother delivery.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumbs items={[{ label: "About" }]} />

      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">About</span>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
        Built for Real Software Delivery Work
      </h1>
      <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
        AgileToolHub exists to help software teams write clearer tickets, reduce back-and-forth,
        and ship faster with fewer misunderstandings.
      </p>

      <div className="prose prose-gray max-w-none">
        <p>
          This site was created by a software engineer who works with Jira tickets, APIs,
          CI/CD, and delivery workflows in real engineering teams.
        </p>

        <h2>Why this site exists</h2>
        <p>
          Most Agile content online is either too generic or too theoretical. Teams do not need
          another abstract article when they are trying to write a bug ticket in the next
          five minutes. They need practical, copy-ready assets and tools.
        </p>
        <p>
          AgileToolHub focuses on exactly that: useful templates, examples, and generators
          that can be used immediately.
        </p>

        <h2>What makes AgileToolHub different</h2>
        <ul>
          <li>Jira-ready templates and tool output designed for real handoff workflows</li>
          <li>No-login tools for quick use in sprint planning, grooming, and triage</li>
          <li>Engineering-focused examples, including API and QA-oriented content</li>
          <li>Practical guidance that helps teams improve ticket quality, not just terminology</li>
        </ul>

        <h2>Current focus</h2>
        <p>
          The current product direction is a focused ticket quality toolkit:
          bug reports, user stories, acceptance criteria, technical debt tickets,
          and supporting examples for product, dev, and QA collaboration.
        </p>

        <h2>How to use this site</h2>
        <ul>
          <li>Start with a template if you need structure</li>
          <li>Use a generator tool if your input is messy and needs cleanup</li>
          <li>Use examples pages to align your team on quality standards</li>
          <li>Use planning tools during ceremonies for better team decisions</li>
        </ul>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Start here</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/tools/bug-report-to-jira-ticket-converter" className="text-blue-600 hover:underline">
              → Bug Report Converter
            </Link>
          </li>
          <li>
            <Link href="/tools/user-story-generator" className="text-blue-600 hover:underline">
              → User Story Generator
            </Link>
          </li>
          <li>
            <Link href="/tools/acceptance-criteria-generator" className="text-blue-600 hover:underline">
              → Acceptance Criteria Generator
            </Link>
          </li>
          <li>
            <Link href="/templates" className="text-blue-600 hover:underline">
              → Browse all templates
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
