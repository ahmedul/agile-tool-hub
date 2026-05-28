import type { Metadata } from "next";
import TemplateCard from "@/components/TemplateCard";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Agile & Scrum Guides for Software Teams | AgileToolHub",
  description: "Practical guides on how to write Jira tickets, bug reports, user stories, and acceptance criteria for engineering teams.",
};

export default function GuidesPage() {
  const guides = getAllContent("guides");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Agile & Scrum Guides</h1>
      <p className="text-lg text-gray-600 mb-10">Practical, no-fluff guides for engineering teams on how to write better tickets, reports, and stories.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {guides.map((g) => (
          <TemplateCard key={g.slug} title={g.title} description={g.description} href={`/guides/${g.slug}`} category={g.category} />
        ))}
      </div>
    </div>
  );
}
