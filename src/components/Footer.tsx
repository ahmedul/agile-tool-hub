import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-bold text-gray-900 mb-3">AgileToolHub</p>
          <p className="text-sm text-gray-500">Free Agile, Scrum, and software delivery templates for engineering teams.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-3">Templates</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/templates/jira-bug-report-template" className="hover:text-blue-600">Bug Report Template</Link></li>
            <li><Link href="/templates/user-story-template" className="hover:text-blue-600">User Story Template</Link></li>
            <li><Link href="/templates/acceptance-criteria-template" className="hover:text-blue-600">Acceptance Criteria</Link></li>
            <li><Link href="/templates/sprint-retrospective-template" className="hover:text-blue-600">Sprint Retrospective</Link></li>
            <li><Link href="/templates/incident-postmortem-template" className="hover:text-blue-600">Incident Postmortem</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-3">Tools</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/tools/bug-report-to-jira-ticket-converter" className="hover:text-blue-600">Bug Report Converter</Link></li>
            <li><Link href="/tools/user-story-generator" className="hover:text-blue-600">User Story Generator</Link></li>
            <li><Link href="/tools/acceptance-criteria-generator" className="hover:text-blue-600">AC Generator</Link></li>
            <li><Link href="/tools/planning-poker" className="hover:text-blue-600">Planning Poker</Link></li>
            <li><Link href="/tools/sprint-capacity-calculator" className="hover:text-blue-600">Capacity Calculator</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-3">Guides & Docs</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/guides/how-to-write-a-good-jira-ticket" className="hover:text-blue-600">How to Write a Jira Ticket</Link></li>
            <li><Link href="/guides/bug-report-vs-jira-ticket" className="hover:text-blue-600">Bug Report vs Jira Ticket</Link></li>
            <li><Link href="/docs/agile-glossary" className="hover:text-blue-600">Agile Glossary</Link></li>
            <li><Link href="/docs/scrum-ceremonies-explained" className="hover:text-blue-600">Scrum Ceremonies</Link></li>
            <li><Link href="/docs/story-points-explained" className="hover:text-blue-600">Story Points Explained</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 text-center text-sm text-gray-400 py-4">
        © {new Date().getFullYear()} AgileToolHub.com — Free templates for software teams.
      </div>
    </footer>
  );
}
