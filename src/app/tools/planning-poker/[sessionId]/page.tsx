import PlanningPokerRoom from "@/components/PlanningPokerRoom";

export default async function PlanningPokerSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PlanningPokerRoom sessionId={sessionId} />
    </div>
  );
}
