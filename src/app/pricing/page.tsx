import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "AgileToolHub pricing for Local and AI modes. Local mode is free forever. AI mode coming soon with paid plans.",
  canonical: "https://agiletoolhub.com/pricing",
});

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Free forever",
    highlighted: false,
    features: [
      "Unlimited Local mode",
      "All tools available",
      "No account required",
      "AI mode (coming soon)",
    ],
  },
  {
    name: "Pro",
    price: "$12/mo",
    subtitle: "When AI mode launches",
    highlighted: true,
    features: [
      "Everything in Free",
      "AI mode with 800 generations/month (coming soon)",
      "Priority support (coming soon)",
    ],
  },
  {
    name: "Team",
    price: "$39/mo",
    subtitle: "For teams and organizations",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Team management (coming soon)",
      "Usage analytics (coming soon)",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Pricing</h1>
        <p className="text-gray-600 mb-2">
          All tools are free with Local mode. AI mode coming soon with paid plans.
        </p>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 inline-block">
          🚀 AI mode is currently <strong>coming soon</strong> — stay tuned!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 bg-white ${
              plan.highlighted ? "border-blue-500 shadow-lg" : "border-gray-200"
            }`}
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{plan.name}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</p>
            <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button
              className={`mt-6 w-full rounded-lg py-2.5 font-medium transition-colors ${
                plan.highlighted
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {plan.name === "Free" ? "Current default" : "Coming soon"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">One-time purchase</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Jira &amp; Agile Starter Pack · €29</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            A curated bundle of Jira-ready stories, bug reports, acceptance criteria, Scrum checklists, and AI prompts.
          </p>
        </div>
        <Link
          href="/packs/jira-agile-starter-pack"
          className="mt-4 inline-block whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 md:mt-0"
        >
          View the starter pack
        </Link>
      </div>

      <div className="text-center mt-10">
        <Link href="/tools" className="text-blue-600 hover:underline">
          Back to Tools
        </Link>
      </div>
    </div>
  );
}
