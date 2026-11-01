import fs from "node:fs";
import path from "node:path";
import { getContentBySlug } from "@/lib/content";
import { detectCsvMapping, parseCsv, validateJiraCsv } from "@/lib/jira-csv";
import { getSearchEntries, searchResources } from "@/lib/search";
import { extractTemplateSections } from "@/lib/template-copy";

const names = ["jira-bug-report-import.csv", "jira-user-story-import.csv", "jira-epic-story-subtask-import.csv"];
const item = getContentBySlug("templates", "jira-csv-import-template")!;

it("ships valid, complete downloads whose values match the copyable examples", () => {
  const sections = extractTemplateSections(item.content);
  expect(sections).toHaveLength(3);
  for (const [index, name] of names.entries()) {
    const bytes = fs.readFileSync(path.join(process.cwd(), "public/downloads", name));
    const csv = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const file = parseCsv(csv), copied = parseCsv(sections[index].markdown);
    expect(file.ok).toBe(true);
    expect(copied.ok).toBe(true);
    if (!file.ok || !copied.ok) throw new Error(`Invalid CSV fixture: ${name}`);
    expect(sections[index].format).toBe("csv");
    expect(copied.table.headers).toEqual(file.table.headers);
    expect(copied.table.rows.map(row => row.cells)).toEqual(file.table.rows.map(row => row.cells));
    expect(validateJiraCsv(file.table, detectCsvMapping(file.table.headers))).toEqual([]);
    expect(file.table.headers).not.toContain("Issue Key");
    expect(item.content).toContain(`/downloads/${name}`);
  }
});

it("keeps the fictional hierarchy linked and preserves quote and Unicode examples", () => {
  const result = parseCsv(fs.readFileSync(path.join(process.cwd(), "public/downloads", names[2]), "utf8"));
  if (!result.ok) throw new Error(result.message);
  expect(result.table.rows.map(row => [row.cells[0], row.cells[3], row.cells[4]])).toEqual([["Epic", "1", ""], ["Story", "2", "1"], ["Sub-task", "3", "2"]]);
  expect(result.table.rows[1].cells[2]).toContain('"Clear filters"');
  expect(result.table.rows[2].cells[2]).toContain("Café");
});

it("makes the new resource searchable and keeps its FAQ answers visible", () => {
  expect(searchResources(getSearchEntries(), "jira csv import template").some(entry => entry.href === "/templates/jira-csv-import-template")).toBe(true);
  for (const faq of item.faqItems ?? []) {
    expect(item.content).toContain(faq.question);
    expect(item.content).toContain(faq.answer);
  }
});
