import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  /** Phone (10.0.0.2) and 127.0.0.1 can load dev chunks without cross-origin blocks */
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.0.0.2", "10.0.0.3"],
  async headers() {
    return [
      // Invite video + art must cache on phone Wi‑Fi (was re-downloading ~13MB every load)
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // HTML/pages only — do not apply to /images (catch-all overrides media cache)
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
