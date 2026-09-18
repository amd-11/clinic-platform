import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next.js internals, metadata routes (sitemap, robots, OG image)
  // and files with an extension (images, favicon…)
  matcher: "/((?!api|_next|_vercel|sitemap|robots|manifest|.*\\..*).*)",
};
