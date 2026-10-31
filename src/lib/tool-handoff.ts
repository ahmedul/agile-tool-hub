import type { ReviewKind } from "@/lib/ticket-review";

export type ToolHandoff = { kind: "review"; text: string; reviewKind: ReviewKind } | { kind: "csv"; summary: string; description: string; workType: string };
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const key = (kind: ToolHandoff["kind"]) => `ath-transfer-${kind}`;
const validText = (value: unknown): value is string => typeof value === "string" && value.length <= 50_000;
const valid = (value: unknown): value is ToolHandoff => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return item.kind === "review" ? validText(item.text) && !!item.text.trim() && ["bug", "story", "criteria"].includes(String(item.reviewKind))
    : item.kind === "csv" && validText(item.summary) && validText(item.description) && typeof item.workType === "string" && item.workType.length <= 60;
};

export function saveToolHandoff(payload: ToolHandoff, storage?: Store, now = Date.now()): boolean {
  try {
    if (!valid(payload)) return false;
    (storage ?? window.sessionStorage).setItem(key(payload.kind), JSON.stringify({ payload, createdAt: now }));
    return true;
  } catch { return false; }
}

export function consumeToolHandoff(kind: ToolHandoff["kind"], storage?: Store, now = Date.now()): { payload?: ToolHandoff; error?: string } {
  try {
    const store = storage ?? window.sessionStorage;
    const raw = store.getItem(key(kind));
    if (raw === null) return {};
    store.removeItem(key(kind));
    const envelope = JSON.parse(raw) as { payload?: unknown; createdAt?: unknown };
    if (!envelope || typeof envelope.createdAt !== "number" || now - envelope.createdAt > 10 * 60_000 || envelope.createdAt > now + 60_000 || !valid(envelope.payload) || envelope.payload.kind !== kind) {
      return { error: "The temporary transfer is invalid or expired. Copy the text from the original tool and paste it here." };
    }
    return { payload: envelope.payload };
  } catch { return { error: "Could not read the temporary transfer. You can still paste the text directly." }; }
}
