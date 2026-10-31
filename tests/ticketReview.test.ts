import { TICKET_EXAMPLES, reviewTicket, ticketReviewMarkdown, type ReviewKind } from "@/lib/ticket-review";

const flagged = (text: string, kind: ReviewKind) => reviewTicket(text, kind).checks.filter(check => !check.detected).map(check => check.id);

it.each(["bug", "story", "criteria"] as const)("distinguishes weak and detailed %s examples without an approval grade", kind => {
  const detailed = reviewTicket(TICKET_EXAMPLES[kind].detailed, kind);
  expect(detailed.detected).toBe(detailed.checks.length);
  expect(flagged(TICKET_EXAMPLES[kind].weak, kind).length).toBeGreaterThan(0);
  expect(ticketReviewMarkdown(detailed)).toContain("not approval of correctness");
});

it("accepts one meaningful reproduction step without a made-up minimum count", () => {
  const review = reviewTicket("Summary: Cart shows an error\nSteps: Press Pay with an empty cart. Expected: a validation message. Actual: status 500. Environment: staging build 42.", "bug");
  expect(review.summary).toBe("Cart shows an error");
  expect(review.detected).toBe(review.checks.length);
});

it("handles Markdown and Jira headings and does not treat empty headings as evidence", () => {
  expect(flagged("## Summary\n\n## Steps to reproduce\n\n## Expected result\n\n## Actual result\n\n## Environment", "bug")).toEqual(expect.arrayContaining(["summary", "steps", "expected", "actual", "environment"]));
  const jira = "h2. Summary\nCart rejects valid quantity\nh2. Steps to reproduce\nSubmit quantity 1\nh2. Expected result\nStatus 201\nh2. Actual result\nStatus 400\nh2. Environment\nStaging build 42";
  expect(flagged(jira, "bug")).toEqual([]);
});

it("does not count placeholders as content on repeated checks", () => {
  const text = "Summary: [Insert title]\nSteps: [List steps]\nExpected: TBD\nActual: TODO\nEnvironment: [Your environment]";
  for (let count = 0; count < 3; count++) expect(flagged(text, "bug")).toEqual(expect.arrayContaining(["summary", "steps", "expected", "actual", "environment", "placeholders"]));
  expect(flagged("As a [role], I want to [goal], so that [benefit].\nAcceptance criteria: [Add criteria]", "story")).toEqual(expect.arrayContaining(["actor", "outcome", "benefit", "criteria", "placeholders"]));
});

it("flags common generator boilerplate and vague wording", () => {
  expect(flagged("Summary: Bug report\nSteps: Open the affected page.\nExpected: Feature behaves as designed without errors.\nActual: Unexpected behavior occurs.\nEnvironment: Not specified", "bug")).toEqual(expect.arrayContaining(["summary", "steps", "expected", "actual", "environment"]));
  expect(flagged("Acceptance criteria:\n- User can complete checkout as expected.", "criteria")).toContain("language");
  expect(flagged("## Clarifications Needed\n- [None detected. Add open questions here.]", "story")).toEqual(expect.arrayContaining(["questions", "placeholders"]));
});

it("does not require Given/When/Then when a checklist is supplied", () => {
  const result = reviewTicket("Acceptance criteria:\n- An authenticated user submitting a valid order receives status 201.\n- An invalid quantity returns status 400 and creates no order.", "criteria");
  expect(result.detected).toBe(result.checks.length);
});

it("keeps evidence literal in exported Markdown even when it contains code fences", () => {
  const result = reviewTicket("Summary: Literal ``` and <script>alert(1)</script>", "bug");
  expect(ticketReviewMarkdown(result)).toContain("````text\nLiteral ``` and <script>alert(1)</script>\n````");
  expect(ticketReviewMarkdown(result)).not.toContain("# Literal");
});
