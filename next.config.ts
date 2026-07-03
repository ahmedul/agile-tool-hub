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
    {
      source: "/:path+/",
      destination: "/:path+",
      permanent: true,
    },
  ],
};

export default withMDX(nextConfig);
