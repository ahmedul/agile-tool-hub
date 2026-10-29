"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function CreateUserStoryMappingSession() {
  const router = useRouter();

  function createSession() {
    trackEvent("session_created", { tool: "user_story_mapping" });
    router.push(`/tools/user-story-mapping/${crypto.randomUUID()}`);
  }

  return (
    <button onClick={createSession} className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700">
      Start a User Story Mapping workshop →
    </button>
  );
}
