"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToolOutputActions from "@/components/ToolOutputActions";
import { useToolUsage } from "@/hooks/useToolUsage";
import { trackEvent } from "@/lib/analytics";
import { MAX_TICKET_CHARACTERS, REVIEW_LABELS, TICKET_EXAMPLES, reviewTicket, ticketReviewMarkdown, type ReviewKind, type TicketReview } from "@/lib/ticket-review";
import { consumeToolHandoff, saveToolHandoff } from "@/lib/tool-handoff";

const button = "rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50";

export default function TicketQualityChecker() {
  const [kind, setKind] = useState<ReviewKind>("bug");
  const [text, setText] = useState("");
  const [review, setReview] = useState<TicketReview | null>(null);
  const [notice, setNotice] = useState("");
  const [transferFailed, setTransferFailed] = useState(false);
  const touched = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  const markUsed = useToolUsage("jira_ticket_quality_checker");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || touched.current) return;
      const transfer = consumeToolHandoff("review");
      if (transfer.error) setNotice(transfer.error);
      if (transfer.payload?.kind === "review") {
        setText(transfer.payload.text); setKind(transfer.payload.reviewKind);
        setNotice("Result loaded from the previous tool. Review or edit it below.");
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (review) result.current?.focus(); }, [review]);

  function edit(value: string) {
    touched.current = true; setText(value); setReview(null); setNotice(""); setTransferFailed(false);
  }

  function buildCsv() {
    if (!review) return;
    if (!saveToolHandoff({ kind: "csv", summary: review.summary, description: text, workType: kind === "bug" ? "Bug" : kind === "story" ? "Story" : "Task" })) {
      setTransferFailed(true); return;
    }
    trackEvent("tool_handoff", { from: "jira_ticket_quality_checker", to: "jira_csv_builder" });
    router.push("/tools/jira-csv-builder");
  }

  return <section aria-label="Ticket review tool" className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
    <div>
      <label htmlFor="review-kind" className="block text-sm font-semibold text-gray-900">What are you reviewing?</label>
      <select id="review-kind" value={kind} onChange={event => {
        touched.current = true; setKind(event.target.value as ReviewKind); setReview(null); setNotice(""); setTransferFailed(false);
      }} className="mt-2 w-full rounded-lg border border-gray-300 p-2 sm:w-auto">
        {Object.entries(REVIEW_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} onClick={() => edit(TICKET_EXAMPLES[kind].weak)}>Load weak example</button>
      <button type="button" className={button} onClick={() => edit(TICKET_EXAMPLES[kind].detailed)}>Load detailed example</button>
    </div>
    <div>
      <label htmlFor="ticket-text" className="block text-sm font-semibold text-gray-900">Ticket text</label>
      <p id="ticket-privacy" className="my-2 text-sm text-gray-600">Checks run in your browser. This input is not uploaded or automatically saved. Refreshing clears it. Moving it to the CSV builder uses a temporary transfer in this tab.</p>
      <textarea id="ticket-text" value={text} onChange={event => edit(event.target.value)} rows={13} aria-describedby="ticket-privacy ticket-count" className="w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="Paste a bug report, user story, or acceptance criteria. Markdown and plain-text section headings are supported." />
      <p id="ticket-count" className={`mt-1 text-xs ${text.length > MAX_TICKET_CHARACTERS ? "text-red-700" : "text-gray-500"}`}>{text.length.toLocaleString()} / {MAX_TICKET_CHARACTERS.toLocaleString()} characters{ text.length > MAX_TICKET_CHARACTERS ? ". Shorten the text before reviewing; your input has been kept." : ""}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!text.trim() || text.length > MAX_TICKET_CHARACTERS} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" onClick={() => { markUsed(); setReview(reviewTicket(text, kind)); }}>Review ticket</button>
      <button type="button" className={button} onClick={() => edit("")}>Clear input</button>
    </div>
    {notice && <p role="status" className="text-sm text-blue-800">{notice}</p>}
    {review && <div ref={result} tabIndex={-1} className="space-y-5 border-t border-gray-200 pt-5 outline-none">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Review findings</h2>
        <p role="status" className="mt-2 font-medium text-gray-800">{review.checks.length - review.detected} of {review.checks.length} checks flagged for review.</p>
        <p className="mt-2 text-sm text-gray-600">These checks look for text patterns and section content. They cannot establish correctness, completeness, priority, or whether a criterion is testable. A reviewer still needs to assess the ticket.</p>
      </div>
      <ul className="space-y-3">
        {review.checks.map(check => <li key={check.id} className={`rounded-lg border p-4 ${check.detected ? "border-gray-200" : "border-amber-300 bg-amber-50"}`}>
          <h3 className="font-semibold text-gray-900">{check.label} <span className="ml-1 text-xs font-normal">{check.detected ? "— Detected / no flag" : "— Needs review"}</span></h3>
          <p className="mt-1 text-sm text-gray-700">{check.explanation}</p>
          {check.evidence && <blockquote className="mt-2 whitespace-pre-wrap break-words border-l-2 border-gray-300 pl-3 text-sm text-gray-600">{check.evidence}</blockquote>}
        </li>)}
      </ul>
      <ToolOutputActions text={ticketReviewMarkdown(review)} tool="jira_ticket_quality_checker" filename="jira-ticket-review.md" copyLabel="Copy review" />
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="mb-3 text-sm text-gray-700">Ready to prepare an import? Move the original ticket text into an editable CSV row. Findings are not included in its description.</p>
        <button type="button" className={button} onClick={buildCsv}>Build a Jira CSV</button>
        {transferFailed && <p role="alert" className="mt-2 text-sm text-red-700">The temporary transfer could not be saved. Copy your ticket text and paste it into the <Link className="underline" href="/tools/jira-csv-builder">CSV builder</Link>.</p>}
      </div>
    </div>}
  </section>;
}
