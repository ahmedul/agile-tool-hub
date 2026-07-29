import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";
import ToolCard from "@/components/ToolCard";
import JsonLd from "@/components/JsonLd";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import { buildMetadata, buildOrganizationSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "AgileToolHub — Free Agile, Scrum & Software Delivery Templates & Tools",
    description:
      "Free templates and tools for Agile teams. Estimate story points, plan sprint capacity, generate user stories, acceptance criteria, bug reports, and Jira tickets. No login required.",
    keywords: KEYWORDS.homepage,
    canonical: "https://agiletoolhub.com",
  }),
  // Absolute title preserves brand-first format and prevents the root layout template
  // from appending '| AgileToolHub' a second time.
  title: {
    absolute: "AgileToolHub — Free Agile, Scrum & Software Delivery Templates & Tools",
  },
};

const templates = [
  { title: "Complete Jira Ticket Template", description: "One master Jira template for bugs, stories, tasks, and improvements with clear acceptance criteria.", href: "/templates/complete-jira-ticket-template", category: "Template" },
  { title: "API Requirements Template", description: "Document API endpoints, auth, request/response schema, errors, and testing criteria in Jira.", href: "/templates/api-requirements-jira-template", category: "Template" },
  { title: "Jira Bug Report Template", description: "A structured template for clear, actionable bug reports with steps to reproduce, expected vs actual results.", href: "/templates/jira-bug-report-template", category: "Template" },
  { title: "User Story Template", description: "Write better user stories with acceptance criteria, story points, and clear business value.", href: "/templates/user-story-template", category: "Template" },
  { title: "Acceptance Criteria Template", description: "Define clear, testable acceptance criteria that your whole team understands.", href: "/templates/acceptance-criteria-template", category: "Template" },
  { title: "Sprint Retrospective Template", description: "Run effective retrospectives with What Went Well, What Didn't, and Action Items.", href: "/templates/sprint-retrospective-template", category: "Template" },
  { title: "Incident Postmortem Template", description: "Document incidents clearly with timeline, root cause, impact, and follow-up actions.", href: "/templates/incident-postmortem-template", category: "Template" },
  { title: "Feature Request Template", description: "Capture product ideas with business value, scope, and clear acceptance criteria for implementation.", href: "/templates/feature-request-template", category: "Template" },
];

const popularCalculators = [
  {
    title: "Story Point Calculator",
    description: "Estimate a story with effort, complexity, uncertainty, risk, and dependencies.",
    href: "/tools/story-point-calculator",
  },
  {
    title: "Sprint Planning Checklist",
    description: "Validate backlog readiness, capacity, sprint goals, and team commitment.",
    href: "/tools/sprint-planning-checklist",
  },
  {
    title: "Definition of Done Checklist",
    description: "Check code quality, testing, acceptance, and release readiness before calling work done.",
    href: "/tools/definition-of-done-checklist",
  },
  {
    title: "Sprint Capacity Calculator",
    description: "Calculate realistic sprint commitment from team availability and velocity.",
    href: "/tools/sprint-capacity-calculator",
  },
  {
    title: "Velocity Tracker",
    description: "Track completed points, visualize sprint trends, and forecast future capacity.",
    href: "/tools/velocity-tracker",
  },
  {
    title: "Planning Poker",
    description: "Run live story point estimation with your team and reveal votes together.",
    href: "/tools/planning-poker",
    badge: "Live · Free",
  },
];

export default function Home() {
  const organizationSchema = buildOrganizationSchema();

  return (
    <>
      <JsonLd data={organizationSchema} />
      <HeroSection
        title="Create better Jira tickets, bug reports, and Agile templates in minutes"
        description="Free templates and simple tools for software teams that want clearer tickets, better acceptance criteria, and smoother delivery."
        gradientFrom="from-blue-600"
        gradientTo="to-blue-100"
        ctaButtons={[
          { label: "Browse Templates", href: "/templates", variant: "primary" },
          { label: "Try Planning Poker", href: "/tools/planning-poker", variant: "secondary" },
          { label: "User Story Generator", href: "/tools/user-story-generator", variant: "outline" },
          { label: "Bug Report Converter", href: "/tools/bug-report-to-jira-ticket-converter", variant: "outline" },
        ]}
      />

      <section className="bg-white border-b border-gray-200 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Agile Calculators</h2>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Fast planning tools for story points, sprint readiness, capacity, velocity, and team quality standards.
              </p>
            </div>
            <Link href="/tools" className="text-blue-600 hover:underline text-sm font-medium">
              View all tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCalculators.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Popular Templates</h2>

          {/* Featured Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <FeaturedCard
              {...templates[0]}
              category="Template"
              accentColor="blue"
            />
            <FeaturedCard
              {...templates[1]}
              category="Template"
              accentColor="orange"
            />
          </div>

          {/* Standard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.slice(2).map((t) => (
              <TemplateCard key={t.href} {...t} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Free Tools</h2>

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
              description="Describe your feature and get a complete, Jira-ready user story with acceptance criteria instantly."
              href="/tools/user-story-generator"
              category="Tool"
              accentColor="orange"
            />
          </div>

          {/* Standard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
              title="Acceptance Criteria Generator"
              description="Generate testable acceptance criteria in Given/When/Then or checklist format in seconds."
              href="/tools/acceptance-criteria-generator"
            />
            <ToolCard
              title="Planning Poker"
              description="Real-time story point estimation for your whole team. No login — just share a link."
              href="/tools/planning-poker"
            />
            <ToolCard
              title="Sprint Capacity Calculator"
              description="Enter team size and availability to get a realistic sprint commitment in story points."
              href="/tools/sprint-capacity-calculator"
            />
            <ToolCard
              title="Daily Standup Generator"
              description="Turn rough notes into a clean Yesterday/Today/Blockers update for your daily scrum."
              href="/tools/daily-standup-generator"
            />
            <ToolCard
              title="Velocity Tracker"
              description="Track team sprint velocity, visualize trends, and forecast future sprint capacity."
              href="/tools/velocity-tracker"
            />
            <ToolCard
              title="Retrospective Board"
              description="Real-time retro board for Agile teams. Went Well, To Improve, and Action Items — live and collaborative."
              href="/tools/retro-board"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Reference Docs</h2>
          <Link href="/docs" className="text-blue-600 hover:underline text-sm font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { title: "Agile Glossary", description: "Key Agile and Scrum terms explained simply.", href: "/docs/agile-glossary" },
            { title: "Scrum Ceremonies Explained", description: "Sprint Planning, Standup, Review, and Retro — what each one is for.", href: "/docs/scrum-ceremonies-explained" },
            { title: "Story Points Explained", description: "How to estimate with story points, Fibonacci, and planning poker.", href: "/docs/story-points-explained" },
          ].map((doc) => (
            <Link key={doc.href} href={doc.href} className="block border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Docs</p>
              <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Top Resources by Intent</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Ticket Quality Mastery */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md hover:border-blue-300 transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-blue-600 rounded"></div>
              <h3 className="text-xl font-bold text-gray-900">Ticket Quality Mastery</h3>
            </div>
            <ul className="space-y-3">
              <li className="pb-2 border-b border-blue-100">
                <Link href="/guides/complete-guide-to-jira-ticket-quality" className="text-blue-600 hover:underline font-bold text-sm block mb-1">
                  📘 Complete Guide to Jira Ticket Quality
                </Link>
                <p className="text-gray-500 text-xs">Comprehensive guide covering all aspects of ticket quality</p>
              </li>
              <li>
                <Link href="/guides/how-to-write-a-good-jira-ticket" className="text-blue-600 hover:underline font-medium text-sm">
                  How to Write a Good Jira Ticket
                </Link>
                <p className="text-gray-500 text-xs mt-1">Clear, actionable Jira tickets with acceptance criteria and best practices</p>
              </li>
              <li>
                <Link href="/guides/how-to-write-acceptance-criteria" className="text-blue-600 hover:underline font-medium text-sm">
                  How to Write Acceptance Criteria
                </Link>
                <p className="text-gray-500 text-xs mt-1">Testable criteria in Given/When/Then or checklist format</p>
              </li>
              <li>
                <Link href="/guides/bug-report-vs-jira-ticket" className="text-blue-600 hover:underline font-medium text-sm">
                  Bug Report vs Jira Ticket
                </Link>
                <p className="text-gray-500 text-xs mt-1">When to use each and how to convert between them</p>
              </li>
              <li>
                <Link href="/guides/bug-severity-vs-priority-jira-guide" className="text-blue-600 hover:underline font-medium text-sm">
                  Bug Severity vs Priority
                </Link>
                <p className="text-gray-500 text-xs mt-1">Understand the difference and how to set priority correctly</p>
              </li>
              <li>
                <Link href="/tools/bug-report-to-jira-ticket-converter" className="text-blue-600 hover:underline font-medium text-sm">
                  Bug Report Converter
                </Link>
                <p className="text-gray-500 text-xs mt-1">Convert messy notes into structured tickets instantly</p>
              </li>
            </ul>
          </div>

          {/* Sprint Planning Essentials */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-orange-600 rounded"></div>
              <h3 className="text-xl font-bold text-gray-900">Sprint Planning Essentials</h3>
            </div>
            <ul className="space-y-3">
              <li className="pb-2 border-b border-orange-100">
                <Link href="/guides/complete-guide-to-sprint-planning-and-estimation" className="text-blue-600 hover:underline font-bold text-sm block mb-1">
                  📘 Complete Sprint Planning & Estimation Guide
                </Link>
                <p className="text-gray-500 text-xs">Master sprint planning, capacity, velocity, and Fibonacci estimation</p>
              </li>
              <li>
                <Link href="/tools/sprint-planning-tools" className="text-blue-600 hover:underline font-medium text-sm">
                  Free Sprint Planning Tools
                </Link>
                <p className="text-gray-500 text-xs mt-1">Use checklist, estimation, capacity, Planning Poker, and velocity tools together</p>
              </li>
              <li>
                <Link href="/guides/sprint-capacity-planning-guide" className="text-blue-600 hover:underline font-medium text-sm">
                  Sprint Capacity Planning
                </Link>
                <p className="text-gray-500 text-xs mt-1">Calculate realistic sprint commitment and team velocity</p>
              </li>
              <li>
                <Link href="/guides/story-point-estimation-guide-with-examples" className="text-blue-600 hover:underline font-medium text-sm">
                  Story Point Estimation Guide
                </Link>
                <p className="text-gray-500 text-xs mt-1">Estimate accurately with Fibonacci, planning poker, and real examples</p>
              </li>
              <li>
                <Link href="/guides/story-point-examples-for-agile-teams" className="text-blue-600 hover:underline font-medium text-sm">
                  Story Point Examples for Agile Teams
                </Link>
                <p className="text-gray-500 text-xs mt-1">Concrete 1, 2, 3, 5, 8, and 13 point examples for common tickets</p>
              </li>
              <li>
                <Link href="/tools/story-point-calculator" className="text-blue-600 hover:underline font-medium text-sm">
                  Story Point Calculator
                </Link>
                <p className="text-gray-500 text-xs mt-1">Estimate work from effort, complexity, uncertainty, risk, and dependencies</p>
              </li>
              <li>
                <Link href="/tools/sprint-planning-checklist" className="text-blue-600 hover:underline font-medium text-sm">
                  Sprint Planning Checklist
                </Link>
                <p className="text-gray-500 text-xs mt-1">Validate backlog readiness, capacity, sprint goal, and commitment</p>
              </li>
              <li>
                <Link href="/tools/planning-poker" className="text-blue-600 hover:underline font-medium text-sm">
                  Planning Poker Tool
                </Link>
                <p className="text-gray-500 text-xs mt-1">Real-time story point estimation for your whole team</p>
              </li>
              <li>
                <Link href="/tools/sprint-capacity-calculator" className="text-blue-600 hover:underline font-medium text-sm">
                  Sprint Capacity Calculator
                </Link>
                <p className="text-gray-500 text-xs mt-1">Calculate realistic sprint commitment from team availability</p>
              </li>
            </ul>
          </div>

          {/* Retrospective Success */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md hover:border-green-300 transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-green-600 rounded"></div>
              <h3 className="text-xl font-bold text-gray-900">Retrospective Success</h3>
            </div>
            <ul className="space-y-3">
              <li className="pb-2 border-b border-green-100">
                <Link href="/guides/complete-guide-to-retrospectives-and-standups" className="text-blue-600 hover:underline font-bold text-sm block mb-1">
                  📖 Complete Retrospectives & Standups Guide
                </Link>
                <p className="text-gray-500 text-xs">Master sprint retrospectives, daily standups, facilitation, and team ceremonies</p>
              </li>
              <li>
                <Link href="/guides/how-to-run-a-sprint-retrospective" className="text-blue-600 hover:underline font-medium text-sm">
                  How to Run a Sprint Retrospective
                </Link>
                <p className="text-gray-500 text-xs mt-1">Step-by-step guide to running productive retros with action items</p>
              </li>
              <li>
                <Link href="/guides/how-to-run-effective-standups" className="text-blue-600 hover:underline font-medium text-sm">
                  How to Run Effective Standups
                </Link>
                <p className="text-gray-500 text-xs mt-1">Keep standups quick, focused, and actually useful for teams</p>
              </li>
              <li>
                <Link href="/tools/retro-board" className="text-blue-600 hover:underline font-medium text-sm">
                  Retrospective Board
                </Link>
                <p className="text-gray-500 text-xs mt-1">Real-time retro board for Went Well, To Improve, and Action Items</p>
              </li>
              <li>
                <Link href="/tools/daily-standup-generator" className="text-blue-600 hover:underline font-medium text-sm">
                  Daily Standup Generator
                </Link>
                <p className="text-gray-500 text-xs mt-1">Turn rough notes into clean standup updates</p>
              </li>
            </ul>
          </div>

          {/* User Story Mastery */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-purple-600 rounded"></div>
              <h3 className="text-xl font-bold text-gray-900">User Story Mastery</h3>
            </div>
            <ul className="space-y-3">
              <li className="pb-2 border-b border-purple-100">
                <Link href="/guides/complete-guide-to-user-stories-and-epic-breakdown" className="text-blue-600 hover:underline font-bold text-sm block mb-1">
                  📖 Complete User Stories & Epic Breakdown Guide
                </Link>
                <p className="text-gray-500 text-xs">Master user story writing, INVEST principles, epic decomposition, and practical examples</p>
              </li>
              <li>
                <Link href="/guides/how-to-write-user-stories" className="text-blue-600 hover:underline font-medium text-sm">
                  How to Write User Stories
                </Link>
                <p className="text-gray-500 text-xs mt-1">Write stories that developers understand and can estimate</p>
              </li>
              <li>
                <Link href="/guides/how-to-break-down-epics-into-user-stories" className="text-blue-600 hover:underline font-medium text-sm">
                  Break Down Epics into Stories
                </Link>
                <p className="text-gray-500 text-xs mt-1">Split large features into testable, shippable pieces</p>
              </li>
              <li>
                <Link href="/guides/epic-breakdown-best-practices" className="text-blue-600 hover:underline font-medium text-sm">
                  Epic Breakdown Best Practices
                </Link>
                <p className="text-gray-500 text-xs mt-1">Techniques for breaking down complex work into stories</p>
              </li>
              <li>
                <Link href="/tools/user-story-generator" className="text-blue-600 hover:underline font-medium text-sm">
                  User Story Generator
                </Link>
                <p className="text-gray-500 text-xs mt-1">Generate complete stories with acceptance criteria instantly</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: "Save time", body: "Stop writing bug reports and tickets from scratch. Start from a proven structure." },
            { title: "Reduce back-and-forth", body: "Clear templates mean less ambiguity, fewer follow-up questions, and faster delivery." },
            { title: "Built for real teams", body: "Made by engineers who work with Jira, Scrum, and software delivery every day." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
