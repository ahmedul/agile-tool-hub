import { getSearchEntries, searchResources, type SearchEntry } from "@/lib/search";

const entries: SearchEntry[] = [
  { title: "Planning Poker", description: "Estimate stories with a team", type: "tools", href: "/tools/planning-poker" },
  { title: "How to Run Planning Poker", description: "Facilitation guide", type: "guides", href: "/guides/poker", content: "Discuss sprint capacity and uncertainty" },
  { title: "User Story Template", description: "Copy a useful user story", type: "templates", href: "/templates/story" },
  { title: "Definition of Done Checklist", description: "Check release quality", type: "tools", href: "/tools/done" },
  { title: "Acceptance Criteria Generator", description: "Testable conditions", type: "tools", href: "/tools/criteria" },
  { title: "EventStorming Board", description: "Map domain events", type: "tools", href: "/tools/event-storming" },
];

describe("resource search", () => {
  it("ranks a direct tool match ahead of related articles", () => {
    expect(searchResources(entries, "planning poker").map(entry => entry.href)).toEqual(["/tools/planning-poker", "/guides/poker"]);
  });

  it("matches words across article text and metadata without returning partial matches", () => {
    expect(searchResources(entries, "poker uncertainty").map(entry => entry.href)).toEqual(["/guides/poker"]);
    expect(searchResources(entries, "poker refund")).toEqual([]);
  });

  it("recognizes common abbreviations and word variants", () => {
    expect(searchResources(entries, "DoD")[0].href).toBe("/tools/done");
    expect(searchResources(entries, "AC")[0].href).toBe("/tools/criteria");
    expect(searchResources(entries, "user stories")[0].href).toBe("/templates/story");
    expect(searchResources(entries, "event storming")[0].href).toBe("/tools/event-storming");
  });

  it("handles case, accents, empty queries, and punctuation", () => {
    expect(searchResources(entries, "  PLÁNNING POKER  ")[0].href).toBe("/tools/planning-poker");
    for (const query of ["", "   ", "???", "how to", "東京"]) expect(searchResources(entries, query)).toEqual([]);
  });

  it("indexes published resources without duplicate destinations or workshop session URLs", () => {
    const index = getSearchEntries();
    expect(index.length).toBeGreaterThan(100);
    expect(new Set(index.map(entry => entry.href)).size).toBe(index.length);
    expect(index.some(entry => entry.href.includes("[sessionId]"))).toBe(false);
    expect(searchResources(index, "jira bug report template")[0].href).toBe("/templates/jira-bug-report-template");
    expect(searchResources(index, "sprint capacity")[0].href).toBe("/tools/sprint-capacity-calculator");
  });
});
