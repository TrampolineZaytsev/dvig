import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kudago.com", pathname: "/**" },
      { protocol: "https", hostname: "*.kudago.com", pathname: "/**" },
      { protocol: "https", hostname: "files.kudago.com", pathname: "/**" },
      { protocol: "https", hostname: "media.kudago.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
