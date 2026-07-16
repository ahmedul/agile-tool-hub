import { ReactNode } from "react";

interface ToolStepCardProps {
  accentClassName: string;
  stepLabel: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export default function ToolStepCard({
  accentClassName,
  stepLabel,
  title,
  description,
  children,
}: ToolStepCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accentClassName}`}>{stepLabel}</p>
      {title && <p className="text-sm font-semibold text-slate-800 mb-3">{title}</p>}
      {description && <p className="text-sm text-slate-700 mb-3">{description}</p>}
      {children}
    </section>
  );
}
