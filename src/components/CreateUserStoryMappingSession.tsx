"use client";

import { useRouter } from "next/navigation";

export default function CreateUserStoryMappingSession() {
  const router = useRouter();
  return <button onClick={() => router.push(`/tools/user-story-mapping/${crypto.randomUUID()}`)} className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700">Start a User Story Mapping workshop →</button>;
}
