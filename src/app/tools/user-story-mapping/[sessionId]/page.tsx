import UserStoryMappingBoard from "@/components/UserStoryMappingBoard";

export default async function UserStoryMappingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <UserStoryMappingBoard sessionId={sessionId} />;
}
