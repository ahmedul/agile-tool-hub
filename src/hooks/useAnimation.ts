// src/hooks/useAnimation.ts

import { useEffect, useState } from "react";

/**
 * Hook that respects user's prefers-reduced-motion preference.
 * Returns true if animations should be enabled, false if disabled.
 * SSR-safe with proper hydration handling.
 */
export function useAnimation(): boolean {
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    // SSR safety: window doesn't exist on server
    if (typeof window === "undefined") return true;
    // Client: check actual media query immediately
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Check initial state to sync with actual media query (corrects hydration mismatch)
    setAnimationsEnabled(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setAnimationsEnabled(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return animationsEnabled;
}
