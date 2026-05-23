import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";
import JsonLd from "@/components/JsonLd";

export async function generateStaticParams() {
  return getAllSlugs("docs").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("docs", slug);
  if (!item) return {};
  return { title: item.title, description: item.description, keywords: item.keywords };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("docs", slug);
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/docs/${slug}`,
    publisher: { "@type": "Organization", name: "AgileToolHub", url: "https://agiletoolhub.com" },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentLayout
        title={item.title}
        description={item.description}
        category={item.category}
        breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
      >
        <MDXRemote source={item.content} />
      </ContentLayout>
    </>
  );
}
