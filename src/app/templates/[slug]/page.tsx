import { getAllSlugs, getContentBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { MDXRemote } from "next-mdx-remote/rsc";
import JsonLd from "@/components/JsonLd";
import TemplateCopyActions from "@/components/TemplateCopyActions";

const HIGH_INTENT_TEMPLATE_SLUGS = new Set([
  "jira-bug-report-template",
  "user-story-template",
  "acceptance-criteria-template",
  "qa-test-case-template",
  "technical-debt-ticket-template",
]);

function extractFirstCodeBlock(content: string): string | null {
  const match = content.match(/```(?:[\w-]+)?\n([\s\S]*?)```/);
  return match?.[1]?.trim() || null;
}

function getTemplateCta(slug: string) {
  if (slug.includes("user-story")) {
    return {
      title: "Try the User Story Generator",
      description: "Turn rough notes into structured, Jira-ready user stories with acceptance criteria.",
      primaryHref: "/tools/user-story-generator",
      primaryLabel: "Try User Story Generator",
      secondaryHref: "/templates",
      secondaryLabel: "Browse Templates",
    };
  }

  if (slug.includes("acceptance-criteria")) {
    return {
      title: "Try the Acceptance Criteria Generator",
      description: "Generate testable Given/When/Then and checklist criteria in seconds.",
      primaryHref: "/tools/acceptance-criteria-generator",
      primaryLabel: "Try AC Generator",
      secondaryHref: "/templates",
      secondaryLabel: "Browse Templates",
    };
  }

  if (slug.includes("bug") || slug.includes("jira")) {
    return {
      title: "Try the Bug Report Converter",
      description: "Paste messy notes and get a clean Jira bug ticket with clear repro steps.",
      primaryHref: "/tools/bug-report-to-jira-ticket-converter",
      primaryLabel: "Try Bug Converter",
      secondaryHref: "/templates",
      secondaryLabel: "Browse Templates",
    };
  }

  return undefined;
}

export async function generateStaticParams() {
  return getAllSlugs("templates").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug("templates", slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    keywords: item.keywords,
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getContentBySlug("templates", slug);
  if (!item) notFound();

  const codeBlock = extractFirstCodeBlock(item.content);
  const showCopyActions = HIGH_INTENT_TEMPLATE_SLUGS.has(slug) && !!codeBlock;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description,
    url: `https://agiletoolhub.com/templates/${slug}`,
    publisher: { "@type": "Organization", name: "AgileToolHub", url: "https://agiletoolhub.com" },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentLayout
        title={item.title}
        description={item.description}
        category={item.category}
        breadcrumbs={[{ label: "Templates", href: "/templates" }, { label: item.title }]}
        relatedLinks={item.relatedLinks}
        ctaProps={getTemplateCta(slug)}
        preContent={showCopyActions && codeBlock ? <TemplateCopyActions markdown={codeBlock} /> : null}
      >
        <MDXRemote source={item.content} />
      </ContentLayout>
    </>
  );
}
