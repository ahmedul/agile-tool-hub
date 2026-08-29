import EventStormingBoard from "@/components/EventStormingBoard";

export default async function EventStormingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <EventStormingBoard sessionId={sessionId} />;
}
