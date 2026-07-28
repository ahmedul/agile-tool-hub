import { ReactNode } from "react";
import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import RelatedLinks from "./RelatedLinks";
import CTASection, { CTAProps } from "./CTASection";

interface ContentLayoutProps {
  title: string;
  description: string;
  category: string;
  updatedAt?: string;
  breadcrumbs: { label: string; href?: string }[];
  relatedLinks?: { title: string; href: string }[];
  children: ReactNode;
  showCTA?: boolean;
  ctaProps?: CTAProps;
  preContent?: ReactNode;
}

function inferCta(title: string, category: string, relatedLinks?: { title: string; href: string }[]): CTAProps {
  const lowerTitle = title.toLowerCase();
  const categoryRoute = `/${category.toLowerCase()}`;
  const toolLink = relatedLinks?.find((link) => link.href.startsWith("/tools/"));

  if (toolLink) {
    return {
      title: `Try the ${toolLink.title}`,
      description: `Use ${toolLink.title} to generate cleaner, Jira-ready output in seconds.`,
      primaryHref: toolLink.href,
      primaryLabel: `Try ${toolLink.title}`,
      secondaryHref: categoryRoute,
      secondaryLabel: `Browse ${category}`,
    };
  }

  if (lowerTitle.includes("user story")) {
    return {
      title: "Try the User Story Generator",
      description: "Turn rough feature notes into structured, Jira-ready user stories with acceptance criteria.",
      primaryHref: "/tools/user-story-generator",
      primaryLabel: "Try User Story Generator",
      secondaryHref: categoryRoute,
      secondaryLabel: `Browse ${category}`,
    };
  }

  if (lowerTitle.includes("acceptance criteria")) {
    return {
      title: "Try the Acceptance Criteria Generator",
      description: "Generate testable Given/When/Then and checklist acceptance criteria for your backlog items.",
      primaryHref: "/tools/acceptance-criteria-generator",
      primaryLabel: "Try AC Generator",
      secondaryHref: categoryRoute,
      secondaryLabel: `Browse ${category}`,
    };
  }

  if (lowerTitle.includes("bug") || lowerTitle.includes("jira")) {
    return {
      title: "Try the Bug Report Converter",
      description: "Paste messy bug notes and get a clean, structured Jira ticket in seconds.",
      primaryHref: "/tools/bug-report-to-jira-ticket-converter",
      primaryLabel: "Try Bug Converter",
      secondaryHref: categoryRoute,
      secondaryLabel: `Browse ${category}`,
    };
  }

  return {
    secondaryHref: categoryRoute,
    secondaryLabel: `Browse ${category}`,
  };
}

export default function ContentLayout({
  title,
  description,
  category,
  updatedAt,
  breadcrumbs,
  relatedLinks,
  children,
  showCTA = true,
  ctaProps,
  preContent,
}: ContentLayoutProps) {
  const resolvedCta = ctaProps ?? inferCta(title, category, relatedLinks);
  const parsedUpdatedAt = updatedAt ? new Date(updatedAt) : null;
  const showUpdatedAt = !!parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime());
  const topRelatedLinks = relatedLinks?.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto min-w-0 overflow-hidden px-4 py-10">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{category}</span>
        {showUpdatedAt && (
          <span className="text-xs text-gray-500">
            Updated {parsedUpdatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        )}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4 break-words">{title}</h1>
      <p className="text-lg text-gray-600 mb-10 border-b border-gray-200 pb-8 break-words">{description}</p>
      {preContent}
      {!!topRelatedLinks?.length && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Quick links</p>
          <ul className="space-y-1">
            {topRelatedLinks.map((link) => (
              <li key={`top-${link.href}`}>
                <Link href={link.href} className="text-sm text-blue-700 hover:underline">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="prose prose-gray max-w-none min-w-0">{children}</div>
      {relatedLinks && <RelatedLinks links={relatedLinks} />}
      {showCTA && <CTASection {...resolvedCta} />}
    </div>
  );
}
