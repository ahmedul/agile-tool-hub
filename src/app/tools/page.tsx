import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Agile & Scrum Tools for Software Teams",
  description: "Free online tools for Agile and Scrum teams. Planning poker, user story generator, acceptance criteria, bug report converter, velocity tracker, standup generator, and retro board — no login required.",
  keywords: KEYWORDS.tools,
  canonical: "https://agiletoolhub.com/tools",
});

export default function ToolsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
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
