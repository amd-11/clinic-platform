import Link from "next/link";
import { routing } from "@/i18n/routing";

/**
 * Fallback for paths outside any locale segment (e.g. /unknown-file).
 * Localised 404s live in src/app/[locale]/not-found.tsx.
 */
export default function RootNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body
        style={{
          minHeight: "100dvh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f6f4ef",
          color: "#0d1b1e",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 72, margin: 0, color: "#0e5e5a" }}>404</p>
          <p style={{ fontSize: 18, marginTop: 8 }}>Page not found</p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 999,
              background: "#0e5e5a",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Aurora Dental
          </Link>
        </div>
      </body>
    </html>
  );
}
