import Link from "next/link";

interface TemplateCardProps {
  title: string;
  description: string;
  href: string;
  category: string;
}

export default function TemplateCard({ title, description, href, category }: TemplateCardProps) {
  return (
    <Link href={href} className="block border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all bg-white">
      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{category}</span>
      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
      <span className="mt-4 inline-block text-sm text-blue-600 font-medium">View template →</span>
    </Link>
  );
}
