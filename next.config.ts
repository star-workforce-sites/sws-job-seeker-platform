import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Edge Runtime for API routes
    runtime: undefined,
  },
};

export default nextConfig;
