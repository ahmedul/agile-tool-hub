import Link from "next/link";
import VelocityTracker from "@/components/VelocityTracker";
import FAQ from "@/components/FAQ";
import RelatedLinks from "@/components/RelatedLinks";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildFAQSchema, buildBreadcrumbSchema, buildToolSchema, KEYWORDS } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Velocity Tracker — Free Sprint Metrics & Forecasting Tool",
  description:
    "Track team sprint velocity, visualize trends, forecast future sprint capacity, and improve planning accuracy. Free agile metrics tool. Export to Jira and Markdown.",
  keywords: KEYWORDS.velocityTracker,
  canonical: "https://agiletoolhub.com/tools/velocity-tracker",
});

export default function VelocityTrackerPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Velocity Tracker", href: "/tools/velocity-tracker" },
  ]);
  
  const faqs = [
    {
      question: "What is velocity in Agile?",
      answer:
        "Velocity is the amount of work (measured in story points) that a team completes during a sprint. It's a key metric for forecasting and capacity planning—higher velocity suggests more items can be committed in future sprints.",
    },
    {
      question: "How do I use this tool?",
      answer:
        "Enter your sprint data (planned points, completed points, team size) one sprint at a time. The tracker calculates your average velocity, trend (accelerating/stable/decelerating), and forecasts next sprint capacity. Export as Markdown or Jira Wiki format.",
    },
    {
      question: "What does 'trend' mean?",
      answer:
        "Trend compares your current sprint velocity to the previous sprint. Accelerating means velocity is increasing (team improving), stable means consistent performance, and decelerating means velocity is decreasing (possible blockers).",
    },
    {
      question: "How is forecast calculated?",
      answer:
        "Forecast uses your average velocity across all sprints as the predicted capacity for the next sprint. If your average is 35 points, the next sprint forecast is 35 points.",
    },
    {
      question: "Can I edit or delete sprints?",
      answer:
        "Yes! Remove any sprint using the Remove button in the sprint history. Your metrics and chart will update automatically.",
    },
    {
      question: "How do I export the report?",
      answer:
        "Choose your format (Markdown or Jira Wiki) from the dropdown above the output. Copy the formatted text and paste it into your sprint planning docs or Jira tickets.",
    },
    {
      question: "Is this tool free?",
      answer:
        "Yes! Velocity Tracker is completely free and works locally in your browser. No data is stored or sent to any server.",
    },
    {
      question: "What if my team is remote?",
      answer:
        "Team size is just for per-person calculations. Remote teams benefit most from velocity tracking because it removes estimation guesswork and provides consistent forecasting.",
    },
  ];

  const faqSchema = buildFAQSchema(faqs);
  const toolSchema = buildToolSchema({
    name: "Velocity Tracker",
    description: "Track team sprint velocity, visualize trends, and forecast future sprint capacity with metrics-driven planning.",
    url: "https://agiletoolhub.com/tools/velocity-tracker",
    applicationCategory: "BusinessApplication",
  });

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={toolSchema} />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Velocity Tracker</h1>
          <p className="text-xl text-blue-100">
            Track team sprint velocity, visualize trends, and forecast future capacity with metrics-driven planning.
          </p>
        </div>
      </div>

      {/* Tool */}
      <div className="py-8 px-4">
        <VelocityTracker />
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Track Velocity?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Accurate Forecasting</h3>
              <p className="text-gray-600">
                Use historical velocity to predict how many points your team can commit in future sprints.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">Identify Trends</h3>
              <p className="text-gray-600">
                Spot acceleration (team improving) or deceleration (blockers emerging) immediately.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-2">Team Insights</h3>
              <p className="text-gray-600">
                Calculate velocity per person to understand individual and team capacity bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Usage */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Example Usage
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Scenario: Ramping Up a New Team</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Sprint 1:</p>
                <p className="text-gray-600">Planned: 30 pts | Completed: 20 pts (67% completion)</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Sprint 2:</p>
                <p className="text-gray-600">Planned: 30 pts | Completed: 26 pts (87% completion)</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Sprint 3:</p>
                <p className="text-gray-600">Planned: 40 pts | Completed: 38 pts (95% completion)</p>
              </div>
              <div className="border-t border-gray-300 pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700">Result:</p>
                <ul className="text-gray-600 list-disc list-inside space-y-1 mt-2">
                  <li>Average Velocity: 28 pts/sprint</li>
                  <li>Trend: Accelerating (+46% from Sprint 1 to Sprint 3)</li>
                  <li>Forecast: 28 pts for next sprint</li>
                  <li>→ Plan Sprint 4 with confidence: 28-30 pts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <FAQ items={faqs} />
        </div>
      </div>

      {/* Related Tools */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Related Tools
          </h2>
          <RelatedLinks
            links={[
              { title: "Sprint Velocity Tracking Guide", href: "/guides/sprint-velocity-tracking-guide" },
              { title: "Sprint Capacity Planning Guide", href: "/guides/sprint-capacity-planning-guide" },
              { title: "Story Point Estimation Guide", href: "/guides/story-point-estimation-guide-with-examples" },
              { title: "Sprint Planning Template", href: "/templates/sprint-planning-template" },
              { title: "Sprint Capacity Calculator", href: "/tools/sprint-capacity-calculator" },
              { title: "Daily Standup Generator", href: "/tools/daily-standup-generator" },
              { title: "User Story Generator", href: "/tools/user-story-generator" },
            ]}
          />
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
