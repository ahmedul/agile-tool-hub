import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontSize: {
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.5rem", { lineHeight: "1.2" }],
        "7xl": ["4.5rem", { lineHeight: "1.2" }],
      },
      lineHeight: {
        tight: "1.2",
        normal: "1.5",
        relaxed: "1.6",
      },
    },
  },
};

export default config;
