import { extractScopeExclusions, extractStoryIntent, isIncidentContext, splitBugNotes } from "@/lib/generator-input";

it("separates a canonical story's goal and benefit", () => {
  expect(extractStoryIntent("As a shopper, I want to filter by price, so that I can stay within my budget.", "", "fallback")).toEqual({
    user: "shopper", goal: "filter by price", benefit: "I can stay within my budget",
  });
});

it("recognizes a plain shopper outcome without copying every sentence into the goal", () => {
  expect(extractStoryIntent("Shopper can filter the catalog by category and price. Show an empty state when nothing matches.", "", "fallback")).toMatchObject({
    user: "shopper", goal: "filter the catalog by category and price",
  });
  expect(extractStoryIntent("Shopper can filter by price so that I can stay within my budget.", "", "fallback")).toEqual({
    user: "shopper", goal: "filter by price", benefit: "I can stay within my budget",
  });
});

it("keeps explicit role context and unknown wording rather than inventing an actor", () => {
  expect(extractStoryIntent("Need to export results. Because I can review them offline.", "analyst", "fallback")).toEqual({
    user: "analyst", goal: "export results", benefit: "I can review them offline",
  });
  expect(extractStoryIntent("A custom request without a known pattern", "editor", "A custom request without a known pattern").goal).toBe("A custom request without a known pattern");
});

it("does not turn ordinary team or confirmation notes into an incident", () => {
  for (const notes of ["Teams can review a catalog", "The change impacts shoppers", "Show order confirmation", "Changes were made to filtering"]) {
    expect(isIncidentContext(notes)).toBe(false);
  }
  expect(isIncidentContext("Investigate an outage affecting service placement")).toBe(true);
  expect(isIncidentContext("VPRN 123 has inconsistent Desire DB placement")).toBe(true);
});

it("preserves expected and actual fields in notes pasted on one line", () => {
  expect(splitBugNotes("Checkout spinner stays visible. Steps: open checkout and press Pay. Expected: one order. Actual: two requests. Environment: staging.")).toEqual([
    "Checkout spinner stays visible.", "Steps: open checkout and press Pay.", "Expected: one order.", "Actual: two requests.", "Environment: staging.",
  ]);
});

it("preserves numbered reproduction steps and existing line breaks", () => {
  expect(splitBugNotes("Checkout fails\n1. Open checkout\n2. Press Pay\nExpected: confirmation\nActual: spinner")).toEqual([
    "Checkout fails", "1. Open checkout", "2. Press Pay", "Expected: confirmation", "Actual: spinner",
  ]);
});

it("does not label required behavior or a whole paragraph as out of scope", () => {
  expect(extractScopeExclusions("Shopper can filter by price. Results must update within 2 seconds. Support mobile and desktop. Saved filters and recommendations are out of scope.")).toEqual([
    "Saved filters and recommendations are out of scope.",
  ]);
  expect(extractScopeExclusions("The user must be able to retry without losing the cart.")).toEqual([]);
});
