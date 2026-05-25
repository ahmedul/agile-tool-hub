import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | AgileToolHub",
  description:
    "Privacy policy for AgileToolHub, including clear handling for Local mode and AI mode across generator tools.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumbs items={[{ label: "Privacy" }]} />

      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Policy</span>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Privacy Policy</h1>
      <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
        This page explains what data AgileToolHub processes and how data handling differs between
        Local mode and AI mode.
      </p>

      <div className="prose prose-gray max-w-none">
        <p>
          Last updated: May 24, 2026
        </p>

        <h2>1. Overview</h2>
        <p>
          AgileToolHub provides templates and tools for software delivery workflows. Some tools run
          fully in your browser, and some tools offer an optional AI mode.
        </p>

        <h2>2. Local mode (browser-only)</h2>
        <p>
          In Local mode, generation happens in your browser. Input content is not sent to our server
          for model inference.
        </p>
        <ul>
          <li>Input stays on your device during generation</li>
          <li>We may store local usage counters in your browser (for feature limits)</li>
          <li>No account is required for Local mode</li>
        </ul>

        <h2>3. AI mode</h2>
        <p>
          In AI mode, your input is sent to our server and then securely forwarded to the AI provider
          to generate output.
        </p>
        <ul>
          <li>Input may include ticket notes, feature descriptions, or transcript text you paste</li>
          <li>Output is returned to your browser after generation</li>
          <li>Do not paste secrets, credentials, private keys, or regulated data unless approved by your organization</li>
        </ul>

        <h2>4. Analytics</h2>
        <p>
          We use website analytics to understand aggregate traffic and feature usage trends. This helps
          us improve content and tools.
        </p>

        <h2>5. Cookies and local storage</h2>
        <p>
          AgileToolHub may use browser storage for product functionality, such as session continuity,
          local preferences, and usage counters.
        </p>

        <h2>6. Security and retention</h2>
        <p>
          We use reasonable safeguards for data in transit. However, no method of transmission or
          storage is completely secure.
        </p>

        <h2>7. Third-party services</h2>
        <p>
          We may use third-party services for analytics, hosting, and AI generation. Those services
          have their own terms and privacy practices.
        </p>

        <h2>8. Your choices</h2>
        <ul>
          <li>Use Local mode if you do not want text sent for AI inference</li>
          <li>Avoid pasting sensitive internal data into any online tool</li>
          <li>Clear your browser storage if you want to remove local counters and preferences</li>
        </ul>

        <h2>9. Contact</h2>
        <p>
          Questions about this policy can be sent through future support channels. Until then, use
          the public project contact path on GitHub.
        </p>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related pages</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/about" className="text-blue-600 hover:underline">
              → About
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="text-blue-600 hover:underline">
              → Pricing
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
