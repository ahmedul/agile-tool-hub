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
      "Free templates and tools for Agile teams. Generate user stories, acceptance criteria, bug reports, and Jira tickets. Track sprint velocity. Real-time planning poker and retros. No login required.",
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
  { title: "Jira Bug Report Template", description: "A structured template for clear, actionable bug reports with steps to reproduce, expected vs actual results.", href: "/templates/jira-bug-report-template", category: "Template" },
  { title: "User Story Template", description: "Write better user stories with acceptance criteria, story points, and clear business value.", href: "/templates/user-story-template", category: "Template" },
  { title: "Acceptance Criteria Template", description: "Define clear, testable acceptance criteria that your whole team understands.", href: "/templates/acceptance-criteria-template", category: "Template" },
  { title: "Sprint Retrospective Template", description: "Run effective retrospectives with What Went Well, What Didn't, and Action Items.", href: "/templates/sprint-retrospective-template", category: "Template" },
  { title: "Incident Postmortem Template", description: "Document incidents clearly with timeline, root cause, impact, and follow-up actions.", href: "/templates/incident-postmortem-template", category: "Template" },
  { title: "Feature Request Template", description: "Capture product ideas with business value, scope, and clear acceptance criteria for implementation.", href: "/templates/feature-request-template", category: "Template" },
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

      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why use these templates?</h2>
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
