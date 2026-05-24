export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;

  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;

  gtag("event", name, params);
}
