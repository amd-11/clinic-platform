import type { MetadataRoute } from "next";
import { siteUrlOrLocal } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrlOrLocal();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Patient data and internal tools must never be indexed
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
