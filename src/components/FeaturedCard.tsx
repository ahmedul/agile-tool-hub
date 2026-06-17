import Link from "next/link";

type AccentColor = "blue" | "orange" | "green";

interface FeaturedCardProps {
  title: string;
  description: string;
  href: string;
  category?: string;
  accentColor?: AccentColor;
}

const accentColorConfig = {
  blue: {
    border: "border-l-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  orange: {
    border: "border-l-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  green: {
    border: "border-l-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
};

export default function FeaturedCard({
  title,
  description,
  href,
  category,
  accentColor = "blue",
}: FeaturedCardProps) {
  const colors = accentColorConfig[accentColor];

  return (
    <Link
      href={href}
      className={`block relative border-l-4 ${colors.border} ${colors.bg} rounded-xl p-8 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900`}
    >
      {/* Featured Badge */}
      <div className={`absolute top-4 right-4 ${colors.badge} px-3 py-1 rounded-full text-xs font-semibold`}>
        Featured
      </div>

      {/* Category Label */}
      {category && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {category}
        </span>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-3 pr-24">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
        {description}
      </p>

      {/* CTA Link */}
      <span className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
        Learn more →
      </span>
    </Link>
  );
}
