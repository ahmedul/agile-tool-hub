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
}

export interface ContentItem extends ContentMeta {
  content: string;
}

function getContentDir(type: string) {
  return path.join(process.cwd(), "src", "content", type);
}

export function getAllContent(type: string): ContentItem[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    return { ...(data as ContentMeta), content };
  });
}

export function getContentBySlug(type: string, slug: string): ContentItem | null {
  const dir = getContentDir(type);
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { ...(data as ContentMeta), content };
}

export function getAllSlugs(type: string): string[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
