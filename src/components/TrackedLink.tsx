"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedLinkProps extends LinkProps {
  children: ReactNode;
  label: string;
  className?: string;
  eventName?: string;
  eventParams?: Record<string, string | number | boolean>;
}

export default function TrackedLink({
  children,
  label,
  className,
  eventName = "content_cta_click",
  eventParams,
  ...linkProps
}: TrackedLinkProps) {
  return (
    <Link
      {...linkProps}
      className={className}
      onClick={() =>
        trackEvent(eventName, {
          label,
          href: typeof linkProps.href === "string" ? linkProps.href : "internal",
          ...eventParams,
        })
      }
    >
      {children}
    </Link>
  );
}
