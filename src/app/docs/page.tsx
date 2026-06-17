import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import TemplateCard from "@/components/TemplateCard";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Agile & Scrum Docs — Reference Guides for Software Teams",
  description: "Reference documentation on Agile, Scrum, and Jira concepts for software teams. Glossaries, definitions, and process breakdowns.",
};

export default function DocsPage() {
  const docs = getAllContent("docs");
  const featuredDocs = docs.slice(0, 2);
  const standardDocs = docs.slice(2);

  return (
    <>
      <HeroSection
        title="Agile explained. Definitions, patterns, and real examples."
        description="Quick reference docs for agile terminology, scrum ceremonies, and methodologies."
        gradientFrom="from-purple-600"
        gradientTo="to-blue-100"
      />

      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Docs (top 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {featuredDocs.map((doc, idx) => (
            <FeaturedCard
              key={doc.slug}
              title={doc.title}
              description={doc.description}
              href={`/docs/${doc.slug}`}
              category={doc.category || "Docs"}
              accentColor={idx % 2 === 0 ? "blue" : "orange"}
            />
          ))}
        </div>

        {/* Standard Docs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardDocs.map((doc) => (
            <TemplateCard key={doc.slug} title={doc.title} description={doc.description} href={`/docs/${doc.slug}`} category="Docs" />
          ))}
        </div>
      </section>
    </>
  );
}
