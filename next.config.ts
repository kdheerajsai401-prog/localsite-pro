import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Bundle template source files into the deploy serverless function
  // so they're available on Vercel's read-only filesystem
  outputFileTracingIncludes: {
    "/api/sites/[id]/deploy": ["./templates/**/*"],
  },
};

export default nextConfig;
