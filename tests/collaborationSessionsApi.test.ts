import { applyStormEvent, EMPTY_STORM_STATE, type StormCard } from "@/lib/eventStorming";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from }) }));
import { PUT } from "@/app/api/collaboration-sessions/[sessionId]/route";

const sessionId = "11111111-1111-4111-8111-111111111111";
const card: StormCard = { id: "first", type: "event", text: "Order placed", lane: 1, author: "Test", createdAt: 1 };
const original = { ...EMPTY_STORM_STATE, cards: [card] };
const removed = applyStormEvent(original, { type: "delete", id: card.id });
const context = { params: Promise.resolve({ sessionId }) };

function query(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  };
}
function request() {
  return new Request(`https://agiletoolhub.com/api/collaboration-sessions/${sessionId}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolType: "event_storming", title: "Test workshop", state: removed }),
  });
}

beforeEach(() => {
  from.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
});
afterEach(() => vi.unstubAllEnvs());

it("persists deletions and increments the stored version instead of trusting the caller", async () => {
  const update = query({ session_id: sessionId, version: 4 });
  from.mockReturnValueOnce(query({ state: original, version: 3, tool_type: "event_storming" })).mockReturnValueOnce(update);
  const response = await PUT(request(), context);
  expect(response.status).toBe(200);
  expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ version: 4, state: expect.objectContaining({ cards: [], deletedCardIds: [card.id] }) }));
  expect(update.eq).toHaveBeenCalledWith("version", 3);
});

it("retries concurrent writes against the latest state without losing another participant's card", async () => {
  const extra = { ...card, id: "other", text: "Payment accepted" };
  const update = query({ session_id: sessionId, version: 5 });
  from.mockReturnValueOnce(query({ state: original, version: 3, tool_type: "event_storming" }))
    .mockReturnValueOnce(query(null))
    .mockReturnValueOnce(query({ state: { ...original, cards: [card, extra] }, version: 4, tool_type: "event_storming" }))
    .mockReturnValueOnce(update);
  const response = await PUT(request(), context);
  expect(response.status).toBe(200);
  expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ version: 5, state: expect.objectContaining({ cards: [extra], deletedCardIds: [card.id] }) }));
});

it("does not overwrite a session belonging to a different tool", async () => {
  from.mockReturnValueOnce(query({ state: {}, version: 1, tool_type: "user_story_mapping" }));
  expect((await PUT(request(), context)).status).toBe(409);
  expect(from).toHaveBeenCalledTimes(1);
});
