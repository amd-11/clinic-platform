import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — стоматология в Ереване`,
    short_name: siteConfig.name,
    description: "Онлайн-запись к стоматологу за 1 минуту.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#0e5e5a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
