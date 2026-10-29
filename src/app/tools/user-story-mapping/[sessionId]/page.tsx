import type { Metadata } from "next";
import UserStoryMappingBoard from "@/components/UserStoryMappingBoard";

export const metadata: Metadata = {
  title: "User Story Mapping Session",
  robots: { index: false, follow: false },
};

export default async function UserStoryMappingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <UserStoryMappingBoard sessionId={sessionId} />;
}
