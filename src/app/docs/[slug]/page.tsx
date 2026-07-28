import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";
import JsonLd from "@/components/JsonLd";
import { mdxComponents } from "@/components/MDXComponents";
import { mdxRemoteOptions } from "@/lib/mdx";
import { buildArticleSchema, buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getAllSlugs("docs").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("docs", slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    canonical: `https://agiletoolhub.com/docs/${slug}`,
    ogType: "article",
  });
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("docs", slug);
  if (!item) notFound();

  const jsonLd = buildArticleSchema({
    title: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/docs/${slug}`,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    section: "Docs",
    keywords: item.keywords,
  });
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: item.title, href: `/docs/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ContentLayout
        title={item.title}
        description={item.description}
        category={item.category}
        updatedAt={item.updatedAt}
        breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
      >
        <MDXRemote source={item.content} options={mdxRemoteOptions} components={mdxComponents} />
      </ContentLayout>
    </>
  );
}
