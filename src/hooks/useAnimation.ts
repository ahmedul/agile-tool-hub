import { useEffect, useState } from "react";

/**
 * Hook that respects user's prefers-reduced-motion preference.
 * Returns true if animations should be enabled, false if disabled.
 */
export function useAnimation(): boolean {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimationsEnabled(!prefersReduced);

    // Listen for changes to motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setAnimationsEnabled(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return animationsEnabled;
}
