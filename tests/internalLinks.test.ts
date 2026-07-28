import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_TYPES = ["templates", "guides", "examples", "docs"] as const;
const BASE_URL = "https://agiletoolhub.com";

function getContentFiles(): string[] {
  return CONTENT_TYPES.flatMap((type) => {
    const dir = path.join(process.cwd(), "src", "content", type);
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => path.join(dir, file));
  });
}

function getPublicRoutes(): Set<string> {
  const routes = new Set([
    "/",
    "/about",
    "/docs",
    "/examples",
    "/guides",
    "/pricing",
    "/privacy",
    "/templates",
    "/tools",
  ]);

  for (const type of CONTENT_TYPES) {
    const dir = path.join(process.cwd(), "src", "content", type);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".mdx"))) {
      routes.add(`/${type}/${file.replace(/\.mdx$/, "")}`);
    }
  }

  const toolsDir = path.join(process.cwd(), "src", "app", "tools");
  for (const item of fs.readdirSync(toolsDir, { withFileTypes: true })) {
    if (!item.isDirectory() || item.name.startsWith("[")) continue;
    if (fs.existsSync(path.join(toolsDir, item.name, "page.tsx"))) {
      routes.add(`/tools/${item.name}`);
    }
  }

  return routes;
}

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function normalizeInternalHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("mailto:")) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const url = new URL(trimmed);
    if (url.hostname !== "agiletoolhub.com" && url.hostname !== "www.agiletoolhub.com") {
      return null;
    }
    return `${url.protocol}//${url.hostname}${url.pathname}`.replace(/\/$/, "") || "/";
  }

  if (!trimmed.startsWith("/")) return null;
  return trimmed.split(/[?#]/)[0].replace(/\/$/, "") || "/";
}

describe("content internal links", () => {
  it("point to published canonical routes", () => {
    const routes = getPublicRoutes();
    const failures: string[] = [];

    for (const filePath of getContentFiles()) {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const relativePath = path.relative(process.cwd(), filePath);
      const hrefs: string[] = [];

      if (Array.isArray(data.relatedLinks)) {
        for (const link of data.relatedLinks) {
          if (typeof link?.href === "string") hrefs.push(link.href);
        }
      }

      const markdown = stripCodeBlocks(content);
      for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)) {
        hrefs.push(match[1]);
      }

      for (const href of hrefs) {
        const normalized = normalizeInternalHref(href);
        if (!normalized) continue;

        if (normalized.startsWith("http://") || normalized.startsWith("https://www.")) {
          failures.push(`${relativePath}: ${href} uses a redirected URL`);
          continue;
        }

        const route = normalized.startsWith(BASE_URL)
          ? normalized.slice(BASE_URL.length) || "/"
          : normalized;

        if (!routes.has(route)) {
          failures.push(`${relativePath}: ${href} does not match a public route`);
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
