"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ToolOutputActions from "@/components/ToolOutputActions";
import { useToolUsage } from "@/hooks/useToolUsage";
import { trackEvent } from "@/lib/analytics";
import { CSV_FIELDS, CSV_SAMPLE_ITEMS, buildJiraCsv, detectCsvMapping, exportMappedCsv, mappedCsvHeaders, parseCsv, serializeCsv, sortParentsFirst, validateJiraCsv, type CsvField, type CsvMapping, type CsvTable, type CsvWorkItem } from "@/lib/jira-csv";
import { consumeToolHandoff } from "@/lib/tool-handoff";

type EditorRow = CsvWorkItem & { key: number };
type Review = { table: CsvTable; mapping: CsvMapping };
const blank = (key: number): EditorRow => ({ key, workType: "Task", summary: "", description: "", id: String(key), parent: "", priority: "", labels: "" });
const button = "rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50";
const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
const fields = Object.keys(CSV_FIELDS) as CsvField[];

export default function JiraCsvBuilder() {
  const [mode, setMode] = useState<"build" | "validate">("build");
  const [items, setItems] = useState<EditorRow[]>([blank(1)]);
  const [source, setSource] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [allowExternal, setAllowExternal] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const nextKey = useRef(2);
  const touched = useRef(false);
  const fileVersion = useRef(0);
  const mounted = useRef(false);
  const results = useRef<HTMLDivElement>(null);
  const markUsed = useToolUsage("jira_csv_builder");

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || touched.current) return;
      const transfer = consumeToolHandoff("csv");
      if (transfer.error) setNotice(transfer.error);
      if (transfer.payload?.kind === "csv") {
        const payload = transfer.payload;
        setItems([{ ...blank(1), summary: payload.summary, description: payload.description, workType: payload.workType }]);
        setNotice("Ticket text loaded. Check the Summary and Description before reviewing the CSV.");
      }
    });
    return () => { cancelled = true; mounted.current = false; };
  }, []);

  // Mapping and existing-parent choices recompute the visible file checks.
  const findings = useMemo(() => review ? validateJiraCsv(review.table, review.mapping, allowExternal) : [], [review, allowExternal]);
  const errors = findings.filter(item => item.severity === "error").length;
  const warnings = findings.length - errors;
  const exported = review && errors === 0 ? exportMappedCsv(review.table, review.mapping) : "";

  function invalidate() {
    touched.current = true; fileVersion.current++; setLoadingFile(false);
    setReview(null); setError(""); setNotice("");
  }

  function updateItem(key: number, field: keyof CsvWorkItem, value: string) {
    invalidate(); setItems(current => current.map(item => item.key === key ? { ...item, [field]: value } : item));
  }

  function checkCsv(text: string) {
    markUsed(); setError(""); setNotice("");
    const parsed = parseCsv(text);
    if (!parsed.ok) { setReview(null); setError(`Line ${parsed.line}: ${parsed.message}`); return; }
    setReview({ table: parsed.table, mapping: detectCsvMapping(parsed.table.headers) });
    requestAnimationFrame(() => results.current?.focus());
  }

  async function readFile(file: File) {
    invalidate();
    const version = fileVersion.current;
    if (file.size > 2_000_000) { setError("This tool accepts files up to 2 MB. The previous input has been kept."); return; }
    setLoadingFile(true);
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
      if (!mounted.current || fileVersion.current !== version) return;
      setSource(text); setNotice("File loaded locally. Choose Validate CSV to check its contents.");
    } catch {
      if (mounted.current && fileVersion.current === version) setError("Could not read the file as UTF-8. Convert its encoding or paste the CSV text instead. The previous input has been kept.");
    } finally { if (mounted.current && fileVersion.current === version) setLoadingFile(false); }
  }

  function reorder() {
    if (!review) return;
    const sorted = sortParentsFirst(review.table, review.mapping, allowExternal);
    if (!sorted) return;
    // Reparse so line references match the reordered file, including multiline cells.
    const text = serializeCsv(sorted.headers, sorted.rows.map(row => row.cells));
    const parsed = parseCsv(text);
    if (!parsed.ok) return;
    if (mode === "validate") setSource(text);
    else setItems(sorted.rows.map(row => items[review.table.rows.indexOf(row)]));
    setReview({ table: parsed.table, mapping: review.mapping });
    setNotice("Rows reordered with parents before children. Cell contents and IDs were preserved.");
    trackEvent("csv_parent_order_fixed", { tool: "jira_csv_builder", row_count: sorted.rows.length });
  }

  const canReorder = findings.some(item => item.code === "parent_order") && findings.every(item => item.severity !== "error" || item.code === "parent_order");

  return <section aria-label="Jira CSV tool" className="min-w-0 space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
    <div className="flex flex-wrap gap-2" aria-label="Choose CSV task">
      {(["build", "validate"] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => { invalidate(); setMode(value); }} className={`${button} ${mode === value ? "border-blue-600 bg-blue-50 font-semibold text-blue-800" : ""}`}>{value === "build" ? "Build CSV" : "Validate an existing CSV"}</button>)}
    </div>
    <p className="text-sm text-gray-600">Your ticket text and CSV stay in your browser. Input is not uploaded or automatically saved. Refreshing clears it. The builder supports 100 rows; file validation supports 2,000 rows, 100 columns, and 2 million characters.</p>

    {mode === "build" ? <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => {
          invalidate(); nextKey.current = 4; setItems(CSV_SAMPLE_ITEMS.map((item, index) => ({ ...item, key: index + 1 })));
        }}>Load Epic → Story → Sub-task example</button>
        <button type="button" className={button} onClick={() => { invalidate(); nextKey.current = 2; setItems([blank(1)]); }}>Clear builder</button>
      </div>
      <datalist id="jira-work-types">{["Epic", "Story", "Task", "Bug", "Sub-task"].map(type => <option key={type} value={type} />)}</datalist>
      {items.map((item, index) => <fieldset key={item.key} className="min-w-0 rounded-lg border border-gray-200 p-4">
        <legend className="px-1 font-semibold text-gray-900">Work item {index + 1}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-800">Work type
            <input className={input} list="jira-work-types" value={item.workType} onChange={event => updateItem(item.key, "workType", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800">Summary (required)
            <input className={input} value={item.summary} onChange={event => updateItem(item.key, "summary", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800 sm:col-span-2">Description
            <textarea className={input} rows={4} value={item.description} onChange={event => updateItem(item.key, "description", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800">Work item ID
            <input className={input} value={item.id} onChange={event => updateItem(item.key, "id", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800">Parent ID (optional)
            <input className={input} value={item.parent} onChange={event => updateItem(item.key, "parent", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800">Priority (optional)
            <input className={input} value={item.priority} onChange={event => updateItem(item.key, "priority", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-800">Label (optional)
            <input className={input} value={item.labels} onChange={event => updateItem(item.key, "labels", event.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={button} disabled={items.length === 1} onClick={() => { invalidate(); setItems(current => current.filter(row => row.key !== item.key)); }}>Remove work item {index + 1}</button>
          <span className="text-xs text-gray-500">Use your project&apos;s work types, priorities, and valid label values.</span>
        </div>
      </fieldset>)}
      <p className="text-sm text-gray-600">IDs connect rows in this file. Put parents before children; each child needs its own unique ID. Leave Parent blank for top-level items. Use one label per row here; existing CSVs may use repeated Labels columns.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={items.length >= 100} onClick={() => { invalidate(); const row = blank(nextKey.current++); setItems(current => [...current, row]); }}>Add work item ({items.length}/100)</button>
        <button type="button" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => checkCsv(buildJiraCsv(items))}>Review CSV</button>
      </div>
    </div> : <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => { invalidate(); setSource(buildJiraCsv(CSV_SAMPLE_ITEMS)); }}>Load sample CSV</button>
        <button type="button" className={button} onClick={() => { invalidate(); setSource(""); }}>Clear CSV</button>
      </div>
      <label className="block text-sm font-semibold text-gray-900">Choose a CSV file (up to 2 MB)
        <input type="file" accept=".csv,text/csv" className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border file:border-gray-300 file:bg-white file:px-3 file:py-2" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void readFile(file); }} />
      </label>
      <label htmlFor="csv-source" className="block text-sm font-semibold text-gray-900">Or paste comma-separated CSV text</label>
      <textarea id="csv-source" value={source} rows={12} spellCheck={false} className={`${input} font-mono`} onChange={event => { invalidate(); setSource(event.target.value); }} placeholder={'Summary,Description,Work type,Work item ID,Parent\n"Filter products","Add a category filter",Story,1,'} />
      <p className="text-xs text-gray-500">{source.length.toLocaleString()} characters. Quoted commas, quotes, and line breaks are supported. Only UTF-8 CSV is supported; convert other encodings before loading.</p>
      <button type="button" disabled={!source.trim() || loadingFile} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" onClick={() => checkCsv(source)}>Validate CSV</button>
    </div>}

    <label className="flex items-start gap-2 text-sm text-gray-700">
      <input type="checkbox" className="mt-1" checked={allowExternal} onChange={event => { touched.current = true; setAllowExternal(event.target.checked); }} />
      <span>Allow parents already in Jira. References outside this file will be warnings and need manual verification.</span>
    </label>
    {loadingFile && <p role="status" className="text-sm text-gray-600">Reading file locally…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="text-sm text-blue-800">{notice}</p>}

    {review && <div ref={results} tabIndex={-1} className="min-w-0 space-y-5 border-t border-gray-200 pt-5 outline-none">
      <h2 className="text-xl font-bold text-gray-900">CSV review</h2>
      {mode === "validate" && <fieldset className="rounded-lg bg-gray-50 p-4">
        <legend className="px-1 font-semibold text-gray-900">Map your columns</legend>
        <p className="mb-3 text-sm text-gray-600">Selected headers are renamed in the download. Other columns and their values are preserved. Existing recognized Jira headers are still checked when you choose Keep original headers.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(field => <label className="text-sm font-medium text-gray-800" key={field}>{CSV_FIELDS[field]}
            <select value={review.mapping[field]} className={input} onChange={event => {
              markUsed(); setNotice(""); setReview({ ...review, mapping: { ...review.mapping, [field]: Number(event.target.value) } });
            }}><option value={-1}>Keep original headers</option>{review.table.headers.map((header, index) => <option key={index} value={index}>{index + 1}: {header || "(empty header)"}</option>)}</select>
          </label>)}
        </div>
      </fieldset>}
      <p role="status" className={`rounded-lg p-4 font-medium ${errors ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-900"}`}>{review.table.rows.length} work items · {errors} errors · {warnings} warnings. {errors === 0 ? "No errors detected in these file checks." : "Resolve errors before exporting."}</p>
      {findings.length > 0 && <div>
        <ul className="space-y-2 text-sm text-gray-800">{findings.slice(0, 50).map((finding, index) => <li key={index} className="rounded border border-gray-200 p-3"><strong>{finding.severity === "error" ? "Error" : "Warning"}{finding.line ? ` · line ${finding.line}` : ""}:</strong> {finding.message}</li>)}</ul>
        {findings.length > 50 && <p className="mt-2 text-sm text-gray-600">Showing the first 50 of {findings.length} findings. Correct these and validate again.</p>}
      </div>}
      {canReorder && <button type="button" className={button} onClick={reorder}>Place parents before children</button>}
      <div>
        <h3 className="mb-2 font-semibold text-gray-900">Export preview</h3>
        <p id="csv-preview-note" className="mb-2 text-xs text-gray-600">First 10 rows, up to 200 characters per cell. The download contains all rows and full values.</p>
        <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200" role="region" aria-label="CSV export preview" tabIndex={0}>
          <table className="w-full text-left text-sm" aria-describedby="csv-preview-note">
            <thead className="bg-gray-50"><tr>{mappedCsvHeaders(review.table.headers, review.mapping).map((header, index) => <th key={index} className="min-w-36 border-b border-gray-200 p-3">{header}</th>)}</tr></thead>
            <tbody>{review.table.rows.slice(0, 10).map((row, index) => <tr key={index}>{row.cells.map((value, column) => <td key={column} className="max-w-72 whitespace-pre-wrap break-words border-b border-gray-100 p-3">{value.length > 200 ? value.slice(0, 200) + "…" : value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-gray-600">These checks cover file structure and in-file references. Confirm your Jira project&apos;s required fields, work types, hierarchy levels, permissions, and field mapping in Jira&apos;s import preview. Warnings are preserved in the downloadable data and need review.</p>
      {exported && <ToolOutputActions text={exported} tool="jira_csv_builder" filename="jira-import.csv" format="csv" copyLabel="Copy CSV" eventParams={{ row_count: review.table.rows.length, warning_count: warnings }} />}
    </div>}
  </section>;
}
