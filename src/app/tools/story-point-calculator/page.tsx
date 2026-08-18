import type { Metadata } from "next";
import Link from "next/link";
import StoryPointCalculator from "@/components/StoryPointCalculator";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildHowToSchema,
  buildMetadata,
  buildToolSchema,
} from "@/lib/seo";

const pageUrl = "https://agiletoolhub.com/tools/story-point-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Free Story Point Calculator: Agile & Scrum Estimation Tool",
  description:
    "Use this free online story point calculator to estimate Agile and Scrum work. Score effort, complexity, uncertainty, risk, and dependencies to get a Fibonacci recommendation instantly.",
  keywords: [
    "story point calculator",
    "free story point calculator",
    "online story point calculator",
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
  const howToSchema = buildHowToSchema({
    title: "How to Estimate Story Points with a Calculator",
    description:
      "Use five practical sizing factors to create a starting Fibonacci estimate for an Agile user story.",
    url: pageUrl,
    steps: [
      { name: "Describe the story", description: "Add a short summary of the user story or backlog item." },
      { name: "Score the five factors", description: "Choose levels for effort, complexity, uncertainty, risk, and dependencies." },
      { name: "Review the recommendation", description: "Use the Fibonacci result, confidence level, and high-risk factors as a starting point." },
      { name: "Copy the estimate", description: "Copy the formatted estimate and next actions into Jira or your planning notes." },
      { name: "Confirm with the team", description: "Use Planning Poker when the team needs a shared estimate before sprint commitment." },
    ],
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={toolSchema} />
      <JsonLd data={howToSchema} />
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

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How this story point calculator works</h2>
          <p className="text-gray-600 mb-4">
            The calculator combines five parts of a user story: implementation effort, technical complexity,
            uncertainty, delivery risk, and dependencies. The combined score maps to a Fibonacci estimate such as
            1, 2, 3, 5, 8, 13, or 21 points.
          </p>
          <p className="text-gray-600">
            Treat the result as a discussion starter, not a promise of hours. Compare it with completed stories,
            confirm the acceptance criteria, and use <Link href="/tools/planning-poker" className="text-blue-600 hover:underline">Planning Poker</Link>
            when the whole team needs to vote together.
          </p>
        </section>

        <FAQ items={faqItems} />

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related resources</h2>
          <ul className="space-y-2">
            <li><Link href="/tools/sprint-planning-tools" className="text-blue-600 hover:underline">Sprint Planning Tools</Link></li>
            <li><Link href="/tools/planning-poker" className="text-blue-600 hover:underline">Planning Poker</Link></li>
            <li><Link href="/guides/planning-poker-vs-story-point-calculator" className="text-blue-600 hover:underline">Planning Poker vs Story Point Calculator</Link></li>
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
