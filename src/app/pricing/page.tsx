import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "AgileToolHub pricing for Local and AI modes. Local mode is free forever. AI mode coming soon with paid plans.",
};

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

      <div className="text-center mt-10">
        <Link href="/tools" className="text-blue-600 hover:underline">
          Back to Tools
        </Link>
      </div>
    </div>
  );
}
