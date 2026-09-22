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
  iconUrl: string;
  platform: "Android";
  status: "Available" | "Coming soon";
  playStoreUrl?: string;
  features: string[];
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
  seoTitle: string;
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
    iconUrl: "https://play-lh.googleusercontent.com/OO2gVEGsRm3Pe-4hyrkh8jjgjycrB8f7t4YtowvBDQuq6I8O2LqSXoqpgrnwb5N9sTQcEMweirB4oSKWExM1jA=w240-h480",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.deskfit.officeworkout",
    features: ["15+ five-minute routines", "Animated illustrations and voice coaching", "Offline-first with no login or ads", "Daily reminders and progress tracking"],
    useCases: ["Neck and shoulder resets between meetings", "Posture support after long coding sessions", "Quick energy breaks without equipment", "Gentle stretches at a desk or in a home office"],
    seoTitle: "5-Minute Office Workout App for Desk Workers",
    faqs: [
      { question: "What is DeskFit?", answer: "DeskFit is an Android app with short, guided five-minute workouts and stretches designed for people who spend much of the day sitting at a desk." },
      { question: "Do I need equipment to use DeskFit?", answer: "No. DeskFit routines are designed for an office environment and use only a chair or a nearby wall when needed." },
      { question: "Does DeskFit work offline?", answer: "Yes. DeskFit is designed to work without an internet connection, with no login and no ads." },
    ],
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
    iconUrl: "https://play-lh.googleusercontent.com/gFCa5BsSVRaBaABC5Y2tI34_RrA14SjHrumHPri802yprCPAnKeXWHgGBkdOthPQD4rokVTJoxNTwcddG0lye6M=w240-h480",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.expiryguard",
    features: ["Smart dashboard for valid, expiring, and expired documents", "AI-powered OCR and biometric authentication", "Local-only storage with no cloud, tracking, or ads", "Family profiles, calendar integration, and PDF export"],
    useCases: ["Passport, visa, and residence permit reminders", "Driving licence and ID card expiry dates", "Health insurance card and family document tracking", "Offline document organization for travellers and expats"],
    seoTitle: "Document Expiry Reminder App for Passports and IDs",
    faqs: [
      { question: "What documents can ExpiryGuard remind me about?", answer: "ExpiryGuard can help track passports, visas, residence permits, driving licences, health insurance cards, ID cards, and other documents with expiry dates." },
      { question: "Does ExpiryGuard store documents in the cloud?", answer: "No. The app uses local-only storage, so your document information stays on your device rather than being uploaded to a cloud account." },
      { question: "Can I manage documents for my family?", answer: "Yes. ExpiryGuard includes family profiles for organizing documents for a spouse, children, or other family members." },
    ],
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
    iconUrl: "https://play-lh.googleusercontent.com/LWDlzwLFi7Mmkule8UOLRexufOq1r9B8GGNk_D6OKJgGYL4woJKKbL4O1eDF76k-1LDFwbPcQ6_R4uThU9kvaQ=w240-h480",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.returnguard.reminder",
    features: ["14, 30, 60, or custom return windows", "Receipt photos and purchase details", "Warranty date tracking", "Private on-device storage with no account or ads"],
    useCases: ["Clothing, shoes, gifts, and online orders", "Return deadlines that are easy to forget", "Receipts that need to stay close after checkout", "Warranty records and refund opportunities"],
    seoTitle: "Return and Refund Reminder App with Receipt Tracking",
    faqs: [
      { question: "What does ReturnGuard track?", answer: "ReturnGuard tracks purchases, return deadlines, receipt photos, warranty dates, store and price details, and refund opportunities." },
      { question: "Can I set a custom return window?", answer: "Yes. You can choose a 14, 30, or 60-day return window, or enter a custom deadline for a purchase." },
      { question: "Are my receipts uploaded to the cloud?", answer: "No. ReturnGuard is designed to keep purchases and receipt photos on your device, without an account, cloud sync, or ads." },
    ],
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
    iconUrl: "https://play-lh.googleusercontent.com/ILLq1lX9vM7eTjttByI-C2p6M5wu4SJ4iNnJFIc-S4bRH_8Wj7s1WgnTw6UnxggmWaVBZQ_A70WLOhPBDmVMNQ=w240-h480",
    platform: "Android",
    status: "Available",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.trialguard",
    features: ["Reminders before free trials renew", "Monthly and yearly subscription tracking", "Custom reminder dates and upcoming billing view", "Private on-device information"],
    useCases: ["Streaming service free trials", "Productivity and cloud tool subscriptions", "Fitness memberships and recurring plans", "Reviewing monthly and yearly subscription costs"],
    seoTitle: "Free Trial and Subscription Renewal Reminder App",
    faqs: [
      { question: "What is TrialGuard?", answer: "TrialGuard is an Android app for tracking free trials and recurring subscriptions so you can get a reminder before the next billing date." },
      { question: "Can TrialGuard remind me before a free trial ends?", answer: "Yes. Add the trial start date, renewal date, price, and preferred reminder date to receive an alert before renewal." },
      { question: "Does TrialGuard track subscription costs?", answer: "Yes. TrialGuard lets you record monthly and yearly prices and view upcoming billing dates in one place." },
    ],
  },
];

export function getApp(slug: string) {
  return apps.find((app) => app.slug === slug);
}
