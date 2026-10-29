export type CardType = "event" | "command" | "actor" | "policy" | "read_model" | "external_system" | "aggregate" | "hotspot";
export type Phase = "discover" | "sequence" | "model" | "review";
export type StormCard = { id: string; type: CardType; text: string; lane: number; author: string; createdAt: number };
export type StormLink = { id: string; from: string; to: string };
export type StormState = {
  title: string;
  cards: StormCard[];
  phase: Phase;
  laneCount: number;
  links: StormLink[];
  deletedCardIds: string[];
  deletedLinkIds: string[];
};
export type StormEvent =
  | { type: "state"; state: StormState }
  | { type: "add"; card: StormCard }
  | { type: "move"; id: string; lane: number }
  | { type: "edit"; id: string; text: string }
  | { type: "delete"; id: string }
  | { type: "phase"; phase: Phase }
  | { type: "link"; link: StormLink }
  | { type: "unlink"; id: string };

export const DEFAULT_LANE_COUNT = 8;
export const MAX_LANE_COUNT = 16;
export const EMPTY_STORM_STATE: StormState = {
  title: "Untitled process", cards: [], phase: "discover", laneCount: DEFAULT_LANE_COUNT,
  links: [], deletedCardIds: [], deletedLinkIds: [],
};
const CARD_TYPES = new Set(["event", "command", "actor", "policy", "read_model", "external_system", "aggregate", "hotspot"]);
const PHASES = new Set(["discover", "sequence", "model", "review"]);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function ids(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string"))] : [];
}

export function normalizeStormState(value: unknown): StormState {
  const state = record(value);
  const laneCount = typeof state.laneCount === "number" && Number.isFinite(state.laneCount)
    ? Math.max(1, Math.min(MAX_LANE_COUNT, Math.floor(state.laneCount))) : DEFAULT_LANE_COUNT;
  const deletedCardIds = ids(state.deletedCardIds);
  const deletedLinkIds = ids(state.deletedLinkIds);
  const cards = (Array.isArray(state.cards) ? state.cards : []).flatMap((value): StormCard[] => {
    const card = record(value);
    if (typeof card.id !== "string" || deletedCardIds.includes(card.id) || !CARD_TYPES.has(String(card.type)) || typeof card.text !== "string") return [];
    return [{
      id: card.id, type: card.type as CardType, text: card.text,
      lane: typeof card.lane === "number" && Number.isFinite(card.lane) ? Math.max(1, Math.min(laneCount, Math.floor(card.lane))) : 1,
      author: typeof card.author === "string" ? card.author : "",
      createdAt: typeof card.createdAt === "number" && Number.isFinite(card.createdAt) ? card.createdAt : 0,
    }];
  });
  const cardIds = new Set(cards.map(card => card.id));
  const links = (Array.isArray(state.links) ? state.links : []).flatMap((value): StormLink[] => {
    const link = record(value);
    return typeof link.id === "string" && !deletedLinkIds.includes(link.id) && typeof link.from === "string" && typeof link.to === "string" && link.from !== link.to && cardIds.has(link.from) && cardIds.has(link.to)
      ? [{ id: link.id, from: link.from, to: link.to }] : [];
  });
  return {
    title: typeof state.title === "string" ? state.title : EMPTY_STORM_STATE.title,
    phase: PHASES.has(String(state.phase)) ? state.phase as Phase : "discover",
    laneCount, cards, links, deletedCardIds, deletedLinkIds,
  };
}

// Retain deletion markers so an offline browser or late peer cannot bring
// deleted cards or relationships back when its snapshot reconnects.
export function mergeStormStates(previous: unknown, incoming: unknown): StormState {
  const before = normalizeStormState(previous);
  const after = normalizeStormState(incoming);
  return normalizeStormState({
    ...after,
    cards: [...new Map([...before.cards, ...after.cards].map(card => [card.id, card])).values()],
    links: [...new Map([...before.links, ...after.links].map(link => [link.id, link])).values()],
    deletedCardIds: [...before.deletedCardIds, ...after.deletedCardIds],
    deletedLinkIds: [...before.deletedLinkIds, ...after.deletedLinkIds],
  });
}

export function applyStormEvent(value: StormState, event: StormEvent): StormState {
  const state = normalizeStormState(value);
  if (event.type === "state") return mergeStormStates(state, event.state);
  if (event.type === "add") return normalizeStormState({ ...state, cards: [...new Map([...state.cards, event.card].map(card => [card.id, card])).values()] });
  if (event.type === "move") return normalizeStormState({ ...state, cards: state.cards.map(card => card.id === event.id ? { ...card, lane: event.lane } : card) });
  if (event.type === "edit") return { ...state, cards: state.cards.map(card => card.id === event.id ? { ...card, text: event.text } : card) };
  if (event.type === "delete") return normalizeStormState({
    ...state,
    deletedCardIds: [...state.deletedCardIds, event.id],
    deletedLinkIds: [...state.deletedLinkIds, ...state.links.filter(link => link.from === event.id || link.to === event.id).map(link => link.id)],
  });
  if (event.type === "link") return normalizeStormState({ ...state, links: [...state.links.filter(link => link.id !== event.link.id), event.link] });
  if (event.type === "unlink") return normalizeStormState({ ...state, deletedLinkIds: [...state.deletedLinkIds, event.id] });
  return { ...state, phase: event.phase };
}
