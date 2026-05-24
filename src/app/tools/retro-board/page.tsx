import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import CreateRetroSession from "@/components/CreateRetroSession";

export const metadata: Metadata = {
  title: "Free Retrospective Board | Sprint Retro Tool | AgileToolHub",
  description:
    "Free real-time retrospective board for Agile and Scrum teams. No login required. Create a session, share the link, and run Went Well / To Improve / Action Items retros together.",
  keywords: [
    "retrospective board",
    "sprint retrospective tool",
    "free retro board",
    "agile retrospective",
    "scrum retrospective",
    "online retrospective",
    "went well to improve",
    "retro tool free",
  ],
};

const faqItems = [
  {
    question: "Is this retrospective tool free?",
    answer: "Yes, completely free. No account, login, or credit card required.",
  },
  {
    question: "What format does this retro board use?",
    answer:
      "The standard three-column format: Went Well (things to celebrate), To Improve (things that didn't work), and Action Items (specific next steps). This is the most common Sprint Retrospective format used by Scrum teams.",
  },
  {
    question: "How many people can join a session?",
    answer:
      "There is no hard limit. Retrospectives typically work best with 3–10 people, though more can participate.",
  },
  {
    question: "How do we prioritise notes?",
    answer:
      "Each participant can upvote notes using the thumbs-up button. Notes are sorted by vote count within each column, making it easy to identify the most important themes without a separate dot-voting round.",
  },
  {
    question: "Are sessions saved?",
    answer:
      "Sessions are ephemeral — they exist while participants are active. Before closing, screenshot your Action Items column or copy them into your issue tracker.",
  },
  {
    question: "Can I delete a note?",
    answer:
      "You can delete any note you created. Hover over a note and click the ✕ button that appears.",
  },
];

export default function RetroBoardPage() {
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
        <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Retrospective Board" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
          Free Tool · Live
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Free Online Retrospective Board
        </h1>
        <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-200">
          Real-time sprint retrospectives for distributed Agile teams. Create a session, share the
          link, and run a Went Well / To Improve / Action Items retro together — no login required.
        </p>

        {/* CTA */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12 text-center">
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create a free session and share the link with your team. Everyone adds notes and votes
            simultaneously in real time.
          </p>
          <CreateRetroSession />
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
                desc: "Share the link with everyone. They join with their name and can immediately start adding notes.",
              },
              {
                step: "3",
                title: "Run your retro",
                desc: "Everyone adds notes to all three columns simultaneously, votes on what matters most, and agrees on Action Items.",
              },
            ].map((item) => (
              <div key={item.step} className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Three columns explainer */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">The three-column retro format</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                emoji: "🟢",
                title: "Went Well",
                color: "bg-green-50 border-green-200",
                desc: "Celebrate wins, good practices, and things the team should keep doing. Starting with positives sets a constructive tone.",
              },
              {
                emoji: "🔴",
                title: "To Improve",
                color: "bg-red-50 border-red-200",
                desc: "Identify pain points, bottlenecks, and things that slowed the team down. Keep it specific and blameless.",
              },
              {
                emoji: "🔵",
                title: "Action Items",
                color: "bg-blue-50 border-blue-200",
                desc: "Concrete next steps with an owner and deadline. Every retro should end with at least one action item, or nothing changes.",
              },
            ].map((col) => (
              <div key={col.title} className={`p-5 rounded-xl border-2 ${col.color}`}>
                <div className="text-2xl mb-2">{col.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{col.title}</h3>
                <p className="text-sm text-gray-600">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <FAQ items={faqItems} />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Related resources
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { title: "Planning Poker", href: "/tools/planning-poker" },
              { title: "Sprint Capacity Calculator", href: "/tools/sprint-capacity-calculator" },
              { title: "Sprint Planning Template", href: "/templates/sprint-planning-template" },
              { title: "Daily Standup Template", href: "/templates/daily-standup-template" },
              { title: "Scrum Ceremonies Explained", href: "/docs/scrum-ceremonies-explained" },
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
