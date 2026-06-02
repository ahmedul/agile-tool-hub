import type { Metadata } from "next";

/**
 * SEO Metadata Builder
 * Standardizes metadata across all pages for consistent SEO
 */

export interface SEOMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  authors?: string[];
  robots?: string;
}

/**
 * Build comprehensive SEO metadata for a page
 */
export function buildMetadata(options: SEOMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = "https://agiletoolhub.com/og-image.png",
    ogType = "website",
    authors = ["AgileToolHub"],
    robots = "index, follow",
  } = options;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots,
    authors: authors.map((name) => ({ name })),
    openGraph: {
      title,
      description,
      type: ogType,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: canonical ? { canonical } : undefined,
  };

  return metadata;
}

/**
 * Build BreadcrumbList schema for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl = "https://agiletoolhub.com"
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };
}

/**
 * Build Tool/SoftwareApplication schema for tool pages
 */
export interface ToolSchemaOptions {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  creator?: {
    name: string;
    url: string;
  };
}

export function buildToolSchema(options: ToolSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: options.applicationCategory,
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: options.offers
      ? {
          "@type": "Offer",
          price: options.offers.price,
          priceCurrency: options.offers.priceCurrency,
        }
      : {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
    creator: options.creator || {
      "@type": "Organization",
      name: "AgileToolHub",
      url: "https://agiletoolhub.com",
    },
    isAccessibleForFree: true,
  };
}

/**
 * Build Organization schema (for homepage)
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AgileToolHub",
    url: "https://agiletoolhub.com",
    logo: "https://agiletoolhub.com/logo.png",
    description: "Free Agile, Scrum, and software delivery templates and tools",
    sameAs: [
      "https://twitter.com/agile-tool-hub",
      "https://github.com/ahmedul/agile-tool-hub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "N/A",
      contactType: "Customer Service",
      areaServed: "Worldwide",
      availableLanguage: ["en"],
    },
  };
}

/**
 * Build FAQPage schema with structured Q&A
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Suggested keywords for common pages
 */
export const KEYWORDS = {
  homepage: [
    "agile tools",
    "scrum tools",
    "free jira templates",
    "user story generator",
    "acceptance criteria",
    "bug report template",
  ],
  tools: [
    "agile tools",
    "scrum tools",
    "planning poker",
    "user story generator",
    "acceptance criteria generator",
    "jira tools",
  ],
  userStory: [
    "user story generator",
    "user story template",
    "agile user stories",
    "jira user story",
    "story writing",
    "acceptance criteria",
  ],
  acceptanceCriteria: [
    "acceptance criteria generator",
    "acceptance criteria template",
    "gherkin scenarios",
    "BDD testing",
    "test cases",
    "agile testing",
  ],
  bugReport: [
    "bug report template",
    "jira bug report",
    "bug tracking",
    "issue reporting",
    "bug severity",
    "reproducible bugs",
  ],
  velocityTracker: [
    "velocity tracker",
    "sprint velocity",
    "agile metrics",
    "team capacity",
    "sprint planning",
    "velocity forecasting",
  ],
  templates: [
    "agile templates",
    "scrum templates",
    "jira templates",
    "retrospective template",
    "sprint planning template",
    "postmortem template",
  ],
};
