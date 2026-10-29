/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://agiletoolhub.com",
  generateRobotsTxt: true,
  autoLastmod: false,
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, pathname) => {
    const match = pathname.match(/^\/(templates|guides|examples|docs)\/([a-z0-9-]+)$/);
    let lastmod;
    if (match) {
      const [fs, path, { default: matter }] = await Promise.all([
        import("node:fs"), import("node:path"), import("gray-matter"),
      ]);
      const file = path.join(process.cwd(), "src/content", match[1], `${match[2]}.mdx`);
      if (fs.existsSync(file)) {
        const { data } = matter(fs.readFileSync(file, "utf8"));
        const date = data.updatedAt ?? data.lastUpdated ?? data.publishedAt ?? data.date;
        const parsed = date ? new Date(date) : null;
        if (parsed && !Number.isNaN(parsed.getTime())) lastmod = parsed.toISOString();
      }
    }
    return { loc: pathname, changefreq: config.changefreq, priority: config.priority, ...(lastmod ? { lastmod } : {}) };
  },
  exclude: [
    "/api/*",
    "/mcp",
    "/opengraph-image",
    "/tools/event-storming/*",
    "/tools/user-story-mapping/*",
    "/tools/planning-poker/*",
    "/tools/retro-board/*",
    "/_*",
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
  },
};
