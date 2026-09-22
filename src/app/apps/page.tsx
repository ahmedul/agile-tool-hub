import type { Metadata } from "next";
import Link from "next/link";
import AppDirectory from "@/components/AppDirectory";
import { apps } from "@/lib/apps";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Apps for everyday productivity, reminders, and wellbeing",
  description: "Explore simple Android apps from AgileToolHub for document reminders, returns, free trials, invoices, and healthy desk breaks.",
  keywords: ["Android apps", "productivity apps", "reminder apps", "AgileToolHub apps"],
  canonical: "https://agiletoolhub.com/apps",
});

export default function AppsPage() {
  return (
    <>
      <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm font-medium text-blue-700 hover:underline">← Back to AgileToolHub</Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">AgileToolHub Apps</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Small apps for the things you do not want to forget.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">A growing collection of focused Android apps for workday wellbeing, everyday reminders, returns, invoices, and subscriptions.</p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold text-gray-500">{apps.length} apps</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Browse the collection</h2></div>
          <p className="max-w-md text-sm text-gray-500 sm:text-right">Each app is designed around one clear job, with no unnecessary complexity.</p>
        </div>
        <AppDirectory />
      </main>
    </>
  );
}
