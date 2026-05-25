import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";
import JsonLd from "@/components/JsonLd";
import { getAllContent } from "@/lib/content";
import { buildMetadata, buildBreadcrumbSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Agile & Scrum Templates for Software Teams — AgileToolHub",
  description: "Browse 10+ free Jira-ready templates. Bug report, user story, acceptance criteria, retrospective, postmortem, feature request templates and more for Agile teams.",
  keywords: KEYWORDS.templates,
  canonical: "https://agile-tool-hub.vercel.app/templates",
});

export default function TemplatesPage() {
  const templates = getAllContent("templates");
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Templates", href: "/templates" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Agile & Scrum Templates</h1>
      <p className="text-lg text-gray-600 mb-10">Copy-paste templates for software teams. Structured, practical, and ready to use in Jira, Notion, or any tool.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <TemplateCard key={t.slug} title={t.title} description={t.description} href={`/templates/${t.slug}`} category={t.category} />
        ))}
      </div>
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Looking for examples or guides?</h2>
        <div className="flex gap-4">
          <Link href="/examples" className="text-blue-600 hover:underline">Browse Examples →</Link>
          <Link href="/guides" className="text-blue-600 hover:underline">Read Guides →</Link>
        </div>
      </div>
      </div>
    </>
  );
}
