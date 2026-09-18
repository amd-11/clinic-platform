import { connection } from "next/server";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TelegramSettings } from "@/components/admin/telegram-settings";
import { requireSession } from "@/lib/admin/guard";
import { getTelegramStatus } from "@/lib/admin/telegram-actions";

export default async function AdminNotificationsPage({
  params,
}: PageProps<"/[locale]/admin/notifications">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  await connection();

  const session = await requireSession(locale);
  const [t, status] = await Promise.all([
    getTranslations("admin.telegram"),
    getTelegramStatus(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-1 text-muted">{t("subtitle")}</p>

      <div className="mt-8">
        <TelegramSettings status={status} readOnly={session.role !== "admin"} />
      </div>
    </div>
  );
}
