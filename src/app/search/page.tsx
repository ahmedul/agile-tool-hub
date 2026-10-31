import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSearchEntries, SEARCH_TYPES, searchResources, type SearchType } from "@/lib/search";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search Tools, Templates & Guides",
  description: "Find free Agile tools, Jira templates, practical guides, examples, and apps on AgileToolHub.",
  canonical: "https://agiletoolhub.com/search",
  robots: "noindex, follow",
});

const suggestions = ["Planning poker", "Bug report", "Acceptance criteria", "Sprint capacity", "User story mapping", "Definition of done"];
type SearchParams = { q?: string | string[]; type?: string | string[] };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

function searchHref(query: string, type?: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  return `/search${params.size ? `?${params}` : ""}`;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 120);
  const requestedType = first(params.type);
  const type: SearchType | undefined = Object.hasOwn(SEARCH_TYPES, requestedType) ? requestedType as SearchType : undefined;
  const entries = getSearchEntries();
  const matches = searchResources(entries, query);
  const results = type ? matches.filter(entry => entry.type === type) : matches;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Find the right tool or template</h1>
      <p className="mt-3 text-gray-600">Search {entries.length} tools, templates, guides, examples, reference pages, and apps.</p>

      <form action="/search" method="get" role="search" className="mt-8">
        <label htmlFor="resource-search" className="mb-2 block text-sm font-semibold text-gray-900">What are you working on?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input key={`${query}:${type ?? ""}`} id="resource-search" name="q" type="search" defaultValue={query} maxLength={120} placeholder="Try planning poker or Jira bug report" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          {type && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Search</button>
        </div>
      </form>

      {!query ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Popular starting points</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {suggestions.map(suggestion => <Link key={suggestion} href={searchHref(suggestion)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50">{suggestion}</Link>)}
          </div>
          <p className="mt-8 text-sm text-gray-600">You can also <Link href="/tools" className="font-medium text-blue-700 hover:underline">browse all tools</Link> or <Link href="/templates" className="font-medium text-blue-700 hover:underline">explore the template library</Link>.</p>
        </section>
      ) : (
        <>
          <nav aria-label="Filter search results" className="mt-8 flex flex-wrap gap-2">
            {[["", "All resources"], ...Object.entries(SEARCH_TYPES)].map(([key, label]) => {
              const active = key === (type ?? "");
              const count = key ? matches.filter(entry => entry.type === key).length : matches.length;
              return <Link key={key} href={searchHref(query, key)} aria-current={active ? "page" : undefined} className={`rounded-full border px-3 py-2 text-sm font-medium ${active ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"}`}>{label} <span className={active ? "text-blue-100" : "text-gray-400"}>({count})</span></Link>;
            })}
          </nav>
          <p className="mt-6 text-sm text-gray-600">{results.length} {results.length === 1 ? "result" : "results"} for <strong className="break-words text-gray-900">“{query}”</strong>{type ? ` in ${SEARCH_TYPES[type]}` : ""}</p>
          {results.length ? (
            <ul className="mt-4 space-y-3">
              {results.map(entry => (
                <li key={entry.href}>
                  <Link href={entry.href} className="group block rounded-xl border border-gray-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">{SEARCH_TYPES[entry.type]}</span>
                    <h2 className="mt-1 text-lg font-semibold text-gray-950 group-hover:text-blue-700">{entry.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{entry.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="font-semibold text-gray-900">No matching resources</h2>
              <p className="mt-2 text-sm text-gray-600">Try fewer words, such as “bug report” or “story points”.</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-blue-700">
                {type && <Link href={searchHref(query)} className="hover:underline">Search all categories</Link>}
                <Link href="/search" className="hover:underline">Clear search</Link>
                <Link href="/tools" className="hover:underline">Browse tools</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
