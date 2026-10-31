import { consumeToolHandoff, saveToolHandoff, type ToolHandoff } from "@/lib/tool-handoff";

function store() {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}

it("transfers private text once and separates the two destinations", () => {
  const storage = store();
  const review: ToolHandoff = { kind: "review", reviewKind: "bug", text: "Private\n<content>" };
  expect(saveToolHandoff(review, storage, 1000)).toBe(true);
  expect(consumeToolHandoff("csv", storage, 1001)).toEqual({});
  expect(consumeToolHandoff("review", storage, 1002)).toEqual({ payload: review });
  expect(consumeToolHandoff("review", storage, 1003)).toEqual({});
  expect(storage.data.size).toBe(0);
  const csv: ToolHandoff = { kind: "csv", summary: "", description: "Original ticket", workType: "Story" };
  expect(saveToolHandoff(csv, storage, 1000)).toBe(true);
  expect(consumeToolHandoff("csv", storage, 1001).payload).toEqual(csv);
});

it("rejects expired, malformed, mismatched, and oversized transfers", () => {
  const storage = store();
  saveToolHandoff({ kind: "review", reviewKind: "bug", text: "text" }, storage, 1000);
  expect(consumeToolHandoff("review", storage, 601001).error).toContain("expired");
  for (const raw of ["{bad", "null", '{"createdAt":1000,"payload":{"kind":"review","text":"text","reviewKind":"invalid"}}', '{"createdAt":1000,"payload":{"kind":"csv","description":"text","summary":"x","workType":"Task"}}']) {
    storage.setItem("ath-transfer-review", raw);
    expect(consumeToolHandoff("review", storage, 1001).error).toBeTruthy();
    expect(storage.getItem("ath-transfer-review")).toBeNull();
  }
  expect(saveToolHandoff({ kind: "review", reviewKind: "bug", text: "x".repeat(50001) }, storage)).toBe(false);
});

it("keeps blocked browser storage from throwing", () => {
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("quota"); }, removeItem: () => { throw new Error("blocked"); } };
  expect(saveToolHandoff({ kind: "review", reviewKind: "story", text: "text" }, blocked)).toBe(false);
  expect(consumeToolHandoff("review", blocked).error).toContain("paste");
});
