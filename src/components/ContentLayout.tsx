import { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import RelatedLinks from "./RelatedLinks";
import CTASection from "./CTASection";

interface ContentLayoutProps {
  title: string;
  description: string;
  category: string;
  breadcrumbs: { label: string; href?: string }[];
  relatedLinks?: { title: string; href: string }[];
  children: ReactNode;
  showCTA?: boolean;
}

export default function ContentLayout({
  title,
  description,
  category,
  breadcrumbs,
  relatedLinks,
  children,
  showCTA = true,
}: ContentLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumbs items={breadcrumbs} />
      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{category}</span>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-10 border-b border-gray-200 pb-8">{description}</p>
      <div className="prose prose-gray max-w-none">{children}</div>
      {relatedLinks && <RelatedLinks links={relatedLinks} />}
      {showCTA && <CTASection />}
    </div>
  );
}
