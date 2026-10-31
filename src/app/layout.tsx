import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AgileToolHub — Free Agile, Scrum & Software Delivery Templates",
    template: "%s | AgileToolHub",
  },
  description:
    "Free Jira, Scrum, and Agile templates for software teams. Bug report templates, user story templates, retrospective templates, and simple tools for engineering teams.",
  metadataBase: new URL("https://agiletoolhub.com"),
  openGraph: {
    siteName: "AgileToolHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-700 focus:px-4 focus:py-3 focus:font-semibold focus:text-white">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
