import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  /** Phone (10.0.0.2) and 127.0.0.1 can load dev chunks without cross-origin blocks */
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.0.0.2", "10.0.0.3"],
};

export default nextConfig;
