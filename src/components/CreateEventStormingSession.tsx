"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function CreateEventStormingSession() {
  const router = useRouter();

  function createSession() {
    trackEvent("session_created", { tool: "event_storming" });
    router.push(`/tools/event-storming/${crypto.randomUUID()}`);
  }

  return (
    <button onClick={createSession} className="rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-orange-700">
      Start an EventStorming session →
    </button>
  );
}
