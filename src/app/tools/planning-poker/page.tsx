import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import CreatePlanningSession from "@/components/CreatePlanningSession";

export const metadata: Metadata = {
  title: "Free Planning Poker Tool",
  description:
    "Free online planning poker for Agile and Scrum teams. No account needed. Create a session, share the link, and estimate user stories together with Fibonacci cards.",
  keywords: [
    "planning poker",
    "free planning poker tool",
    "scrum poker",
    "story point estimation",
    "agile estimation tool",
    "fibonacci planning poker",
    "online planning poker",
  ],
};

const faqItems = [
  {
    question: "Is this planning poker tool free?",
    answer: "Yes, completely free. No account, login, or credit card required.",
  },
  {
    question: "How many people can join a session?",
    answer:
      "There is no hard limit. Planning poker works best with 3–10 participants, but more can join.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Just create a session, share the link with your team, and start estimating immediately.",
  },
  {
    question: "What point scale does this tool use?",
    answer: "Fibonacci numbers: 1, 2, 3, 5, 8, 13, 21, and ? for uncertain or unclear estimates.",
  },
  {
    question: "Are sessions saved?",
    answer:
      "Sessions are ephemeral — they exist only while participants are active. Copy your story log before closing the tab.",
  },
  {
    question: "Why is planning poker useful?",
    answer:
      "Planning poker eliminates anchoring bias. Because everyone votes simultaneously, team members form independent estimates before seeing what others chose, which surfaces disagreements and drives better conversations.",
  },
];

export default function PlanningPokerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs
          items={[{ label: "Tools", href: "/tools" }, { label: "Planning Poker" }]}
        />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
          Free Tool
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Free Planning Poker Tool
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Real-time story point estimation for distributed Agile teams. Create a session, share the
          link, and vote simultaneously — no login required.
        </p>

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 text-center">
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create a free session and share the link with your team. Everyone votes at once — no
            anchoring, no groupthink.
          </p>
          <CreatePlanningSession />
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Create a session",
                desc: "Click the button above. You get a unique session URL instantly — no account needed.",
              },
              {
                step: "2",
                title: "Invite your team",
                desc: "Share the link with everyone on the call. They join with their name and are ready to vote in seconds.",
              },
              {
                step: "3",
                title: "Estimate together",
                desc: "Name a user story, everyone picks a card, reveal simultaneously. Set the final estimate and move to the next story.",
              },
            ].map((item) => (
              <div key={item.step} className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why planning poker */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why use planning poker?</h2>
          <div className="prose prose-gray max-w-none">
            <p>
              The biggest estimation problem in sprint planning is <strong>anchoring bias</strong>.
              When someone senior says "this is an 8" before others have thought it through, the
              rest of the team anchors around that number rather than forming independent estimates.
            </p>
            <p>
              Planning poker prevents this. By hiding all cards until everyone has voted, it forces
              independent thinking. When the cards flip simultaneously, disagreements surface
              naturally. A gap between a 2 and a 13 means two people have very different mental
              models of the work — exactly when you want a conversation before committing.
            </p>
          </div>
        </div>

        <FAQ items={faqItems} />

        {/* Related links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Related resources
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { title: "Story Points Explained", href: "/docs/story-points-explained" },
              { title: "User Story Template", href: "/templates/user-story-template" },
              { title: "User Story Generator", href: "/tools/user-story-generator" },
              { title: "Scrum Ceremonies Explained", href: "/docs/scrum-ceremonies-explained" },
              { title: "Acceptance Criteria Generator", href: "/tools/acceptance-criteria-generator" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
