"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function CreateRetroSession() {
  const router = useRouter();

  function createSession() {
    const id = crypto.randomUUID();
    trackEvent("session_created", { tool: "retro_board" });
    router.push(`/tools/retro-board/${id}`);
  }

  return (
    <button
      onClick={createSession}
      className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-md"
    >
      Start Free Retro →
    </button>
  );
}
