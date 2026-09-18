/**
 * Public base URL of the site, used for metadata, sitemap and the Telegram webhook.
 * On Vercel the production host is provided automatically.
 */
export function siteUrl(): string | null {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : null;
}

/** Same as siteUrl(), but always returns something usable (localhost in development). */
export function siteUrlOrLocal(): string {
  return siteUrl() ?? "http://localhost:3000";
}
