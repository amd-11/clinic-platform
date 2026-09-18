"use client";

import {
  Bell,
  CalendarClock,
  ExternalLink,
  Eye,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme";
import { Logo } from "@/components/ui/logo";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/admin/auth-actions";
import type { AdminRole } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

const navigation: {
  href: string;
  key: "dashboard" | "appointments" | "schedule" | "notifications";
  icon: LucideIcon;
}[] = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", key: "appointments", icon: ListChecks },
  { href: "/admin/schedule", key: "schedule", icon: CalendarClock },
  { href: "/admin/notifications", key: "notifications", icon: Bell },
];

export function AdminShell({ role, children }: { role: AdminRole; children: React.ReactNode }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-18 items-center justify-between px-5">
        <Link href="/admin" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("nav.menu")}
          className="grid size-10 place-items-center rounded-full hover:bg-accent lg:hidden"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label={t("nav.menu")}>
        {navigation.map(({ href, key, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              isActive(href)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-[1.1rem]" aria-hidden />
            {t(`nav.${key}`)}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-[1.1rem]" aria-hidden />
          {t("nav.site")}
        </Link>
        <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            {role === "admin" ? (
              <ShieldCheck className="size-4 text-primary" aria-hidden />
            ) : (
              <Eye className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
            )}
            {t(`role.${role}`)}
          </span>
          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-accent hover:text-foreground"
            >
              <LogOut className="size-3.5" aria-hidden />
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface-muted/40 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("nav.menu")}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("nav.menu")}
            className="grid size-10 place-items-center rounded-full hover:bg-accent lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {role === "demo" && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 sm:px-8 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <Eye className="size-4 shrink-0" aria-hidden />
            {t("demoBanner")}
          </div>
        )}

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
