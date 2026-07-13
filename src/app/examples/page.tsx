import type { Metadata } from "next";
import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";
import JsonLd from "@/components/JsonLd";
import { getAllContent } from "@/lib/content";
import { buildMetadata, buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Agile & Scrum Examples for Software Teams",
  description:
    "Real-world examples of bug reports, user stories, and acceptance criteria for software teams. Copy, adapt, and use in your own projects.",
  keywords: [
    "jira ticket examples",
    "bug report examples",
    "user story examples",
    "acceptance criteria examples",
    "agile examples",
    "scrum examples",
  ],
  canonical: "https://agiletoolhub.com/examples",
});

export default function ExamplesPage() {
  const examples = getAllContent("examples");
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Examples", href: "/examples" },
  ]);
  const collectionSchema = buildCollectionPageSchema({
    name: "Agile & Scrum Examples",
    description:
      "Real-world examples of bug reports, user stories, and acceptance criteria for software teams.",
    url: "https://agiletoolhub.com/examples",
    items: examples.map((example) => ({
      name: example.title,
      description: example.description,
      url: `https://agiletoolhub.com/examples/${example.slug}`,
    })),
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Agile & Scrum Examples</h1>
        <p className="text-lg text-gray-600 mb-10">Real-world examples to show you what good tickets, user stories, and acceptance criteria look like in practice.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {examples.map((e) => (
            <TemplateCard key={e.slug} title={e.title} description={e.description} href={`/examples/${e.slug}`} category={e.category} />
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Want templates instead?</h2>
          <Link href="/templates" className="text-blue-600 hover:underline">Browse Templates →</Link>
        </div>
      </div>
    </>
  );
}
