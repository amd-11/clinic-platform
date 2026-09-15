import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireSession } from "@/lib/admin/guard";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "admin" });
  return { title: t("meta.title"), robots: { index: false, follow: false } };
}

export default async function AdminPanelLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const session = await requireSession(locale as Locale);

  return <AdminShell role={session.role}>{children}</AdminShell>;
}
