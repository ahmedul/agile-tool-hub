import fs from "node:fs";
import path from "node:path";

const campaignDir = path.join(process.cwd(), "docs/marketing/first-month");

function publishedPath(pathname: string): boolean {
  if (fs.existsSync(path.join(process.cwd(), "src/app", pathname, "page.tsx"))) return true;
  const match = pathname.match(/^\/(guides|templates|examples|docs)\/([a-z0-9-]+)$/);
  return !!match && fs.existsSync(path.join(process.cwd(), "src/content", match[1], `${match[2]}.mdx`));
}

it("campaign links reach published pages with distinct attribution and no private payload", () => {
  const lines = fs.readFileSync(path.join(campaignDir, "campaign-links.csv"), "utf8").trim().split("\n");
  const [header, ...rows] = lines;
  expect(header.split(",")).toHaveLength(5);
  expect(rows.length).toBeGreaterThan(8);
  const assets = new Set<string>();
  const urls = new Set<string>();
  for (const row of rows) {
    const [asset, , landingPage, trackedUrl, status] = row.split(",");
    expect(assets.has(asset)).toBe(false);
    expect(urls.has(trackedUrl)).toBe(false);
    assets.add(asset);
    urls.add(trackedUrl);
    const url = new URL(trackedUrl);
    expect(url.origin).toBe("https://agiletoolhub.com");
    expect(url.pathname).toBe(landingPage);
    expect(publishedPath(url.pathname), landingPage).toBe(true);
    expect([...url.searchParams.keys()].sort()).toEqual(["utm_campaign", "utm_content", "utm_medium", "utm_source"]);
    expect(url.searchParams.get("utm_campaign")).toBe("first_10_teams");
    expect(url.searchParams.get("utm_content")).toMatch(/^[a-z0-9_]+$/);
    expect(["draft", "approved", "published"]).toContain(status);
  }
});

it("the downloadable workshop kit points to real tools and guides", () => {
  const kit = fs.readFileSync(path.join(process.cwd(), "public/downloads/agiletoolhub-sprint-workshop-kit.md"), "utf8");
  const links = [...kit.matchAll(/https:\/\/agiletoolhub\.com\/[^\s)]+/g)];
  expect(links.length).toBeGreaterThan(5);
  for (const [href] of links) expect(publishedPath(new URL(href).pathname), href).toBe(true);
});
