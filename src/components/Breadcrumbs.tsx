import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-6 min-w-0" aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-1 items-center">
        <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-600">{item.label}</Link>
            ) : (
              <span className="text-gray-700 break-words">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
