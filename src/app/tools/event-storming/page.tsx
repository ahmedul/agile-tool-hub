import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CreateEventStormingSession from "@/components/CreateEventStormingSession";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free EventStorming Board | Map Business Processes Online",
  description: "Run a friendly, real-time EventStorming workshop with distributed teams. Map domain events, commands, actors, policies, and hotspots, then export a formatted PDF.",
  keywords: ["event storming tool", "eventstorming board", "domain event mapping", "DDD workshop", "business process mapping"],
  canonical: "https://agiletoolhub.com/tools/event-storming",
});

const cards = [
  ["🟠", "Start with events", "Capture what happened in the domain using past-tense events."],
  ["🔵", "Build the story", "Add commands, actors, policies, systems, and read models around the timeline."],
  ["🔴", "Make uncertainty visible", "Record questions, risks, and disagreements as hotspots instead of losing them."],
];

export default function EventStormingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "EventStorming" }]} />
      <span className="text-xs font-semibold uppercase tracking-wide text-orange-600">Free tool · Live collaboration</span>
      <h1 className="mt-2 text-4xl font-bold text-slate-950">EventStorming for distributed teams</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">Map a business process together, keep the workshop moving, and leave with a clear PDF your team can use after the meeting.</p>
      <div className="my-10 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center shadow-sm"><p className="mx-auto mb-6 max-w-xl text-slate-700">No account required. Share one session link with engineers, product people, and domain experts anywhere in the world.</p><CreateEventStormingSession /></div>
      <div className="grid gap-5 md:grid-cols-3">{cards.map(([icon, title, description]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-3xl">{icon}</div><h2 className="mt-4 font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>)}</div>
      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-bold text-slate-900">Designed for a smooth workshop</h2><ul className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2"><li>✓ Visible color legend with plain-language explanations</li><li>✓ Four guided phases: Discover, Sequence, Model, Review</li><li>✓ Drag cards left and right across the process timeline</li><li>✓ Realtime participants and connection status</li><li>✓ Automatic browser recovery after refresh</li><li>✓ Landscape PDF export for sharing afterwards</li></ul></div>
    </div>
  );
}
