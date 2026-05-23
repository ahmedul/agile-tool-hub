import Link from "next/link";

interface CTAProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function CTASection({
  title = "Try the Bug Report Converter",
  description = "Paste messy bug notes and get a clean, structured Jira ticket in seconds.",
  primaryHref = "/tools/bug-report-to-jira-ticket-converter",
  primaryLabel = "Try the Converter",
  secondaryHref = "/templates",
  secondaryLabel = "Browse Templates",
}: CTAProps) {
  return (
    <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={primaryHref} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          {primaryLabel}
        </Link>
        <Link href={secondaryHref} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
