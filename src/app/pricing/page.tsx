import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | AgileToolHub",
  description:
    "AgileToolHub pricing for Local and AI modes. Start free with unlimited local generation and monthly AI credits.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Best for individual contributors",
    highlighted: false,
    features: [
      "Unlimited Local mode",
      "20 AI generations per month",
      "No account required",
    ],
  },
  {
    name: "Pro",
    price: "$12/mo",
    subtitle: "Best for power users",
    highlighted: true,
    features: [
      "Everything in Free",
      "800 AI generations per month",
      "Priority AI quality presets (coming soon)",
    ],
  },
  {
    name: "Team",
    price: "$39/mo",
    subtitle: "Best for product + engineering teams",
    highlighted: false,
    features: [
      "Shared templates and standards (coming soon)",
      "Usage analytics (coming soon)",
      "Team management and seats (coming soon)",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Pricing</h1>
        <p className="text-gray-600">
          Keep Local mode free forever. Upgrade for higher AI limits when you need more.
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
