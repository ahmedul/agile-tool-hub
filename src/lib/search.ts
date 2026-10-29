import { getAllContent } from "@/lib/content";
import { tools } from "@/lib/tools";
import { apps } from "@/lib/apps";

export const SEARCH_TYPES = {
  tools: "Tools", templates: "Templates", guides: "Guides",
  examples: "Examples", docs: "Docs", apps: "Apps",
} as const;
export type SearchType = keyof typeof SEARCH_TYPES;

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  type: SearchType;
  keywords?: string[];
  content?: string;
}

const ALIASES = new Map([
  ["ac", "acceptance criteria"], ["dod", "definition of done"],
  ["dor", "definition of ready"], ["retro", "retrospective"],
]);
const STOP_WORDS = new Set(["a", "an", "the", "for", "to", "and", "of", "how", "with", "my"]);

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/event[\s-]*storming/g, "eventstorming")
    .replace(/[^a-z0-9]+/g, " ").trim()
    .split(/\s+/).map(word => ALIASES.get(word) ?? word).join(" ")
    .split(/\s+/).map(word => word.endsWith("ies") ? `${word.slice(0, -3)}y` : word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word).join(" ");
}

export function searchResources(entries: SearchEntry[], query: string): SearchEntry[] {
  const phrase = normalize(query.trim().slice(0, 120));
  const terms = [...new Set(phrase.split(/\s+/).filter(word => word && !STOP_WORDS.has(word)))];
  if (!terms.length) return [];

  return entries.flatMap(entry => {
    const title = normalize(entry.title);
    const keywords = normalize((entry.keywords ?? []).join(" "));
    const description = normalize(entry.description);
    const content = normalize(entry.content ?? "");
    const fields = [title, keywords, description, content];
    if (!terms.every(term => fields.some(field => field.includes(term)))) return [];
    let score = title === phrase ? 1000 : title.includes(phrase) ? 500 : 0;
    for (const term of terms) {
      score += title.includes(term) ? 100 : keywords.includes(term) ? 40 : description.includes(term) ? 20 : 1;
    }
    if (entry.type === "tools") score += 10;
    if (entry.type === "templates") score += 5;
    return [{ entry, score }];
  }).sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).map(result => result.entry);
}

// The index stays on the server; article bodies are never bundled into the header.
export function getSearchEntries(): SearchEntry[] {
  const articles = (["templates", "guides", "examples", "docs"] as const).flatMap(type =>
    getAllContent(type).map(item => ({
      title: item.title, description: item.description, href: `/${type}/${item.slug}`,
      type, keywords: item.keywords, content: item.content,
    })),
  );
  return [
    ...tools.map(tool => ({ ...tool, type: "tools" as const })),
    { title: "Sprint Planning Tools", description: "Choose the right tool for sprint readiness, capacity, estimation, and velocity.", href: "/tools/sprint-planning-tools", type: "tools" },
    ...articles,
    ...apps.map(app => ({ title: app.name, description: app.shortDescription, href: `/apps/${app.slug}`, type: "apps" as const, keywords: [app.category, ...app.features, ...app.useCases] })),
  ];
}
