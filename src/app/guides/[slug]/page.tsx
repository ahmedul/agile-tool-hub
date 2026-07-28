import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";
import JsonLd from "@/components/JsonLd";
import { mdxComponents } from "@/components/MDXComponents";
import { mdxRemoteOptions } from "@/lib/mdx";
import { DEFAULT_OG_IMAGE_URL, buildArticleSchema, buildBreadcrumbSchema, buildHowToSchema, buildFAQSchema, buildImageSchema, buildMetadata } from "@/lib/seo";

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

  const jsonLd = buildArticleSchema({
    title: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/guides/${slug}`,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    section: "Guides",
    keywords: item.keywords,
  });
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: item.title, href: `/guides/${slug}` },
  ]);
  const howToJsonLd = item.howToSteps ? buildHowToSchema({
    title: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/guides/${slug}`,
    steps: item.howToSteps,
    estimatedTime: "PT15M",
  }) : null;
  const faqJsonLd = item.faqItems && item.faqItems.length > 0 ? buildFAQSchema(item.faqItems) : null;
  const imageJsonLd = buildImageSchema({
    url: DEFAULT_OG_IMAGE_URL,
    title: item.title,
    description: item.description,
    width: 1200,
    height: 630,
    contentUrl: DEFAULT_OG_IMAGE_URL,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {howToJsonLd && <JsonLd data={howToJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={imageJsonLd} />
      <ContentLayout
        title={item.title}
        description={item.description}
        category={item.category}
        updatedAt={item.updatedAt}
        breadcrumbs={[{ label: "Guides", href: "/guides" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
      >
        <MDXRemote source={item.content} options={mdxRemoteOptions} components={mdxComponents} />
      </ContentLayout>
    </>
  );
}
