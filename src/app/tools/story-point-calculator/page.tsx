import type { Metadata } from "next";
import Link from "next/link";
import StoryPointCalculator from "@/components/StoryPointCalculator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQSchema, buildMetadata, buildToolSchema } from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/story-point-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Story Point Calculator - Free Agile Estimation Tool",
  description:
    "Estimate story points with a free Agile calculator for effort, complexity, uncertainty, risk, and dependencies. Get a Fibonacci estimate and planning guidance instantly.",
  keywords: [
    "story point calculator",
    "agile estimation calculator",
    "scrum story points",
    "fibonacci estimation",
    "story point estimation",
    "jira story points",
  ],
  canonical: pageUrl,
});

const faqItems = [
  {
    question: "How does the story point calculator work?",
    answer:
      "The calculator scores effort, complexity, uncertainty, risk, and dependencies, then maps the total to a Fibonacci story point estimate. Treat the result as a starting point for team discussion, not a replacement for estimation conversation.",
  },
  {
    question: "Should story points equal hours?",
    answer:
      "No. Story points estimate relative size, including effort, complexity, and uncertainty. Hours are a time forecast. A five-point story may take different amounts of time for different teams.",
  },
  {
    question: "What should we do with a 13 or 21 point story?",
    answer:
      "Split it before sprint commitment. Large estimates usually hide multiple deliverables, unclear acceptance criteria, or unresolved dependencies.",
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes. The story point calculator is free, requires no login, and runs in your browser.",
  },
];

export default function StoryPointCalculatorPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Story Point Calculator", href: "/tools/story-point-calculator" },
  ]);
  const faqSchema = buildFAQSchema(faqItems);
  const toolSchema = buildToolSchema({
    name: "Story Point Calculator",
    description:
      "Free Agile estimation calculator that recommends Fibonacci story points based on effort, complexity, uncertainty, risk, and dependencies.",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={toolSchema} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Story Point Calculator" }]} />
        <span className="text-xs font-medium text-green-600 uppercase">Free Tool</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Story Point Calculator
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Estimate a user story with effort, complexity, uncertainty, risk, and dependencies. Get a Fibonacci story point recommendation you can copy into Jira.
        </p>

        <StoryPointCalculator />

        <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">When to use this calculator</h2>
          <p className="text-gray-600">
            Use it during backlog refinement when a story is understood enough to discuss, but before the team commits it to a sprint.
            For live team voting, use Planning Poker after everyone has reviewed the story.
          </p>
        </section>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/tools/planning-poker" className="text-blue-600 hover:underline">Planning Poker</Link></li>
            <li><Link href="/guides/story-point-examples-for-agile-teams" className="text-blue-600 hover:underline">Story Point Examples for Agile Teams</Link></li>
            <li><Link href="/guides/story-point-estimation-guide-with-examples" className="text-blue-600 hover:underline">Story Point Estimation Guide</Link></li>
            <li><Link href="/docs/story-points-explained" className="text-blue-600 hover:underline">Story Points Explained</Link></li>
            <li><Link href="/tools/sprint-capacity-calculator" className="text-blue-600 hover:underline">Sprint Capacity Calculator</Link></li>
            <li><Link href="/templates/user-story-template" className="text-blue-600 hover:underline">User Story Template</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
