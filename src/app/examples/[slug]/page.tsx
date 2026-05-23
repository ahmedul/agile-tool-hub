import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";

export async function generateStaticParams() {
  return getAllSlugs("examples").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("examples", slug);
  if (!item) return {};
  return { title: item.title, description: item.description, keywords: item.keywords };
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("examples", slug);
  if (!item) notFound();

  return (
    <ContentLayout
      title={item.title}
      description={item.description}
      category={item.category}
      breadcrumbs={[{ label: "Examples", href: "/examples" }, { label: item.title }]}
      relatedLinks={item.relatedLinks}
    >
      <MDXRemote source={item.content} />
    </ContentLayout>
  );
}
