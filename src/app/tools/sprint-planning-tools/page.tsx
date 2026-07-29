import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  buildHowToSchema,
  buildMetadata,
  KEYWORDS,
} from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/sprint-planning-tools";

export const metadata: Metadata = buildMetadata({
  title: "Free Sprint Planning Tools for Agile Teams",
  description:
    "Use free sprint planning tools to estimate stories, calculate capacity, run Planning Poker, check sprint readiness, and track velocity. No login.",
  keywords: [
    ...KEYWORDS.tools,
    "free sprint planning tools",
    "sprint planning tools",
    "scrum sprint planning tools",
    "agile estimation tools",
    "sprint capacity planning tools",
    "planning poker tool",
    "story point calculator",
  ],
  canonical: pageUrl,
});

const sprintPlanningTools = [
  {
    step: "1",
    label: "Readiness",
    title: "Sprint Planning Checklist",
    description:
      "Validate backlog priority, acceptance criteria, story sizing, dependencies, capacity, sprint goal, and Definition of Done before commitment.",
    href: "/tools/sprint-planning-checklist",
  },
  {
    step: "2",
    label: "Sizing",
    title: "Story Point Calculator",
    description:
      "Estimate a story from effort, complexity, uncertainty, risk, and dependencies, then use the Fibonacci recommendation as a discussion starter.",
    href: "/tools/story-point-calculator",
  },
  {
    step: "3",
    label: "Capacity",
    title: "Sprint Capacity Calculator",
    description:
      "Calculate realistic sprint commitment from team size, availability, points per day, meetings, time off, and planning buffer.",
    href: "/tools/sprint-capacity-calculator",
  },
  {
    step: "4",
    label: "Consensus",
    title: "Planning Poker",
    description:
      "Run live team estimation with hidden votes, Fibonacci cards, shared rooms, and a fast reveal when everyone is ready.",
    href: "/tools/planning-poker",
  },
  {
    step: "5",
    label: "Forecasting",
    title: "Velocity Tracker",
    description:
      "Track completed points across sprints, spot velocity trends, and forecast a more realistic capacity for the next planning session.",
    href: "/tools/velocity-tracker",
  },
  {
    step: "6",
    label: "Backlog quality",
    title: "User Story Generator",
    description:
      "Turn a rough feature idea into a clearer user story before estimation, including role, goal, benefit, and useful planning context.",
    href: "/tools/user-story-generator",
  },
  {
    step: "7",
    label: "Acceptance",
    title: "Acceptance Criteria Generator",
    description:
      "Create testable acceptance criteria so sprint items are easier to estimate, test, and accept before the sprint closes.",
    href: "/tools/acceptance-criteria-generator",
  },
];

const workflowSteps = [
  {
    title: "Confirm backlog readiness",
    description:
      "Start with the checklist so the team can spot missing acceptance criteria, unclear priorities, hidden dependencies, and weak Definition of Ready signals.",
    href: "/tools/sprint-planning-checklist",
    linkText: "Open checklist",
  },
  {
    title: "Estimate stories",
    description:
      "Use the Story Point Calculator for a first pass, then run Planning Poker when the team needs independent estimates and visible disagreement.",
    href: "/tools/story-point-calculator",
    linkText: "Estimate a story",
  },
  {
    title: "Calculate team capacity",
    description:
      "Deduct time off, support load, ceremonies, and interruptions before the team chooses sprint scope.",
    href: "/tools/sprint-capacity-calculator",
    linkText: "Calculate capacity",
  },
  {
    title: "Choose sprint scope",
    description:
      "Use capacity and recent velocity together, then select work that supports one clear sprint goal instead of filling the sprint to 100 percent.",
    href: "/guides/how-to-write-sprint-goals",
    linkText: "Write a sprint goal",
  },
  {
    title: "Track outcome after the sprint",
    description:
      "Record planned points, completed points, and team size in the Velocity Tracker so the next planning session starts with evidence.",
    href: "/tools/velocity-tracker",
    linkText: "Track velocity",
  },
];

const problemRows = [
  {
    problem: "Stories enter planning without enough detail",
    use: "Sprint Planning Checklist",
    href: "/tools/sprint-planning-checklist",
    result: "The team catches unclear scope, missing acceptance criteria, and dependencies before commitment.",
  },
  {
    problem: "A story feels too large for one sprint",
    use: "Story Point Calculator",
    href: "/tools/story-point-calculator",
    result: "The team sees the risk factors behind the estimate and can split the work before planning closes.",
  },
  {
    problem: "Team members estimate very differently",
    use: "Planning Poker",
    href: "/tools/planning-poker",
    result: "Everyone votes independently, then discusses the assumptions behind wide estimate gaps.",
  },
  {
    problem: "The sprint commitment keeps rolling over",
    use: "Sprint Capacity Calculator",
    href: "/tools/sprint-capacity-calculator",
    result: "Capacity is adjusted for real availability instead of assuming every working day is fully available.",
  },
  {
    problem: "Planning is based on opinion instead of history",
    use: "Velocity Tracker",
    href: "/tools/velocity-tracker",
    result: "Recent completed points create a simple forecast for future sprint planning.",
  },
];

const relatedResources = [
  {
    title: "Complete Guide to Sprint Planning and Estimation",
    description: "A practical guide to sprint planning, capacity, story points, Planning Poker, and velocity.",
    href: "/guides/complete-guide-to-sprint-planning-and-estimation",
  },
  {
    title: "Sprint Capacity Planning Guide",
    description: "Capacity math, examples, buffers, velocity comparison, and common mistakes.",
    href: "/guides/sprint-capacity-planning-guide",
  },
  {
    title: "Story Point Examples for Agile Teams",
    description: "Concrete 1, 2, 3, 5, 8, and 13 point examples for common software work.",
    href: "/guides/story-point-examples-for-agile-teams",
  },
  {
    title: "Sprint Planning Template",
    description: "A reusable agenda and notes template for Scrum sprint planning meetings.",
    href: "/templates/sprint-planning-template",
  },
];

const faqItems = [
  {
    question: "What sprint planning tools should an Agile team use first?",
    answer:
      "Start with the Sprint Planning Checklist, then estimate stories with the Story Point Calculator or Planning Poker, calculate capacity, choose sprint scope, and track velocity after the sprint.",
  },
  {
    question: "Are these sprint planning tools free?",
    answer:
      "Yes. The sprint planning tools on AgileToolHub are free to use in the browser and do not require a login.",
  },
  {
    question: "How do these tools help with sprint commitment?",
    answer:
      "They separate readiness, estimation, capacity, and velocity. That helps the team avoid unclear stories, oversized tickets, and commitments that ignore meetings, time off, and interruptions.",
  },
  {
    question: "Can remote teams use these tools during sprint planning?",
    answer:
      "Yes. Planning Poker and the other planning tools work in the browser, so distributed teams can share links during a call and use the same estimates, capacity numbers, and checklist.",
  },
  {
    question: "Do these tools replace Jira or Scrum ceremonies?",
    answer:
      "No. They support the ceremony by producing clearer estimates, capacity notes, checklist output, and sprint planning context that can be copied into Jira, Confluence, Notion, or meeting notes.",
  },
];

export default function SprintPlanningToolsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Sprint Planning Tools", href: "/tools/sprint-planning-tools" },
  ]);
  const collectionSchema = buildCollectionPageSchema({
    name: "Free Sprint Planning Tools",
    description:
      "Free sprint planning tools for Agile teams to check readiness, estimate stories, calculate capacity, run Planning Poker, and track velocity.",
    url: pageUrl,
    items: sprintPlanningTools.map((tool) => ({
      name: tool.title,
      description: tool.description,
      url: `https://agiletoolhub.com${tool.href}`,
    })),
  });
  const howToSchema = buildHowToSchema({
    title: "How to plan a sprint with free Agile tools",
    description:
      "Use a sprint planning checklist, story point estimates, capacity planning, Planning Poker, and velocity tracking to create a realistic sprint commitment.",
    url: pageUrl,
    estimatedTime: "PT45M",
    steps: workflowSteps.map((step) => ({
      name: step.title,
      description: step.description,
    })),
  });
  const faqSchema = buildFAQSchema(faqItems);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
      <div className="bg-white">
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Sprint Planning Tools" }]} />
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div>
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                Free agile planning hub
              </span>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-900">
                Free Sprint Planning Tools for Agile Teams
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-gray-600">
                Use free sprint planning tools to estimate stories, calculate team capacity, run Planning Poker,
                validate sprint readiness, and track velocity without login. Start with the workflow, then open the
                tool that matches the planning problem in front of your team.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/tools/sprint-planning-checklist"
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Start with checklist
                </Link>
                <Link
                  href="/tools/sprint-capacity-calculator"
                  className="rounded-lg border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                >
                  Calculate capacity
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Sprint planning stack
              </h2>
              <ul className="mt-4 space-y-3">
                {sprintPlanningTools.slice(0, 5).map((tool) => (
                  <li key={tool.href} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 ring-1 ring-gray-200">
                      {tool.step}
                    </span>
                    <div>
                      <Link href={tool.href} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                        {tool.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-500">{tool.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Sprint planning workflow</h2>
              <p className="mt-3 text-gray-600">
                A good sprint planning meeting does not start by guessing how much work can fit. It moves from
                ready backlog items to estimates, then capacity, then commitment.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-gray-200 bg-white p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                  <Link href={step.href} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
                    {step.linkText}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tool stack for sprint planning</h2>
              <p className="mt-3 max-w-3xl text-gray-600">
                These tools cover the most common planning jobs: readiness checks, story point estimation,
                capacity planning, team consensus, velocity forecasting, and backlog cleanup.
              </p>
            </div>
            <Link href="/tools" className="text-sm font-semibold text-blue-600 hover:underline">
              View all Agile tools
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sprintPlanningTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-green-600">{tool.label}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{tool.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{tool.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-600">Open tool -&gt;</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Common sprint planning problems</h2>
              <p className="mt-3 text-gray-600">
                If sprint planning feels slow, the root cause is usually one of these problems. Use the matching
                tool before the team makes a commitment.
              </p>
            </div>
            <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Problem</th>
                    <th className="px-4 py-3 font-semibold">Use this tool</th>
                    <th className="px-4 py-3 font-semibold">Planning outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {problemRows.map((row) => (
                    <tr key={row.problem}>
                      <td className="px-4 py-3 text-gray-700">{row.problem}</td>
                      <td className="px-4 py-3">
                        <Link href={row.href} className="font-semibold text-blue-600 hover:underline">
                          {row.use}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">How to use these tools in a planning meeting</h2>
                <div className="mt-5 space-y-4 text-gray-600">
                  <p>
                    Before the meeting, prepare the highest priority stories with the User Story Generator and
                    Acceptance Criteria Generator if the backlog is still rough. During planning, use the checklist to
                    confirm readiness, then estimate stories with Planning Poker or the Story Point Calculator.
                  </p>
                  <p>
                    Once the team understands the work, calculate sprint capacity using availability instead of raw
                    calendar days. Compare that number with recent velocity, choose a small set of stories that supports
                    one sprint goal, and avoid filling every available point.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">Related guides and templates</h3>
                <ul className="mt-5 space-y-4">
                  {relatedResources.map((resource) => (
                    <li key={resource.href}>
                      <Link href={resource.href} className="font-semibold text-blue-600 hover:underline">
                        {resource.title}
                      </Link>
                      <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <FAQ items={faqItems} />
        </section>
      </div>
    </>
  );
}
