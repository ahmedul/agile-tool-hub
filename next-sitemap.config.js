/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://agiletoolhub.com",
  generateRobotsTxt: true,
  autoLastmod: false,
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/api/*",
    "/tools/planning-poker/[sessionId]",
    "/tools/retro-board/[sessionId]",
    "/_*",
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
  },
};
