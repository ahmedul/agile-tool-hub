"use client";

import { useRouter } from "next/navigation";

export default function CreateEventStormingSession() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/tools/event-storming/${crypto.randomUUID()}`)}
      className="rounded-xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-orange-600"
    >
      Start an EventStorming session →
    </button>
  );
}
