interface AppIconProps {
  accent: string;
  icon: string;
  size?: "small" | "large";
}

export default function AppIcon({ accent, icon, size = "small" }: AppIconProps) {
  const sizeClasses = size === "large" ? "h-24 w-24 text-4xl rounded-3xl" : "h-12 w-12 text-xl rounded-xl";

  return (
    <div
      className={`flex shrink-0 items-center justify-center border-4 border-white font-semibold text-white shadow-md ${sizeClasses}`}
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      {icon}
    </div>
  );
}
