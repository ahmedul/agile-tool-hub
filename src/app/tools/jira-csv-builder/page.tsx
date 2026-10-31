import type { Metadata } from "next";
import Link from "next/link";
import JiraCsvBuilder from "@/components/JiraCsvBuilder";
import ToolFeedbackPanel from "@/components/ToolFeedbackPanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQSchema, buildMetadata, buildToolSchema } from "@/lib/seo";

const name = "Jira CSV Builder and Validator";
const href = "/tools/jira-csv-builder";
const url = `https://agiletoolhub.com${href}`;
const description = "Build Jira import CSVs or check an existing file for missing summaries, quote errors, duplicate IDs, and parent hierarchy problems. Free, local, no signup.";
export const metadata: Metadata = buildMetadata({ title: "Jira CSV Builder & Validator – Free Import File Tool", description, canonical: url, keywords: ["jira csv builder", "jira csv validator", "jira csv import", "jira epic story subtask csv", "jira import template"] });
const faq = [
  { question: "What does a Jira import CSV need?", answer: "Jira requires a Summary for each item. Other required fields depend on your project and importer. This tool checks a comma-separated file and can export Summary, Description, Work type, Work item ID, Parent, Priority, and Labels columns." },
  { question: "Can I create an Epic, Story, and Sub-task hierarchy?", answer: "Yes. Use unique Work item IDs, point each child at its Parent, and place parents before children. The sample demonstrates three linked rows. Your Jira project's available work types and hierarchy still need to be checked in Jira." },
  { question: "Does validation guarantee that Jira will accept the file?", answer: "No. It checks file syntax, selected field limits, IDs, and in-file parent references. It cannot check your project's permissions, custom required fields, work type configuration, existing Jira parents, or import mapping. Review those in Jira's import preview." },
  { question: "Are extra columns and repeated Labels headers preserved?", answer: "Yes. Selected source headers are renamed, while other columns and full values are kept. Repeated Labels columns can be valid for Jira's multi-value fields. Ambiguous duplicate core fields, such as two Summary columns, are flagged." },
  { question: "Is the CSV uploaded or saved?", answer: "No file upload to a server is needed. Reading, parsing, checking, and downloading happen in your browser. Input is not automatically saved; refreshing clears it. Validation supports up to 2,000 rows, 100 columns, and 2 million characters, with a 2 MB limit for selected files." },
];

export default function JiraCsvBuilderPage() {
  return <>
    <JsonLd data={buildBreadcrumbSchema([{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: name, href }])} />
    <JsonLd data={buildFAQSchema(faq)} />
    <JsonLd data={buildToolSchema({ name, description, url, applicationCategory: "BusinessApplication" })} />
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: name }]} />
      <span className="text-xs font-semibold uppercase text-green-700">Free tool · No signup</span>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">{name}</h1>
      <p className="mb-8 mt-4 text-lg text-gray-600">Prepare a Jira Cloud import file, or check a CSV you already have. Find formatting problems and broken parent references before reviewing the import in Jira.</p>
      <JiraCsvBuilder />
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">Example: import an Epic with a Story and Sub-task</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800"><thead><tr>{["Work type", "Summary", "Work item ID", "Parent"].map(label => <th key={label} className="border-b border-gray-300 p-2">{label}</th>)}</tr></thead>
            <tbody>{[["Epic", "Help shoppers find suitable products", "1", ""], ["Story", "Filter the catalog by category", "2", "1"], ["Sub-task", "Verify category and empty-state behavior", "3", "2"]].map(row => <tr key={row[2]}>{row.map((value, index) => <td key={index} className="border-b border-gray-200 p-2">{value || "—"}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="mt-4 text-gray-700">Load this fictional example to get complete descriptions, including quotes and line breaks. Moving the Story above its Epic triggers a parent-order error. The reorder action changes row order while preserving IDs and cell contents.</p>
      </section>
      <section className="mt-8 space-y-3 text-gray-700">
        <h2 className="text-xl font-bold text-gray-900">Review the file and the Jira mapping</h2>
        <p>Use the validator to map your source columns. The download quotes fields and keeps embedded commas, line breaks, and quotes. It preserves additional columns so you can map custom fields in Jira. Check the full file and Jira&apos;s import preview before creating items.</p>
        <p>The checks follow Atlassian&apos;s <a href="https://support.atlassian.com/jira-software-cloud/docs/prepare-a-csv-file-for-import/" className="text-blue-700 underline">CSV preparation guidance</a>, <a href="https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/" className="text-blue-700 underline">import instructions</a>, and <a href="https://support.atlassian.com/jira-software-cloud/docs/mapping-csv-data-to-jira-fields" className="text-blue-700 underline">documented field limits</a>. Follow the <a href="https://support.atlassian.com/jira/kb/keep-issue-parent-child-mapping-during-csv-import-to-jira-cloud/" className="text-blue-700 underline">current Parent mapping guidance</a> for your importer; legacy Epic Link fields need manual review.</p>
        <p>If a value looks like a spreadsheet formula, the tool flags it and preserves the original text for Jira. Review that warning before opening the file in a spreadsheet. Quoting a CSV field does not neutralize spreadsheet formulas; see <a href="https://community.owasp.org/attacks/CSV_Injection" className="text-blue-700 underline">OWASP&apos;s CSV guidance</a>.</p>
      </section>
      <ToolFeedbackPanel toolName={name} toolSlug="jira-csv-builder" />
      <FAQ items={faq} />
      <section className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Prepare the ticket content first</h2>
        <ul className="space-y-2 text-blue-700">
          <li><Link href="/tools/jira-ticket-quality-checker" className="hover:underline">Review a ticket with the Jira Ticket Quality Checker</Link></li>
          <li><Link href="/templates/jira-bug-report-template" className="hover:underline">Jira Bug Report Template</Link></li>
          <li><Link href="/templates/user-story-template" className="hover:underline">User Story Template</Link></li>
          <li><Link href="/guides/complete-guide-to-jira-ticket-quality" className="hover:underline">Complete Guide to Jira Ticket Quality</Link></li>
        </ul>
      </section>
    </div>
  </>;
}
