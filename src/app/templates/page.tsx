import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import JsonLd from "@/components/JsonLd";
import { getAllContent } from "@/lib/content";
import { buildMetadata, buildBreadcrumbSchema, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Agile & Scrum Templates for Software Teams",
  description: "Browse 10+ free Jira-ready templates. Bug report, user story, acceptance criteria, retrospective, postmortem, feature request templates and more for Agile teams.",
  keywords: KEYWORDS.templates,
  canonical: "https://agiletoolhub.com/templates",
});

export default function TemplatesPage() {
  const templates = getAllContent("templates");
  const priorityTemplateSlugs = [
    "complete-jira-ticket-template",
    "api-requirements-jira-template",
  ];
  const prioritizedTemplates = [
    ...priorityTemplateSlugs
      .map((slug) => templates.find((t) => t.slug === slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    ...templates.filter((t) => !priorityTemplateSlugs.includes(t.slug)),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Templates", href: "/templates" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <HeroSection
        title="Save time. Use proven templates for every ceremony."
        description="Structured templates for sprint planning, retrospectives, user stories, bug reports, and more."
        gradientFrom="from-blue-600"
        gradientTo="to-blue-100"
      />
      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Cards (top 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {prioritizedTemplates.slice(0, 2).map((t, idx) => (
            <FeaturedCard
              key={t.slug}
              title={t.title}
              description={t.description}
              href={`/templates/${t.slug}`}
              category={t.category}
              accentColor={idx % 2 === 0 ? "blue" : "orange"}
            />
          ))}
        </div>

        {/* Standard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prioritizedTemplates.slice(2).map((t) => (
            <TemplateCard key={t.slug} title={t.title} description={t.description} href={`/templates/${t.slug}`} category={t.category} />
          ))}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Looking for examples or guides?</h2>
        <div className="flex gap-4">
          <Link href="/examples" className="text-blue-600 hover:underline">Browse Examples →</Link>
          <Link href="/guides" className="text-blue-600 hover:underline">Read Guides →</Link>
        </div>
      </div>
    </>
  );
}
