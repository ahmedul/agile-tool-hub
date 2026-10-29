import { applyStormEvent, EMPTY_STORM_STATE, mergeStormStates, normalizeStormState, type StormCard } from "@/lib/eventStorming";

const first: StormCard = { id: "first", type: "event", text: "Order placed", lane: 1, author: "Test", createdAt: 1 };
const second: StormCard = { ...first, id: "second", text: "Payment accepted", lane: 2 };
const original = { ...EMPTY_STORM_STATE, cards: [first, second], links: [{ id: "connection", from: first.id, to: second.id }] };

describe("EventStorming persistence", () => {
  it("keeps deleted cards and their connections deleted after stale snapshots reconnect", () => {
    const deleted = applyStormEvent(original, { type: "delete", id: first.id });
    for (const state of [mergeStormStates(original, deleted), mergeStormStates(deleted, original)]) {
      expect(state.cards.map(card => card.id)).toEqual([second.id]);
      expect(state.links).toEqual([]);
      expect(state.deletedCardIds).toContain(first.id);
      expect(state.deletedLinkIds).toContain("connection");
    }
  });

  it("keeps an unlinked relationship deleted while retaining both cards", () => {
    const unlinked = applyStormEvent(original, { type: "unlink", id: "connection" });
    expect(mergeStormStates(unlinked, original)).toMatchObject({ cards: [first, second], links: [], deletedLinkIds: ["connection"] });
  });

  it("preserves independent cards added by another participant", () => {
    const added = { ...second, id: "third", text: "Confirmation sent" };
    const deleted = applyStormEvent(original, { type: "delete", id: first.id });
    const other = applyStormEvent(original, { type: "add", card: added });
    expect(mergeStormStates(deleted, other).cards.map(card => card.id)).toEqual([second.id, added.id]);
  });

  it("applies relationships from live events and rejects dangling connections", () => {
    const unlinked = { ...original, links: [] };
    expect(applyStormEvent(unlinked, { type: "link", link: original.links[0] }).links).toEqual(original.links);
    expect(applyStormEvent(unlinked, { type: "link", link: { id: "invalid", from: first.id, to: "missing" } }).links).toEqual([]);
  });

  it("loads older snapshots without deletion markers and ignores malformed cards", () => {
    expect(normalizeStormState({ title: "Old board", cards: [first, null, { id: "bad" }], links: [] })).toMatchObject({ cards: [first], deletedCardIds: [], deletedLinkIds: [] });
  });
});
