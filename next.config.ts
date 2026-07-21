import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  trailingSlash: false,
  redirects: async () => [
    {
      source: "/:path*",
      has: [
        {
          type: "host",
          value: "www.agiletoolhub.com",
        },
        {
          type: "header",
          key: "x-forwarded-proto",
          value: "http",
        },
      ],
      destination: "https://agiletoolhub.com/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [
        {
          type: "host",
          value: "agiletoolhub.com",
        },
        {
          type: "header",
          key: "x-forwarded-proto",
          value: "http",
        },
      ],
      destination: "https://agiletoolhub.com/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [
        {
          type: "host",
          value: "www.agiletoolhub.com",
        },
      ],
      destination: "https://agiletoolhub.com/:path*",
      permanent: true,
    },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Long cache for static assets
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
