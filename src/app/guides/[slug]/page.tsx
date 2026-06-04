import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getAllSlugs("guides").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("guides", slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    canonical: `https://agiletoolhub.com/guides/${slug}`,
    ogType: "article",
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("guides", slug);
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/guides/${slug}`,
    publisher: { "@type": "Organization", name: "AgileToolHub", url: "https://agiletoolhub.com" },
  };
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: item.title, href: `/guides/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ContentLayout
        title={item.title}
        description={item.description}
        category={item.category}
        breadcrumbs={[{ label: "Guides", href: "/guides" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
      >
        <MDXRemote source={item.content} />
      </ContentLayout>
    </>
  );
}
