import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  trailingSlash: false,
  redirects: async () => [
    {
      source: "/:path+/",
      destination: "/:path+",
      permanent: true,
    },
  ],
};

export default withMDX(nextConfig);
