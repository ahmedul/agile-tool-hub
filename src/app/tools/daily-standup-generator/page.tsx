import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import DailyStandupGenerator from "@/components/DailyStandupGenerator";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Daily Standup Generator — Free Tool for Agile Teams",
  description:
    "Create clear, structured daily standup updates in seconds. Capture yesterday, today, blockers, and export a Jira/Slack-ready format. Free tool, no login required.",
  keywords: [
    "daily standup generator",
    "scrum standup template",
    "daily scrum update",
    "standup notes format",
    "agile standup",
    "jira standup update",
  ],
};

const faqItems = [
  {
    question: "Is this tool free?",
    answer: "Yes, completely free. No login or signup is required.",
  },
  {
    question: "What does the generator include?",
    answer:
      "It formats updates into Yesterday, Today, and Blockers, plus a Support Needed section. You can switch between Individual and Team modes.",
  },
  {
    question: "Can I export in Jira-friendly format?",
    answer:
      "Yes. Choose Jira Wiki output to generate heading and bullet formatting that is easy to paste into Jira comments.",
  },
  {
    question: "Can I paste rough notes or transcript text?",
    answer:
      "Yes. Paste rough notes in the transcript box and the tool will auto-sort lines into the standup sections where possible.",
  },
  {
    question: "Is AI mode available?",
    answer:
      "AI mode is coming soon. Today, Local mode runs entirely in your browser and keeps your text on your device.",
  },
  {
    question: "Can I edit the generated standup before sharing?",
    answer:
      "Yes. You should quickly review and tailor wording, owners, and blockers to match your team's context before posting.",
  },
];

export default function DailyStandupGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Daily Standup Generator" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Daily Standup Generator</h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Turn rough notes into a clean daily standup update with Yesterday, Today, and Blockers in one click.
          No login required.
        </p>

        <DailyStandupGenerator />

        <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Example input</h2>
          <p className="text-sm text-gray-600 font-mono bg-white border border-gray-200 rounded p-4 whitespace-pre-wrap">
            yesterday: merged auth token refresh fix
            today: finish retry logic for payments; pair with QA on smoke tests
            blocker: waiting on API key from partner team
          </p>
        </div>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/guides/how-to-run-effective-standups" className="text-blue-600 hover:underline">
                → Daily Standup Best Practices
              </Link>
            </li>
            <li>
              <Link href="/templates/daily-standup-template" className="text-blue-600 hover:underline">
                → Daily Standup Template
              </Link>
            </li>
            <li>
              <Link href="/tools/sprint-capacity-calculator" className="text-blue-600 hover:underline">
                → Sprint Capacity Calculator
              </Link>
            </li>
            <li>
              <Link href="/tools/planning-poker" className="text-blue-600 hover:underline">
                → Planning Poker
              </Link>
            </li>
            <li>
              <Link href="/docs/scrum-ceremonies-explained" className="text-blue-600 hover:underline">
                → Scrum Ceremonies Explained
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
