import type { NextConfig } from "next";

/** @type {import("next").NextConfig} */
const config: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
