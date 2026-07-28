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
  return getAllSlugs("examples").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("examples", slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    canonical: `https://agiletoolhub.com/examples/${slug}`,
    ogType: "article",
  });
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("examples", slug);
  if (!item) notFound();

  const jsonLd = buildArticleSchema({
    title: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/examples/${slug}`,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    section: "Examples",
    keywords: item.keywords,
  });
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Examples", href: "/examples" },
    { label: item.title, href: `/examples/${slug}` },
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
        breadcrumbs={[{ label: "Examples", href: "/examples" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
      >
        <MDXRemote source={item.content} options={mdxRemoteOptions} components={mdxComponents} />
      </ContentLayout>
    </>
  );
}
