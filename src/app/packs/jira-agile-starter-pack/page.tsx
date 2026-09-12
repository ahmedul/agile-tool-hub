import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Jira & Agile Starter Pack | Ready-to-Use Team Templates",
  description:
    "A practical Jira and Agile template bundle for Scrum teams: user stories, bug reports, acceptance criteria, sprint planning, retrospectives, and AI prompts.",
  keywords: [
    "Jira template bundle",
    "Agile team templates",
    "Scrum template pack",
    "Jira ticket templates",
    "acceptance criteria templates",
  ],
  canonical: "https://agiletoolhub.com/packs/jira-agile-starter-pack",
});

const includedItems = [
  "Jira-ready user story template",
  "Bug report and feature request templates",
  "Given/When/Then and checklist acceptance criteria patterns",
  "Definition of Ready and Definition of Done checklists",
  "Sprint planning and retrospective formats",
  "AI prompts for story refinement and Scrum ceremonies",
];

const packCheckoutUrl = process.env.NEXT_PUBLIC_STARTER_PACK_CHECKOUT_URL;

export default function JiraAgileStarterPackPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">AgileToolHub pack</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
          Jira &amp; Agile Starter Pack
        </h1>
        <p className="mt-5 text-xl leading-8 text-gray-600">
          A practical bundle of ready-to-use templates and prompts for teams that want clearer Jira tickets and smoother Scrum ceremonies.
        </p>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <h2 className="text-2xl font-bold text-gray-950">Everything your team needs to start with better tickets</h2>
          <p className="mt-3 leading-7 text-gray-600">
            Stop rebuilding the same story, bug, and planning formats from scratch. Use a consistent starting point, then adapt it to your product and team.
          </p>
          <ul className="mt-6 space-y-3 text-gray-700">
            {includedItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 text-blue-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">One-time purchase</p>
          <p className="mt-2 text-4xl font-bold text-gray-950">€19</p>
          <p className="mt-1 text-sm font-medium text-blue-800">Early-access price · regular price €29</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">Download the organized bundle and use it across Jira, Confluence, Notion, or team notes.</p>
          {packCheckoutUrl ? (
            <a
              href={packCheckoutUrl}
              className="mt-6 block rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
            >
              Get the starter pack
            </a>
          ) : (
            <p className="mt-6 rounded-lg border border-blue-300 bg-white px-4 py-3 text-center text-sm font-medium text-blue-900">
              Checkout is being prepared
            </p>
          )}
          <p className="mt-3 text-center text-xs text-gray-500">The free tools remain free. This pack saves preparation time.</p>
        </aside>
      </section>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-950">Who it is for</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ["Scrum Masters", "Set a consistent standard for refinement, planning, and retrospectives."],
            ["Product teams", "Turn rough ideas into tickets developers and QA can act on."],
            ["Engineering teams", "Reduce clarification loops with clearer inputs and acceptance criteria."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-950">What stays free?</h2>
        <p className="mt-3 leading-7 text-gray-600">
          AgileToolHub&apos;s calculators, generators, Planning Poker, collaboration boards, individual templates, and guides remain available without an account. The pack is for teams that want the complete curated bundle in one place.
        </p>
        <Link href="/tools" className="mt-4 inline-block font-medium text-blue-700 hover:underline">
          Explore the free tools →
        </Link>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        Have a question about the pack? <Link href="/about" className="text-blue-700 hover:underline">Learn more about AgileToolHub</Link>.
      </p>
    </main>
  );
}
