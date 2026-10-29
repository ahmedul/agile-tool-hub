import type { Metadata } from "next";
import RetroBoard from "@/components/RetroBoard";

export const metadata: Metadata = {
  title: "Retrospective Session",
  robots: { index: false, follow: false },
};

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
