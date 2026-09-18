import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrlOrLocal } from "@/lib/site-url";

/** Public pages in every language. The admin panel is intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrlOrLocal();
  const lastModified = new Date();

  const localePath = (locale: string) => (locale === routing.defaultLocale ? "" : `/${locale}`);
  const languages = (path: string) =>
    Object.fromEntries(routing.locales.map((locale) => [locale, `${base}${localePath(locale)}${path}`]));

  return routing.locales.flatMap((locale) => [
    {
      url: `${base}${localePath(locale)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: { languages: languages("") },
    },
    {
      url: `${base}${localePath(locale)}/booking`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: languages("/booking") },
    },
  ]);
}
