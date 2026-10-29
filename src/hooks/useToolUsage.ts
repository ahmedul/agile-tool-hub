"use client";

import { useCallback, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

// Count deliberate interaction once per mounted tool, excluding page loads and
// restored drafts. Never include user-written input in analytics.
export function useToolUsage(tool: string) {
  const used = useRef(false);
  return useCallback(() => {
    if (used.current) return;
    used.current = true;
    trackEvent("tool_used", { tool, mode: "local" });
  }, [tool]);
}
