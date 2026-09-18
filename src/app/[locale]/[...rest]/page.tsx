import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths inside a locale, so visitors get the localised
 * 404 page ([locale]/not-found.tsx) instead of the plain fallback.
 */
export default function CatchAllPage() {
  notFound();
}
