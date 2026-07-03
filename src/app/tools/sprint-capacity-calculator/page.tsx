import type { Metadata } from "next";
import Link from "next/link";
import SprintCapacityCalculator from "@/components/SprintCapacityCalculator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Sprint Capacity Calculator — Free Tool for Agile Teams",
  description:
    "Calculate your team's sprint capacity in story points. Enter team size, available days, and velocity per person — get the recommended sprint commitment instantly. Free, no login.",
  keywords: [
    "sprint capacity calculator",
    "sprint planning calculator",
    "story point capacity",
    "agile capacity planning",
    "scrum capacity calculator",
    "sprint velocity calculator",
  ],
};

const faqItems = [
  {
    question: "What is sprint capacity?",
    answer:
      "Sprint capacity is the total number of story points a team can realistically complete in a sprint, based on team size, availability, and individual velocity. It sets the upper bound for what to commit to in sprint planning.",
  },
  {
    question: "Why plan to 80% of capacity?",
    answer:
      "Planning to 100% assumes no interruptions, no code reviews, no unplanned bugs, and no meetings overrunning. None of those assumptions are true. The 80% buffer accounts for the inevitable reality of a sprint. Teams that plan to 100% consistently carry work over.",
  },
  {
    question: "What should I set as velocity per day?",
    answer:
      "A common default for a developer is 2 story points per day. However, the most accurate number comes from your own team's history: take the total points completed in your last 3 sprints, divide by total developer-days available, and use that as your per-person velocity.",
  },
  {
    question: "How do I account for meetings and ceremonies?",
    answer:
      "Reduce the 'days available' for each person by the time ceremonies consume. For a 2-week sprint, sprint planning, review, retro, and daily standups typically consume 1–1.5 days per person. So a 10-day sprint might have 8.5 effective development days per person.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes, completely free. No account or login required. All calculations happen in your browser.",
  },
];

export default function SprintCapacityPage() {
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
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Sprint Capacity Calculator" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Sprint Capacity Calculator
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Enter your team&apos;s availability and velocity to get a realistic sprint commitment in story points. No login required.
        </p>

        <SprintCapacityCalculator />

        <FAQ items={faqItems} />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Related resources
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { title: "Sprint Capacity Planning Guide", href: "/guides/sprint-capacity-planning-guide" },
              { title: "Planning Poker", href: "/tools/planning-poker" },
              { title: "Sprint Planning Template", href: "/templates/sprint-planning-template" },
              { title: "Story Points Explained", href: "/docs/story-points-explained" },
              { title: "User Story Template", href: "/templates/user-story-template" },
              { title: "Scrum Ceremonies Explained", href: "/docs/scrum-ceremonies-explained" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
