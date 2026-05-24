import RetroBoard from "@/components/RetroBoard";

export default async function RetroBoardSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <RetroBoard sessionId={sessionId} />
    </div>
  );
}
