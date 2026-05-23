import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export default function ToolCard({ title, description, href, badge = "Free Tool" }: ToolCardProps) {
  return (
    <Link href={href} className="block border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all bg-white">
      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{badge}</span>
      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
      <span className="mt-4 inline-block text-sm text-blue-600 font-medium">Try it free →</span>
    </Link>
  );
}
