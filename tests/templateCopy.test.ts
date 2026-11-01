import { extractTemplateSections } from "@/lib/template-copy";

it("offers each complete template while ignoring headings inside its copied content", () => {
  const sections = extractTemplateSections("## Bug Report\n```markdown\n## Title\nBug title\n```\n## User Story\n```\nAs a shopper\n```\n");
  expect(sections).toEqual([
    { title: "Bug Report", markdown: "## Title\nBug title" },
    { title: "User Story", markdown: "As a shopper" },
  ]);
});

it("does not offer incomplete or empty code blocks", () => {
  expect(extractTemplateSections("## Empty\n```\n```\n## Incomplete\n```\nunclosed")).toEqual([]);
});

it("identifies CSV blocks and preserves cell whitespace without changing Markdown sections", () => {
  const content = "## Import\n~~~CSV\nSummary,Description\nA, padded value  \n~~~\n## Ticket\n```markdown\n  ## Title\nFix checkout  \n```";
  expect(extractTemplateSections(content)).toEqual([
    { title: "Import", markdown: "Summary,Description\nA, padded value  ", format: "csv" },
    { title: "Ticket", markdown: "## Title\nFix checkout" },
  ]);
});
