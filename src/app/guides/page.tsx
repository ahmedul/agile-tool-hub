import type { Metadata } from "next";
import TemplateCard from "@/components/TemplateCard";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import JsonLd from "@/components/JsonLd";
import { getAllContent } from "@/lib/content";
import { buildMetadata, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Agile & Scrum Guides for Software Teams",
  description: "Practical guides on how to write Jira tickets, bug reports, user stories, and acceptance criteria for engineering teams.",
  keywords: [
    "agile guides",
    "scrum guides",
    "jira guides",
    "agile best practices",
    "sprint planning guide",
    "retrospective guide",
  ],
  canonical: "https://agiletoolhub.com/guides",
});

export default function GuidesPage() {
  const guides = getAllContent("guides");
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <HeroSection
        title="Master Agile best practices. Learn how to run ceremonies better."
        description="Comprehensive guides, examples, and anti-patterns for every agile ritual."
        gradientFrom="from-blue-600"
        gradientTo="to-purple-100"
      />
      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Guides (top 2) */}
        {guides.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {guides.slice(0, 2).map((g, idx) => (
              <FeaturedCard
                key={g.slug}
                title={g.title}
                description={g.description}
                href={`/guides/${g.slug}`}
                category={g.category || "Guide"}
                accentColor={idx % 2 === 0 ? "blue" : "orange"}
              />
            ))}
          </div>
        )}

        {/* Standard Guides Grid */}
        {guides.length > 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(2).map((g) => (
              <TemplateCard key={g.slug} title={g.title} description={g.description} href={`/guides/${g.slug}`} category={g.category} />
            ))}
          </div>
        )}

        {/* Fallback for <= 2 guides */}
        {guides.length <= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((g) => (
              <TemplateCard key={g.slug} title={g.title} description={g.description} href={`/guides/${g.slug}`} category={g.category} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
