"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function CreatePlanningSession() {
  const router = useRouter();

  function createSession() {
    const id = crypto.randomUUID();
    trackEvent("session_created", { tool: "planning_poker" });
    router.push(`/tools/planning-poker/${id}`);
  }

  return (
    <button
      onClick={createSession}
      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      Start Free Session →
    </button>
  );
}
