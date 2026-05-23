import type { Metadata } from "next";
import TemplateCard from "@/components/TemplateCard";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Agile & Scrum Docs — Reference Guides for Software Teams",
  description: "Reference documentation on Agile, Scrum, and Jira concepts for software teams. Glossaries, definitions, and process breakdowns.",
};

export default function DocsPage() {
  const docs = getAllContent("docs");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Agile & Scrum Docs</h1>
      <p className="text-lg text-gray-600 mb-10">
        Reference documentation on Agile, Scrum, and Jira concepts. Look up terms, processes, and best practices.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
        {docs.map((doc) => (
          <TemplateCard key={doc.slug} title={doc.title} description={doc.description} href={`/docs/${doc.slug}`} category="Docs" />
        ))}
      </div>
    </div>
  );
}
