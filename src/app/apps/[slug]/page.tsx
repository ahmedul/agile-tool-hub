import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppIcon from "@/components/AppIcon";
import JsonLd from "@/components/JsonLd";
import { apps, getApp } from "@/lib/apps";
import { buildFAQSchema, buildMetadata } from "@/lib/seo";

export function generateStaticParams() { return apps.map((app) => ({ slug: app.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const app = getApp((await params).slug);
  if (!app) return {};
  return buildMetadata({ title: app.seoTitle, description: app.description, keywords: [app.name, `${app.name} Android app`, app.category], canonical: `https://agiletoolhub.com/apps/${app.slug}` });
}

export default async function AppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  const appSchema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: app.name, description: app.description, applicationCategory: app.category, operatingSystem: "Android", softwareVersion: "1.0", url: `https://agiletoolhub.com/apps/${app.slug}`, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };

  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={buildFAQSchema(app.faqs)} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/apps" className="text-sm font-medium text-blue-700 hover:underline">← All apps</Link>
        <section className="mt-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <AppIcon accent={app.accent} icon={app.icon} size="large" />
            <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{app.category} · {app.platform}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{app.seoTitle}</h1><p className="mt-2 text-sm text-gray-500">{app.name} · {app.packageName}</p></div>
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-700">{app.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {app.playStoreUrl ? <a href={app.playStoreUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Get it on Google Play ↗</a> : <span className="rounded-lg bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-800">Coming soon</span>}
            <span className="text-sm text-gray-500">{app.status} · Free to download</span>
          </div>
        </section>
        <section className="py-12"><h2 className="text-2xl font-bold text-gray-900">Built to stay out of your way</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{app.features.map((feature) => <div key={feature} className="rounded-xl border border-gray-200 bg-white p-5"><span className="text-xl text-blue-600">✦</span><p className="mt-3 font-medium text-gray-800">{feature}</p></div>)}</div></section>
        <section className="border-t border-gray-200 py-12"><h2 className="text-2xl font-bold text-gray-900">Useful for</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{app.useCases.map((useCase) => <li key={useCase} className="flex gap-3 rounded-lg bg-gray-50 p-4 text-gray-700"><span className="text-blue-600">✓</span>{useCase}</li>)}</ul></section>
        <section className="border-t border-gray-200 py-12"><h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2><div className="mt-5 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">{app.faqs.map((faq) => <details key={faq.question} className="group p-5"><summary className="cursor-pointer list-none pr-8 font-semibold text-gray-900 group-open:text-blue-700">{faq.question}<span className="float-right text-gray-400 group-open:rotate-45">＋</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{faq.answer}</p></details>)}</div></section>
      </main>
    </>
  );
}
