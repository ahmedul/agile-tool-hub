export type AppCategory = "Productivity" | "Finance" | "Health";

export interface AppListing {
  slug: string;
  name: string;
  packageName: string;
  shortDescription: string;
  description: string;
  category: AppCategory;
  accent: string;
  icon: string;
  platform: "Android";
  status: "Available" | "Coming soon";
  playStoreUrl?: string;
  features: string[];
}

export const apps: AppListing[] = [
  {
    slug: "deskfit-5-minute-office-workout",
    name: "DeskFit: 5-Min Office Workout",
    packageName: "com.deskfit.officeworkout",
    shortDescription: "Quick movement breaks for busy desk days.",
    description:
      "DeskFit makes it easy to add short, practical movement breaks to your workday. Follow a focused five-minute routine without leaving your desk or changing into workout clothes.",
    category: "Health",
    accent: "#6f9f83",
    icon: "↗",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.deskfit.officeworkout",
    features: ["Five-minute guided routines", "Designed for office spaces", "Simple reminders to move"],
  },
  {
    slug: "expiryguard-document-reminder",
    name: "ExpiryGuard: Document Reminder",
    packageName: "com.expiryguard",
    shortDescription: "Never miss an important document renewal.",
    description:
      "ExpiryGuard keeps expiry dates for passports, permits, insurance, subscriptions, and other important documents in one calm, simple place.",
    category: "Productivity",
    accent: "#1677ff",
    icon: "▤",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.expiryguard",
    features: ["Track multiple expiry dates", "Helpful renewal reminders", "Private, focused document list"],
  },
  {
    slug: "returnguard-refund-reminder",
    name: "ReturnGuard: Refund Reminder",
    packageName: "com.returnguard.reminder",
    shortDescription: "Keep returns and refunds from slipping through.",
    description:
      "ReturnGuard gives online shoppers a lightweight way to remember return windows, expected refunds, and the follow-up actions that save money.",
    category: "Finance",
    accent: "#69c72d",
    icon: "↶",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.returnguard.reminder",
    features: ["Return-window reminders", "Refund follow-up dates", "A quick view of open returns"],
  },
  {
    slug: "trialguard-free-trial-reminder",
    name: "TrialGuard Free Trial Reminder",
    packageName: "com.trialguard",
    shortDescription: "Remember to cancel trials before they charge.",
    description:
      "TrialGuard helps you keep control of free trials and promotional subscriptions with clear reminders before the first paid charge.",
    category: "Finance",
    accent: "#4820a8",
    icon: "T",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.trialguard",
    features: ["Trial end-date reminders", "Subscription cost visibility", "Simple cancellation prompts"],
  },
];

export function getApp(slug: string) {
  return apps.find((app) => app.slug === slug);
}
