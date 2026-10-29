import type { Metadata } from "next";
import EventStormingBoard from "@/components/EventStormingBoard";

export const metadata: Metadata = {
  title: "EventStorming Session",
  robots: { index: false, follow: false },
};

export default async function EventStormingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <EventStormingBoard sessionId={sessionId} />;
}
