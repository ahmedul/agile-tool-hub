import { ReactNode } from "react";

type AccentColor = "blue" | "orange";

interface CategoryGridSectionProps {
  title: string;
  items: Array<Record<string, any>>;
  featuredCount?: number;
  CardComponent: React.ComponentType<any>;
  FeaturedCardComponent?: React.ComponentType<any>;
}

export default function CategoryGridSection({
  title,
  items,
  featuredCount = 2,
  CardComponent,
  FeaturedCardComponent,
}: CategoryGridSectionProps) {
  // Ensure featuredCount is within valid range (0-2)
  const validFeaturedCount = Math.min(Math.max(featuredCount, 0), 2);

  // Separate featured and standard items
  const featuredItems = items.slice(0, validFeaturedCount);
  const standardItems = items.slice(validFeaturedCount);

  // Helper function to get accent color based on index
  const getAccentColor = (index: number): AccentColor => {
    return index % 2 === 0 ? "blue" : "orange";
  };

  return (
    <section className="w-full">
      {/* Section Heading */}
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
        {title}
      </h2>

      {/* Featured Cards Grid */}
      {featuredItems.length > 0 && FeaturedCardComponent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {featuredItems.map((item, index) => (
            <FeaturedCardComponent
              key={index}
              {...item}
              accentColor={getAccentColor(index)}
            />
          ))}
        </div>
      )}

      {/* Standard Cards Grid */}
      {standardItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardItems.map((item, index) => (
            <CardComponent key={index} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
