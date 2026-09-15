import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "hy", "en"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

export const localeLabels: Record<AppLocale, { short: string; full: string }> = {
  ru: { short: "RU", full: "Русский" },
  hy: { short: "HY", full: "Հայերեն" },
  en: { short: "EN", full: "English" },
};
