import { useAnimation } from "@/hooks/useAnimation";

interface ToolSuccessBannerProps {
  title: string;
  subtitle: string;
}

export default function ToolSuccessBanner({ title, subtitle }: ToolSuccessBannerProps) {
  const animationsEnabled = useAnimation();

  return (
    <div className="mb-3 flex items-start gap-3">
      <span
        aria-hidden
        className={`mt-1 inline-flex h-4 w-4 rounded-full bg-emerald-500 ${
          animationsEnabled ? "tool-success-ping" : ""
        }`}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{title}</p>
        <p className="text-sm font-semibold text-emerald-900">{subtitle}</p>
      </div>
    </div>
  );
}
