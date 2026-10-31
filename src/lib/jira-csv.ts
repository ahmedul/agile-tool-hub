export const MAX_CSV_CHARACTERS = 2_000_000;
export const MAX_CSV_ROWS = 2000;
export const MAX_CSV_COLUMNS = 100;

export const CSV_FIELDS = {
  summary: "Summary", description: "Description", workType: "Work type", id: "Work item ID", parent: "Parent",
} as const;
export type CsvField = keyof typeof CSV_FIELDS;
export type CsvMapping = Record<CsvField, number>;
export interface CsvRow { line: number; cells: string[] }
export interface CsvTable { headerLine: number; headers: string[]; rows: CsvRow[] }
export interface CsvFinding { severity: "error" | "warning"; code: string; message: string; line?: number }
export type CsvParseResult = { ok: true; table: CsvTable } | { ok: false; message: string; line: number };

export function parseCsv(input: string): CsvParseResult {
  if (input.length > MAX_CSV_CHARACTERS) return { ok: false, message: "This tool supports up to 2 million characters per CSV.", line: 1 };
  if (input.includes("\0")) return { ok: false, message: "The file contains null characters. Convert UTF-16 or other source files to UTF-8 CSV before validating.", line: 1 };
  const text = input.replace(/^\uFEFF/, "");
  const records: CsvRow[] = [];
  let row: string[] = [], field = "", quoted = false, closedQuote = false, touched = false;
  let line = 1, startLine = 1;
  const fail = (message: string): CsvParseResult => ({ ok: false, message, line });
  const finishField = () => { row.push(field); field = ""; closedQuote = false; };
  const finishRow = () => {
    if (touched || field || row.length) { finishField(); records.push({ line: startLine, cells: row }); }
    row = []; field = ""; touched = false; closedQuote = false;
  };
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { field += '"'; index++; }
        else { quoted = false; closedQuote = true; }
      } else {
        field += char;
        if (char === "\r") { if (text[index + 1] === "\n") { field += "\n"; index++; } line++; }
        else if (char === "\n") line++;
      }
      continue;
    }
    if (closedQuote && char !== "," && char !== "\n" && char !== "\r") return fail("Only a comma or line break may follow a closing quote. Quote the complete field.");
    if (char === '"') {
      if (field.length) return fail('Unexpected quote inside an unquoted field. Quote the whole field and escape quotes as "".');
      quoted = true; touched = true;
    } else if (char === ",") {
      finishField(); touched = true;
      if (row.length >= MAX_CSV_COLUMNS) return fail(`This tool supports up to ${MAX_CSV_COLUMNS} columns.`);
    } else if (char === "\n" || char === "\r") {
      finishRow();
      if (char === "\r" && text[index + 1] === "\n") index++;
      line++; startLine = line;
      if (records.length > MAX_CSV_ROWS + 1) return fail(`This tool supports up to ${MAX_CSV_ROWS} work items.`);
    } else { field += char; touched = true; }
  }
  if (quoted) return fail("A quoted field is not closed. Add its closing quote before validating.");
  finishRow();
  if (!records.length) return fail("Paste a comma-separated CSV with a header row.");
  if (records.length > MAX_CSV_ROWS + 1) return fail(`This tool supports up to ${MAX_CSV_ROWS} work items.`);
  return { ok: true, table: { headerLine: records[0].line, headers: records[0].cells, rows: records.slice(1) } };
}

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const ALIASES: Record<CsvField, string[]> = {
  summary: ["summary", "title", "taskname", "name"], description: ["description", "details"],
  workType: ["worktype", "issuetype", "type"], id: ["workitemid", "issueid", "id", "externalid"], parent: ["parent", "parentid"],
};
const CANONICAL: Record<CsvField, string[]> = {
  summary: ["summary"], description: ["description"], workType: ["worktype", "issuetype"],
  id: ["workitemid", "issueid"], parent: ["parent", "parentid"],
};

export function detectCsvMapping(headers: string[]): CsvMapping {
  return Object.fromEntries(Object.entries(ALIASES).map(([field, aliases]) => [field, headers.findIndex(header => aliases.includes(normalizeHeader(header)))])) as CsvMapping;
}

export function mappedCsvHeaders(headers: string[], mapping: CsvMapping): string[] {
  return headers.map((header, index) => {
    const field = (Object.keys(CSV_FIELDS) as CsvField[]).find(key => mapping[key] === index);
    return field ? CSV_FIELDS[field] : header;
  });
}

function effectiveMapping(headers: string[]): CsvMapping {
  return Object.fromEntries(Object.entries(CANONICAL).map(([field, aliases]) => [field, headers.findIndex(header => aliases.includes(normalizeHeader(header)))])) as CsvMapping;
}

const idValue = (value: string) => /^\d+$/.test(value.trim()) ? value.trim().replace(/^0+(?=\d)/, "") : value.trim();
const cell = (row: CsvRow, index: number) => index < 0 ? "" : row.cells[index]?.trim() ?? "";

export function validateJiraCsv(table: CsvTable, mapping: CsvMapping, allowExternalParents = false): CsvFinding[] {
  const findings: CsvFinding[] = [];
  const add = (severity: CsvFinding["severity"], code: string, message: string, line?: number) => findings.push({ severity, code, message, line });
  const selected = Object.values(mapping).filter(index => index >= 0);
  if (Object.values(mapping).some(index => !Number.isInteger(index) || index < -1 || index >= table.headers.length)) {
    return [{ severity: "error", code: "mapping", message: "Choose columns from this CSV before exporting." }];
  }
  if (new Set(selected).size !== selected.length) add("error", "mapping", "Each source column can map to only one Jira field.");
  const headers = mappedCsvHeaders(table.headers, mapping);
  const fields = effectiveMapping(headers);
  if (fields.summary < 0) add("error", "summary_column", "Map a column to Summary. Jira requires a Summary for each work item.");
  if (!table.rows.length) add("error", "empty", "Add at least one work item below the header.");
  headers.forEach((header, index) => {
    if (!header.trim()) add("error", "empty_header", `Column ${index + 1} has no header. Name or remove that column.`, table.headerLine);
  });
  for (const [field, aliases] of Object.entries(CANONICAL)) {
    if (headers.filter(header => aliases.includes(normalizeHeader(header))).length > 1) {
      add("error", "duplicate_header", `More than one column exports as ${CSV_FIELDS[field as CsvField]}. Resolve the ambiguous headers.`, table.headerLine);
    }
  }
  if (headers.some(header => /^(epiclink|epicname)$/.test(normalizeHeader(header)))) add("warning", "legacy_epic", "Legacy Epic Link or Epic Name columns are preserved. Confirm how they should map to Parent in your Jira Cloud importer.");
  if (headers.some(header => /^(issuekey|workitemkey)$/.test(normalizeHeader(header)))) add("warning", "existing_keys", "This file contains work item keys. Mapping those keys can update existing Jira items; review that choice in Jira.");
  const ids = new Map<string, number>();
  table.rows.forEach((row, index) => {
    if (row.cells.length !== headers.length) add("error", "column_count", `Expected ${headers.length} fields but found ${row.cells.length}. Check delimiters and quotes.`, row.line);
    if (fields.summary >= 0) {
      const summary = cell(row, fields.summary);
      if (!summary) add("error", "summary", "Summary is empty. Add an overview of this work item.", row.line);
      else if ([...row.cells[fields.summary]].length > 255) add("error", "summary_length", "Summary exceeds Jira Cloud's documented 255-character import limit. Shorten it before importing.", row.line);
    }
    if (fields.description >= 0 && [...(row.cells[fields.description] ?? "")].length > 30_000) add("error", "description_length", "Description exceeds the documented 30,000-character import limit. Shorten it to avoid trimming.", row.line);
    if ((row.cells[fields.workType] ?? "").length > 60) add("error", "type_length", "Work type exceeds the documented 60-character import limit.", row.line);
    const id = idValue(cell(row, fields.id));
    if (id) {
      if (ids.has(id)) add("error", "duplicate_id", `Work item ID repeats the value on line ${table.rows[ids.get(id)!].line}. Use unique IDs.`, row.line);
      else ids.set(id, index);
      if (!/^\d+$/.test(id)) add("warning", "id_format", "Use unique numeric IDs for portable hierarchy imports, or verify your chosen identifier format in Jira.", row.line);
    }
    const parent = cell(row, fields.parent);
    if (/^sub[ -]?task$/i.test(cell(row, fields.workType)) && !parent) add("error", "subtask_parent", "A Sub-task needs a Parent. Add its parent reference.", row.line);
    if (parent && !id) add("error", "missing_id", "This hierarchy row needs its own Work item ID as well as Parent.", row.line);
    if (row.cells.some(value => /^[\s\uFEFF]*[=+\-@＝＋－＠]/u.test(value))) add("warning", "formula", "A cell starts with a spreadsheet formula character. Its text is preserved for Jira; review it before opening the CSV in a spreadsheet.", row.line);
  });
  const children: number[][] = table.rows.map(() => []);
  const incoming = table.rows.map(() => 0);
  table.rows.forEach((row, index) => {
    const parent = idValue(cell(row, fields.parent));
    if (!parent) return;
    const parentIndex = ids.get(parent);
    if (parentIndex === undefined) add(allowExternalParents ? "warning" : "error", "external_parent", allowExternalParents
      ? "Parent is not in this file. Verify that it exists and can be mapped in Jira."
      : "Parent is not in this file. Add it, correct the reference, or allow existing Jira parents for manual verification.", row.line);
    else {
      children[parentIndex].push(index); incoming[index]++;
      if (parentIndex > index) add("error", "parent_order", `Parent is on line ${table.rows[parentIndex].line}. Place parents before children.`, row.line);
    }
  });
  const queue = incoming.flatMap((count, index) => count === 0 ? [index] : []);
  for (let cursor = 0; cursor < queue.length; cursor++) for (const child of children[queue[cursor]]) if (--incoming[child] === 0) queue.push(child);
  if (queue.length !== table.rows.length) add("error", "cycle", "The parent references contain a cycle. A work item cannot be its own ancestor.");
  return findings;
}

export function serializeCsv(headers: string[], rows: string[][]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [headers, ...rows].map(row => row.map(quote).join(",")).join("\r\n") + "\r\n";
}

export function exportMappedCsv(table: CsvTable, mapping: CsvMapping): string {
  return serializeCsv(mappedCsvHeaders(table.headers, mapping), table.rows.map(row => row.cells));
}

export function sortParentsFirst(table: CsvTable, mapping: CsvMapping, allowExternalParents = false): CsvTable | null {
  if (validateJiraCsv(table, mapping, allowExternalParents).some(item => item.severity === "error" && item.code !== "parent_order")) return null;
  const fields = effectiveMapping(mappedCsvHeaders(table.headers, mapping));
  const ids = new Map<string, number>();
  table.rows.forEach((row, index) => { const id = idValue(cell(row, fields.id)); if (id) ids.set(id, index); });
  const pending = new Set(table.rows.map((_, index) => index));
  const placed = new Set<number>();
  const rows: CsvRow[] = [];
  while (pending.size) {
    let progressed = false;
    for (const index of pending) {
      const parent = ids.get(idValue(cell(table.rows[index], fields.parent)));
      if (parent !== undefined && !placed.has(parent)) continue;
      rows.push(table.rows[index]); placed.add(index); pending.delete(index); progressed = true;
    }
    if (!progressed) return null;
  }
  return { ...table, rows };
}

export interface CsvWorkItem { summary: string; description: string; workType: string; id: string; parent: string; priority: string; labels: string }
export function buildJiraCsv(items: CsvWorkItem[]): string {
  return serializeCsv(["Work type", "Summary", "Description", "Work item ID", "Parent", "Priority", "Labels"], items.map(item => [item.workType, item.summary, item.description, item.id, item.parent, item.priority, item.labels]));
}

export const CSV_SAMPLE_ITEMS: CsvWorkItem[] = [
  { workType: "Epic", summary: "Help shoppers find suitable products", description: "Fictional catalog improvement exercise.", id: "1", parent: "", priority: "", labels: "catalog" },
  { workType: "Story", summary: "Filter the catalog by category", description: 'As a shopper, I want to select a category.\nShow an empty state with a "Clear filters" action when nothing matches.', id: "2", parent: "1", priority: "", labels: "catalog" },
  { workType: "Sub-task", summary: "Verify category and empty-state behavior", description: "Use the agreed test dataset, including Café products.", id: "3", parent: "2", priority: "", labels: "catalog" },
];
