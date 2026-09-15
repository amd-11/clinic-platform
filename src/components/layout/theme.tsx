"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { THEME_STORAGE_KEY as STORAGE_KEY } from "./theme-script";

export function ThemeToggle() {
  const t = useTranslations("theme");

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode) — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggle")}
      className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* Both icons are rendered; CSS picks one, so there is no hydration mismatch */}
      <Sun className="size-5 dark:hidden" aria-hidden />
      <Moon className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
