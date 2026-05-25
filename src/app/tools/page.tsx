import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Free Agile & Scrum Tools for Software Teams | AgileToolHub",
  description: "Free online tools for Agile and Scrum teams. Plan poker sessions, generate user stories, write acceptance criteria, and convert bug reports to Jira tickets — no login required.",
};

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Agile Tools</h1>
      <p className="text-lg text-gray-600 mb-10">Browser-based tools for software teams. No login, no signup — just open and use.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ToolCard
          title="Planning Poker"
          description="Real-time story point estimation for your whole team. Share a link, vote simultaneously, reveal together."
          href="/tools/planning-poker"
          badge="Live · Free"
        />
        <ToolCard
          title="User Story Generator"
          description="Describe your feature and get a complete, Jira-ready user story with acceptance criteria instantly."
          href="/tools/user-story-generator"
        />
        <ToolCard
          title="Acceptance Criteria Generator"
          description="Generate testable acceptance criteria in Given/When/Then or checklist format in seconds."
          href="/tools/acceptance-criteria-generator"
        />
        <ToolCard
          title="Bug Report to Jira Ticket Converter"
          description="Paste messy bug notes and get a clean, structured Jira ticket with all required fields."
          href="/tools/bug-report-to-jira-ticket-converter"
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
    </div>
  );
}
