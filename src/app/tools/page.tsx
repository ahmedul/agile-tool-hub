import type { Metadata } from "next";
import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbSchema, buildCollectionPageSchema, buildFAQSchema, buildTemplateSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Agile & Scrum Tools for Sprint Planning",
  description:
    "Free Agile and Scrum tools for sprint planning, story points, Jira tickets, retrospectives, and team rituals. Use calculators, generators, and boards without signup.",
  keywords: [
    ...KEYWORDS.tools,
    "free agile tools",
    "free scrum tools",
    "agile planning tools",
    "sprint planning tools",
    "jira ticket tools",
  ],
  canonical: "https://agiletoolhub.com/tools",
});

const tools = [
  {
    title: "Bug Report to Jira Ticket Converter",
    description: "Paste messy bug notes and get a clean, structured Jira ticket instantly.",
    href: "/tools/bug-report-to-jira-ticket-converter",
  },
  {
    title: "User Story Generator",
    description: "Describe your feature and get a complete Jira-ready user story with acceptance criteria.",
    href: "/tools/user-story-generator",
  },
  {
    title: "Planning Poker",
    description: "Real-time story point estimation for your whole team.",
    href: "/tools/planning-poker",
  },
  {
    title: "Story Point Calculator",
    description: "Estimate story points from effort, complexity, uncertainty, risk, and dependencies.",
    href: "/tools/story-point-calculator",
  },
  {
    title: "Sprint Planning Checklist",
    description: "Validate backlog readiness, team capacity, sprint goals, and commitment.",
    href: "/tools/sprint-planning-checklist",
  },
  {
    title: "Acceptance Criteria Generator",
    description: "Generate testable acceptance criteria in Given/When/Then or checklist format in seconds.",
    href: "/tools/acceptance-criteria-generator",
  },
  {
    title: "Sprint Capacity Calculator",
    description: "Get a realistic sprint commitment in story points.",
    href: "/tools/sprint-capacity-calculator",
  },
  {
    title: "Definition of Done Checklist",
    description: "Build a practical quality checklist for Agile teams before work is called done.",
    href: "/tools/definition-of-done-checklist",
  },
  {
    title: "Daily Standup Generator",
    description: "Turn rough notes into a clear Yesterday/Today/Blockers update.",
    href: "/tools/daily-standup-generator",
  },
  {
    title: "Velocity Tracker",
    description: "Track sprint velocity trends and forecast future capacity.",
    href: "/tools/velocity-tracker",
  },
  {
    title: "Retrospective Board",
    description: "Real-time retro board for Agile teams.",
    href: "/tools/retro-board",
  },
  {
    title: "EventStorming Board",
    description: "Map business processes and domain events with a distributed team.",
    href: "/tools/event-storming",
  },
];

const toolGroups = [
  {
    title: "Sprint planning and estimation",
    description: "Plan realistic sprint commitments with capacity, story points, and team estimation tools.",
    links: [
      { title: "Sprint Planning Tools Hub", href: "/tools/sprint-planning-tools" },
      { title: "Story Point Calculator", href: "/tools/story-point-calculator" },
      { title: "Planning Poker", href: "/tools/planning-poker" },
      { title: "Sprint Capacity Calculator", href: "/tools/sprint-capacity-calculator" },
      { title: "Sprint Planning Checklist", href: "/tools/sprint-planning-checklist" },
    ],
  },
  {
    title: "Backlog and Jira ticket quality",
    description: "Turn rough product, QA, and bug notes into clearer Jira-ready backlog items.",
    links: [
      { title: "User Story Generator", href: "/tools/user-story-generator" },
      { title: "Acceptance Criteria Generator", href: "/tools/acceptance-criteria-generator" },
      { title: "Bug Report Converter", href: "/tools/bug-report-to-jira-ticket-converter" },
      { title: "Definition of Done Checklist", href: "/tools/definition-of-done-checklist" },
    ],
  },
  {
    title: "Team rituals and reporting",
    description: "Run smoother standups, retrospectives, and velocity reviews without spreadsheet overhead.",
    links: [
      { title: "Daily Standup Generator", href: "/tools/daily-standup-generator" },
      { title: "Retrospective Board", href: "/tools/retro-board" },
      { title: "Velocity Tracker", href: "/tools/velocity-tracker" },
      { title: "Sprint Planning Checklist", href: "/tools/sprint-planning-checklist" },
    ],
  },
];

const chooserRows = [
  {
    need: "Estimate a single user story",
    tool: "Story Point Calculator",
    href: "/tools/story-point-calculator",
    next: "Use Planning Poker if the team disagrees.",
  },
  {
    need: "Estimate with the whole team",
    tool: "Planning Poker",
    href: "/tools/planning-poker",
    next: "Share the room link and reveal votes together.",
  },
  {
    need: "Decide sprint commitment",
    tool: "Sprint Capacity Calculator",
    href: "/tools/sprint-capacity-calculator",
    next: "Cross-check scope with the Sprint Planning Checklist.",
  },
  {
    need: "Clean up rough feature notes",
    tool: "User Story Generator",
    href: "/tools/user-story-generator",
    next: "Add acceptance criteria before estimation.",
  },
  {
    need: "Make QA expectations testable",
    tool: "Acceptance Criteria Generator",
    href: "/tools/acceptance-criteria-generator",
    next: "Copy Given/When/Then criteria into Jira.",
  },
  {
    need: "Convert bug notes into a Jira ticket",
    tool: "Bug Report Converter",
    href: "/tools/bug-report-to-jira-ticket-converter",
    next: "Add severity, priority, and environment details.",
  },
];

const learningLinks = [
  { title: "Free Sprint Planning Tools", href: "/tools/sprint-planning-tools" },
  { title: "Story Point Examples for Agile Teams", href: "/guides/story-point-examples-for-agile-teams" },
  { title: "Story Point Estimation Guide", href: "/guides/story-point-estimation-guide-with-examples" },
  { title: "Complete Guide to Sprint Planning & Estimation", href: "/guides/complete-guide-to-sprint-planning-and-estimation" },
  { title: "Story Points Explained", href: "/docs/story-points-explained" },
  { title: "User Story Template", href: "/templates/user-story-template" },
  { title: "Acceptance Criteria Template", href: "/templates/acceptance-criteria-template" },
];

const faqItems = [
  {
    question: "What are the best free agile tools for sprint planning?",
    answer:
      "Start with the Story Point Calculator for a quick estimate, Planning Poker for team consensus, Sprint Capacity Calculator for realistic commitment, and Sprint Planning Checklist before closing the plan.",
  },
  {
    question: "Can I use these agile tools without creating an account?",
    answer:
      "Yes. AgileToolHub tools are free to use in the browser. The generators, calculators, checklists, Planning Poker, and Retro Board are available without a required signup.",
  },
  {
    question: "Which tools help with Jira ticket quality?",
    answer:
      "Use the User Story Generator, Acceptance Criteria Generator, and Bug Report to Jira Ticket Converter to create clearer Jira-ready backlog items with structured details.",
  },
  {
    question: "Do these tools replace Scrum ceremonies?",
    answer:
      "No. They support Scrum ceremonies by making estimation, sprint planning, standups, retrospectives, and backlog refinement easier to run and document.",
  },
];

export default function ToolsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
  ]);
  const collectionSchema = buildCollectionPageSchema({
    name: "Free Agile & Scrum Tools",
    description:
      "Online tools for planning poker, story point estimation, sprint planning, user story writing, acceptance criteria generation, bug conversion, and quality checklists.",
    url: "https://agiletoolhub.com/tools",
    items: tools.map((tool) => ({
      name: tool.title,
      description: tool.description,
      url: `https://agiletoolhub.com${tool.href}`,
    })),
  });

  // Rating schema for popular tools
  const topToolRatings = [
    buildTemplateSchema({
      name: "Bug Report to Jira Ticket Converter",
      description: "Paste messy bug notes and get a clean, structured Jira ticket instantly",
      url: "https://agiletoolhub.com/tools/bug-report-to-jira-ticket-converter",
      rating: { ratingValue: 4.9, ratingCount: 267 },
      author: "AgileToolHub",
    }),
    buildTemplateSchema({
      name: "User Story Generator",
      description: "Describe your feature and get a complete Jira-ready user story with acceptance criteria",
      url: "https://agiletoolhub.com/tools/user-story-generator",
      rating: { ratingValue: 4.8, ratingCount: 312 },
      author: "AgileToolHub",
    }),
    buildTemplateSchema({
      name: "Planning Poker",
      description: "Real-time story point estimation for your whole team",
      url: "https://agiletoolhub.com/tools/planning-poker",
      rating: { ratingValue: 4.7, ratingCount: 198 },
      author: "AgileToolHub",
    }),
  ];
  const faqSchema = buildFAQSchema(faqItems);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={faqSchema} />
      {topToolRatings.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <HeroSection
        title="Free Agile and Scrum tools for software teams"
        description="Plan sprints, estimate story points, improve Jira tickets, run retrospectives, and generate clearer backlog content without signup."
        gradientFrom="from-green-600"
        gradientTo="to-green-100"
      />
      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <FeaturedCard
            title="Bug Report to Jira Ticket Converter"
            description="Paste messy bug notes and get a clean, structured Jira ticket instantly."
            href="/tools/bug-report-to-jira-ticket-converter"
            category="Tool"
            accentColor="blue"
          />
          <FeaturedCard
            title="User Story Generator"
            description="Describe your feature and get a complete Jira-ready user story with acceptance criteria."
            href="/tools/user-story-generator"
            category="Tool"
            accentColor="orange"
          />
        </div>

        <div className="mb-10 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Free agile tools for everyday Scrum work</h2>
          <p className="text-gray-600">
            Use these browser-based tools during backlog refinement, sprint planning, daily standups, retrospectives, QA handoff, and Jira ticket cleanup.
            Each tool is designed for a specific team workflow, so you can move from rough notes to a clearer sprint plan faster.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Looking for a structured tool list? See the <Link href="/ai-tools" className="text-blue-600 hover:underline">AI-friendly Agile tools directory</Link> for each tool&apos;s purpose, inputs, and outputs.
          </p>
        </div>

        {/* Standard Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            title="Planning Poker"
            description="Real-time story point estimation for your whole team. Share a link, vote simultaneously, reveal together."
            href="/tools/planning-poker"
            badge="Live · Free"
          />
          <ToolCard
            title="Story Point Calculator"
            description="Estimate a story using effort, complexity, uncertainty, risk, and dependencies with a Fibonacci recommendation."
            href="/tools/story-point-calculator"
          />
          <ToolCard
            title="Sprint Planning Checklist"
            description="Check backlog readiness, team capacity, sprint goal clarity, and commitment before the sprint starts."
            href="/tools/sprint-planning-checklist"
          />
          <ToolCard
            title="Acceptance Criteria Generator"
            description="Generate testable acceptance criteria in Given/When/Then or checklist format in seconds."
            href="/tools/acceptance-criteria-generator"
          />
          <ToolCard
            title="Sprint Capacity Calculator"
            description="Enter team size and availability to get a realistic sprint commitment in story points."
            href="/tools/sprint-capacity-calculator"
          />
          <ToolCard
            title="Definition of Done Checklist"
            description="Build and copy a practical Agile quality checklist for code, testing, acceptance, and release readiness."
            href="/tools/definition-of-done-checklist"
          />
          <ToolCard
            title="Daily Standup Generator"
            description="Turn rough notes into a clear Yesterday/Today/Blockers update you can paste into Slack or Jira."
            href="/tools/daily-standup-generator"
          />
          <ToolCard
            title="Velocity Tracker"
            description="Track team sprint velocity, visualize trends, and forecast future sprint capacity with metrics-driven planning."
            href="/tools/velocity-tracker"
          />
          <ToolCard
            title="Retrospective Board"
            description="Real-time retro board for Agile teams. Went Well, To Improve, and Action Items — live and collaborative."
            href="/tools/retro-board"
            badge="Live · Free"
          />
        </div>

        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Agile tools by workflow</h2>
          <p className="max-w-3xl text-gray-600 mb-8">
            Pick the workflow closest to the problem your team is solving today, then move between related tools as the work becomes clearer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toolGroups.map((group) => (
              <div key={group.title} className="border border-gray-200 rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{group.description}</p>
                <ul className="mt-5 space-y-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}`}>
                      <Link href={link.href} className="text-sm font-medium text-blue-600 hover:underline">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Which agile tool should I use?</h2>
          <p className="max-w-3xl text-gray-600 mb-6">
            Start with the artifact you need: an estimate, a sprint commitment, a cleaner ticket, or a team discussion board.
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Team need</th>
                  <th className="px-4 py-3 font-semibold">Best tool</th>
                  <th className="px-4 py-3 font-semibold">Next step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chooserRows.map((row) => (
                  <tr key={row.need}>
                    <td className="px-4 py-3 text-gray-700">{row.need}</td>
                    <td className="px-4 py-3">
                      <Link href={row.href} className="font-medium text-blue-600 hover:underline">
                        {row.tool}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-8 border-t border-gray-200 pt-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Pair tools with practical agile guides</h2>
            <p className="text-gray-600">
              The tools work best when the team shares a common definition of good estimates, good tickets, and good sprint commitments.
              These resources support the same workflows and add examples you can use in refinement.
            </p>
          </div>
          <ul className="space-y-3">
            {learningLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-blue-600 hover:underline">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <FAQ items={faqItems} />
      </section>
    </>
  );
}
