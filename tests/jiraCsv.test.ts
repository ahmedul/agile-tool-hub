import { CSV_SAMPLE_ITEMS, MAX_CSV_CHARACTERS, MAX_CSV_ROWS, buildJiraCsv, detectCsvMapping, exportMappedCsv, parseCsv, serializeCsv, sortParentsFirst, validateJiraCsv, type CsvTable } from "@/lib/jira-csv";

function table(text: string): CsvTable {
  const result = parseCsv(text);
  if (!result.ok) throw new Error(result.message);
  return result.table;
}
const codes = (csv: string, allowExternal = false) => {
  const parsed = table(csv);
  return validateJiraCsv(parsed, detectCsvMapping(parsed.headers), allowExternal).map(item => item.code);
};

describe("CSV parsing and lossless export", () => {
  it("handles BOM, quoted commas, escaped quotes, Unicode, CRLF and multiline values", () => {
    const csv = '\uFEFFSummary,Description,Labels,Labels\r\n"Café, 東京","A ""quoted"" line\r\nNext line",one,two\r\n';
    const parsed = table(csv);
    expect(parsed.rows[0]).toEqual({ line: 2, cells: ["Café, 東京", 'A "quoted" line\r\nNext line', "one", "two"] });
    const roundtrip = table(exportMappedCsv(parsed, detectCsvMapping(parsed.headers)));
    expect(roundtrip.headers).toEqual(parsed.headers);
    expect(roundtrip.rows[0].cells).toEqual(parsed.rows[0].cells);
    expect(codes(csv)).toEqual([]);
  });

  it("keeps explicit empty cells and skips physically blank lines", () => {
    const parsed = table('\nSummary,Description\r\n\r\n"",\nA,\n');
    expect(parsed.headerLine).toBe(2);
    expect(parsed.rows).toEqual([{ line: 4, cells: ["", ""] }, { line: 5, cells: ["A", ""] }]);
    expect(codes('Summary\n""')).toContain("summary");
  });

  it.each(['Summary\n"unclosed', 'Summary\nBad"quote', 'Summary\n"value"suffix', 'Summary\n "quote"']) ("rejects malformed quoting: %s", csv => {
    expect(parseCsv(csv).ok).toBe(false);
  });

  it("preserves a deterministic corpus of punctuation, newlines and Unicode", () => {
    const parts = ["", "comma,", 'quote"', "\n", "\r\n", "\r", "Café 東京 🚀", "  padded  ", "=1+1"];
    const rows = Array.from({ length: 81 }, (_, index) => [parts[index % parts.length] + parts[Math.floor(index / parts.length)], String(index), ""]);
    expect(table(serializeCsv(["Summary", "Extra", "Empty"], rows)).rows.map(row => row.cells)).toEqual(rows);
  });

  it("enforces tool limits without accepting truncated data", () => {
    expect(parseCsv("a".repeat(MAX_CSV_CHARACTERS + 1)).ok).toBe(false);
    expect(parseCsv(Array.from({ length: 101 }, () => "Column").join(",")).ok).toBe(false);
    expect(table("Summary\n" + "Item\n".repeat(MAX_CSV_ROWS)).rows).toHaveLength(MAX_CSV_ROWS);
    expect(parseCsv("Summary\n" + "Item\n".repeat(MAX_CSV_ROWS + 1)).ok).toBe(false);
  });
});

describe("Jira fields and mapping", () => {
  it("requires nonempty summaries, consistent rows, and named headers", () => {
    expect(codes("Description\nDetails")).toContain("summary_column");
    expect(codes("Summary\n")).toContain("empty");
    expect(codes('Summary,Description\n"",Details\nGood')).toEqual(expect.arrayContaining(["summary", "column_count"]));
    expect(codes("Summary,\nGood,Details")).toContain("empty_header");
  });

  it("checks documented Summary, Description, and Work type lengths", () => {
    expect(codes(serializeCsv(["Summary", "Description", "Work type"], [["x".repeat(256), "x".repeat(30001), "x".repeat(61)]]))).toEqual(expect.arrayContaining(["summary_length", "description_length", "type_length"]));
    expect(codes(serializeCsv(["Summary"], [["x".repeat(255)]]))).toEqual([]);
    expect(codes(serializeCsv(["Summary"], [[" ".repeat(255) + "A"]]))).toContain("summary_length");
  });

  it("rejects null characters from unsupported source encodings", () => {
    expect(parseCsv("S\0u\0m\0m\0a\0r\0y\0").ok).toBe(false);
  });

  it("renames mapped columns and preserves custom fields and repeated Labels", () => {
    const parsed = table("Title,Details,Custom field,Labels,Labels\nFix payment,Keep this,Blue,a,b");
    const mapping = detectCsvMapping(parsed.headers);
    expect(validateJiraCsv(parsed, mapping)).toEqual([]);
    expect(table(exportMappedCsv(parsed, mapping)).headers).toEqual(["Summary", "Description", "Custom field", "Labels", "Labels"]);
    expect(table(exportMappedCsv(parsed, mapping)).rows[0].cells).toEqual(parsed.rows[0].cells);
    expect(validateJiraCsv(parsed, { ...mapping, description: mapping.summary }).map(item => item.code)).toContain("mapping");
    expect(validateJiraCsv(parsed, { ...mapping, summary: 999 })[0].code).toBe("mapping");
  });

  it("flags duplicate core fields but allows duplicate multivalue fields", () => {
    expect(codes("Summary,Summary\nA,B")).toContain("duplicate_header");
    expect(codes("Summary,Issue ID,Work item ID\nA,1,2")).toContain("duplicate_header");
    expect(codes("Summary,Labels,Labels,Component,Component\nA,a,b,c,d")).toEqual([]);
  });

  it("checks exported recognized headers even when the mapping is left unchanged", () => {
    const parsed = table("Summary,Work item ID,Parent\nChild,1,99");
    const mapping = { ...detectCsvMapping(parsed.headers), parent: -1 };
    expect(validateJiraCsv(parsed, mapping).map(item => item.code)).toContain("external_parent");
  });

  it("preserves formula-like text and warns only when relevant", () => {
    for (const value of ["=1+1", " +SUM(1)", "-2", "@name", "＝1+1", "\t=cmd"]) {
      const csv = serializeCsv(["Summary"], [[value]]);
      expect(codes(csv)).toContain("formula");
      expect(table(exportMappedCsv(table(csv), { summary: 0, description: -1, workType: -1, id: -1, parent: -1 })).rows[0].cells[0]).toBe(value);
    }
    expect(codes("Summary\nNormal item")).not.toContain("formula");
    expect(codes("Summary,Issue Key,Epic Link\nA,PROJ-1,EPIC-1")).toEqual(expect.arrayContaining(["existing_keys", "legacy_epic"]));
  });
});

describe("Jira parent hierarchy", () => {
  it("accepts the full Epic, Story, Sub-task sample", () => {
    expect(codes(buildJiraCsv(CSV_SAMPLE_ITEMS))).toEqual([]);
  });

  it("finds missing and duplicate IDs without rounding large IDs", () => {
    expect(codes("Summary,Work item ID,Parent\nA,01,\nB,1,")).toContain("duplicate_id");
    expect(codes("Summary,Work item ID,Parent\nA,1,\nB,,1")).toContain("missing_id");
    expect(codes("Summary,Work item ID,Parent\nA,9007199254740992,\nB,9007199254740993,9007199254740992")).toEqual([]);
  });

  it("makes references outside the file errors unless explicitly allowed", () => {
    const csv = "Summary,Work item ID,Parent\nChild,1,PROJ-99";
    const parsed = table(csv);
    expect(validateJiraCsv(parsed, detectCsvMapping(parsed.headers))[0].severity).toBe("error");
    expect(validateJiraCsv(parsed, detectCsvMapping(parsed.headers), true)).toEqual([expect.objectContaining({ code: "external_parent", severity: "warning" })]);
    expect(codes("Summary,Work type\nChild,Sub-task")).toContain("subtask_parent");
  });

  it.each(["Summary,Work item ID,Parent\nA,1,1", "Summary,Work item ID,Parent\nA,1,2\nB,2,1"]) ("rejects self references and cycles", csv => {
    const parsed = table(csv), mapping = detectCsvMapping(parsed.headers);
    expect(validateJiraCsv(parsed, mapping).map(item => item.code)).toContain("cycle");
    expect(sortParentsFirst(parsed, mapping)).toBeNull();
  });

  it("reorders ancestors before descendants while preserving every value", () => {
    const parsed = table(serializeCsv(["Summary", "Work item ID", "Parent", "Extra"], [["Sub", "3", "2", "Café\nmultiline"], ["Story", "2", "1", '"quoted", extra'], ["Epic", "1", "", "unchanged"]]));
    const mapping = detectCsvMapping(parsed.headers);
    expect(validateJiraCsv(parsed, mapping).filter(item => item.severity === "error").map(item => item.code)).toEqual(["parent_order", "parent_order"]);
    const sorted = sortParentsFirst(parsed, mapping)!;
    expect(sorted.rows.map(row => row.cells[1])).toEqual(["1", "2", "3"]);
    expect(sorted.rows.map(row => row.cells)).toEqual([...parsed.rows].reverse().map(row => row.cells));
    const reparsed = table(exportMappedCsv(sorted, mapping));
    expect(validateJiraCsv(reparsed, detectCsvMapping(reparsed.headers))).toEqual([]);
    expect(parsed.rows[0].cells[1]).toBe("3");
  });
});
