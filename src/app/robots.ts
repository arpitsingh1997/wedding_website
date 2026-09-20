import type { MetadataRoute } from "next";

/** Private invite — ask crawlers not to index any path. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
