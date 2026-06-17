"use client";
import Link from "next/link";
import { ReactNode } from "react";

interface CTAButton {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "outline";
}

interface HeroSectionProps {
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  ctaButtons?: CTAButton[];
  accentIcon?: ReactNode;
}

export default function HeroSection({
  title,
  description,
  gradientFrom,
  gradientTo,
  ctaButtons,
  accentIcon,
}: HeroSectionProps) {
  const getButtonClasses = (variant: "primary" | "secondary" | "outline") => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600";
      case "secondary":
        return "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700";
      case "outline":
        return "bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 dark:border-gray-300 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900";
      default:
        return "";
    }
  };

  return (
    <section
      className={`relative w-full min-h-screen sm:min-h-[600px] md:min-h-[600px] lg:min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-r ${gradientFrom} ${gradientTo} dark:opacity-90`}
    >
      {/* Accent Icon Background */}
      {accentIcon && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            {accentIcon}
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
          {description}
        </p>

        {/* CTA Buttons */}
        {ctaButtons && ctaButtons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center flex-wrap">
            {ctaButtons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className={`px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all inline-block ${getButtonClasses(button.variant)}`}
              >
                {button.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
