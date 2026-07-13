import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ContentMeta {
  title: string;
  description: string;
  slug: string;
  category: string;
  keywords: string[];
  relatedLinks?: { title: string; href: string }[];
  publishedAt?: string;
  updatedAt?: string;
  howToSteps?: { name: string; description: string }[];
  faqItems?: { question: string; answer: string }[];
}

export interface ContentItem extends ContentMeta {
  content: string;
}

function getContentDir(type: string) {
  return path.join(process.cwd(), "src", "content", type);
}

function normalizeDate(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function parseContentFile(filePath: string): ContentItem {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const stats = fs.statSync(filePath);
  const meta = data as ContentMeta & { date?: string; lastUpdated?: string };

  const publishedAt =
    normalizeDate(meta.publishedAt) ??
    normalizeDate(meta.date) ??
    stats.mtime.toISOString();
  const updatedAt =
    normalizeDate(meta.updatedAt) ??
    normalizeDate(meta.lastUpdated) ??
    stats.mtime.toISOString();

  return {
    ...meta,
    publishedAt,
    updatedAt,
    content,
  };
}

export function getAllContent(type: string): ContentItem[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => parseContentFile(path.join(dir, file)));
}

export function getContentBySlug(type: string, slug: string): ContentItem | null {
  const dir = getContentDir(type);
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseContentFile(filePath);
}

export function getAllSlugs(type: string): string[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
