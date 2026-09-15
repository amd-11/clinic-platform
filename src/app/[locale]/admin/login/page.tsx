import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/login-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme";
import { Logo } from "@/components/ui/logo";
import { Link, redirect } from "@/i18n/navigation";
import { getSession, isDemoAccessEnabled, isDevPassword } from "@/lib/admin/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "admin" });
  return { title: t("meta.title"), robots: { index: false, follow: false } };
}

export default async function AdminLoginPage({ params }: PageProps<"/[locale]/admin/login">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  if (await getSession()) {
    redirect({ href: "/admin", locale: locale as Locale });
  }

  const t = await getTranslations("admin.login");

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[30rem] rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/5">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
          <div className="mt-6">
            <LoginForm showDevHint={isDevPassword()} demoEnabled={isDemoAccessEnabled()} />
          </div>
        </div>
        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToSite")}
        </Link>
      </div>
    </main>
  );
}
