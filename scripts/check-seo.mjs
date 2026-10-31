import { writeFile } from "node:fs/promises";

const base = new URL(process.argv[2] ?? "https://agiletoolhub.com");
const canonicalBase = "https://agiletoolhub.com";
const failures = [];
const checked = [];
const urls = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const unescape = value => value.replaceAll("&amp;", "&");
async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  return { response, body: await response.text() };
}

const index = await get("/sitemap.xml");
if (index.response.status !== 200) throw new Error(`Sitemap returned ${index.response.status}`);
const sitemapUrls = /<sitemapindex[\s>]/.test(index.body) ? urls(index.body) : [];
let pages = sitemapUrls.length ? [] : urls(index.body);
for (const sitemap of sitemapUrls) {
  const { response, body } = await get(new URL(sitemap).pathname);
  if (response.status !== 200) throw new Error(`Child sitemap returned ${response.status}`);
  pages.push(...urls(body));
}
pages = [...new Set(pages)];

async function checkPage(url) {
  const parsed = new URL(url);
  if (parsed.origin !== canonicalBase || /\[|\]|\/api\/|\/mcp(?:$|\/)/.test(parsed.pathname)) {
    failures.push({ url, error: "Unexpected sitemap URL" });
    return;
  }
  const { response, body } = await get(parsed.pathname);
  const canonical = unescape(body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? "");
  const normalize = value => value.replace(/\/$/, "");
  const robots = body.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  const errors = [];
  if (response.status !== 200) errors.push(`HTTP ${response.status}`);
  if (normalize(canonical) !== normalize(url)) errors.push(`Canonical: ${canonical || "missing"}`);
  if (/noindex/i.test(robots)) errors.push("Indexable sitemap contains a noindex page");
  if (!/<h1[\s>]/.test(body)) errors.push("Missing H1");
  if (/"aggregateRating"\s*:/.test(body)) errors.push("Review ratings require an explicit review-source audit");
  if (errors.length) failures.push({ url, errors });
  checked.push({ url, status: response.status, canonical });
}

let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < pages.length) {
    const url = pages[next++];
    try { await checkPage(url); } catch (error) { failures.push({ url, error: error.message }); }
  }
}));

async function checkExcludedPage(path, label) {
  const { response, body } = await get(path);
  const robots = body.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  if (response.status !== 200 || !/noindex/i.test(robots)) failures.push({ url: path, error: `${label} must render with noindex` });
  if (pages.some(url => new URL(url).pathname === new URL(path, base).pathname)) failures.push({ url: path, error: `${label} is listed in the sitemap` });
}

for (const tool of ["planning-poker", "retro-board", "event-storming", "user-story-mapping"]) {
  await checkExcludedPage(`/tools/${tool}/11111111-1111-4111-8111-111111111111`, "Workshop");
}
await checkExcludedPage("/search?q=planning+poker", "Search results page");

const result = { base: base.origin, checkedPages: checked.length, checkedWorkshops: 4, checkedSearchPages: 1, failures };
if (process.env.SEO_REPORT_PATH) await writeFile(process.env.SEO_REPORT_PATH, JSON.stringify({ ...result, checked }, null, 2));
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
