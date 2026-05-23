import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Free Agile & Scrum Tools for Software Teams",
  description: "Simple, free tools for software teams. Convert bug notes to Jira tickets, generate user stories, and more.",
};

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Agile Tools</h1>
      <p className="text-lg text-gray-600 mb-10">Simple tools that turn messy notes into clean, structured tickets and documents.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <ToolCard
          title="Bug Report to Jira Ticket Converter"
          description="Paste messy bug notes and get a clean, structured Jira ticket with all required fields."
          href="/tools/bug-report-to-jira-ticket-converter"
        />
        <ToolCard
          title="User Story Generator"
          description="Describe your feature and get a complete, Jira-ready user story with acceptance criteria instantly."
          href="/tools/user-story-generator"
        />
      </div>
    </div>
  );
}
