import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbSchema, buildCollectionPageSchema, buildTemplateSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Agile & Scrum Tools for Software Teams",
  description: "Free online tools for Agile and Scrum teams. Planning poker, story point calculator, sprint planning checklist, user story generator, acceptance criteria, velocity tracker, and retro board - no login required.",
  keywords: KEYWORDS.tools,
  canonical: "https://agiletoolhub.com/tools",
});

export default function ToolsPage() {
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
  ];
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

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      {topToolRatings.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <HeroSection
        title="Automate Jira tickets, user stories, and acceptance criteria instantly."
        description="AI-powered generators and real-time collaboration tools for agile teams."
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
      </section>
    </>
  );
}
