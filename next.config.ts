import type { NextConfig } from "next";

// Static export for GitHub Pages. The API runs separately (see NEXT_PUBLIC_API_URL).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: process.env.NODE_ENV === "production" },
} as NextConfig;

export default nextConfig;
