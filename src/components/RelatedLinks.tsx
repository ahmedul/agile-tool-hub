import TrackedLink from "./TrackedLink";

interface RelatedLink {
  title: string;
  href: string;
}

export default function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Related Resources</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <TrackedLink
              href={link.href}
              label={link.title}
              eventParams={{ surface: "article_related_links" }}
              className="text-blue-600 hover:underline"
            >
              → {link.title}
            </TrackedLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
