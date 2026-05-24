"use client";

import { useRouter } from "next/navigation";

export default function CreatePlanningSession() {
  const router = useRouter();

  function createSession() {
    const id = crypto.randomUUID();
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
