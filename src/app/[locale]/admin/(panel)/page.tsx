import { ArrowRight, CalendarDays, Clock3, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { connection } from "next/server";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/admin/guard";
import { getAdminFormatting } from "@/lib/admin/labels";
import { getDashboardData, maskForRole } from "@/lib/admin/queries";

export default async function AdminDashboardPage({ params }: PageProps<"/[locale]/admin">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  await connection();

  const session = await requireSession(locale);
  const [t, fmt, data] = await Promise.all([
    getTranslations("admin.dashboard"),
    getAdminFormatting(locale),
    getDb().then((db) => getDashboardData(db)),
  ]);

  const todayList = maskForRole(data.todayList, session.role);
  const pendingList = maskForRole(data.pendingList, session.role);
  const maxLoad = Math.max(1, ...data.doctorLoad.map((item) => item.value));
  const readOnly = session.role !== "admin";

  const stats: { label: string; value: number; icon: LucideIcon; href: string }[] = [
    { label: t("stats.today"), value: data.stats.today, icon: CalendarDays, href: "/admin/appointments?range=today" },
    { label: t("stats.pending"), value: data.stats.pending, icon: Clock3, href: "/admin/appointments?status=pending" },
    { label: t("stats.week"), value: data.stats.week, icon: TrendingUp, href: "/admin/appointments?range=week" },
    { label: t("stats.new"), value: data.stats.newLast30Days, icon: Sparkles, href: "/admin/appointments?range=all" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-1 text-muted first-letter:uppercase">
        {t("subtitle", { date: fmt.longDate(new Date()) })}
      </p>

      {/* KPI tiles: single numbers, no chart needed */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
          >
            <span className="flex items-center justify-between text-sm text-muted">
              {label}
              <Icon className="size-4 text-primary" aria-hidden />
            </span>
            <span className="mt-3 block font-display text-4xl font-semibold tabular-nums">{value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Today */}
        <section className="rounded-2xl border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-bold">{t("todayTitle")}</h2>
            <Link
              href="/admin/appointments?range=today"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              {t("viewAll")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </header>
          {todayList.length === 0 ? (
            <p className="px-5 py-12 text-center text-muted">{t("todayEmpty")}</p>
          ) : (
            <ol className="divide-y divide-border">
              {todayList.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-14 shrink-0 font-display text-lg font-semibold tabular-nums">
                    {fmt.time(item.startsAt)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.patientName}</span>
                    <span className="block truncate text-sm text-muted">
                      {fmt.serviceTitle(item.serviceId)} · {fmt.doctorName(item.doctorId)}
                    </span>
                  </span>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="space-y-6">
          {/* Pending */}
          <section className="rounded-2xl border border-border bg-surface">
            <header className="border-b border-border px-5 py-4">
              <h2 className="font-bold">{t("pendingTitle")}</h2>
            </header>
            {pendingList.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">{t("pendingEmpty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {pendingList.map((item) => (
                  <li key={item.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{item.patientName}</p>
                        <p className="text-sm text-muted">
                          {fmt.date(item.startsAt)}, {fmt.time(item.startsAt)} ·{" "}
                          {fmt.serviceTitle(item.serviceId)}
                        </p>
                      </div>
                    </div>
                    <AppointmentActions
                      id={item.id}
                      status={item.status}
                      readOnly={readOnly}
                      className="mt-2 items-start [&>div]:justify-start"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Doctor workload — one series, one hue, every bar labelled with its value */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-bold">{t("loadTitle")}</h2>
            <ul className="mt-4 space-y-4">
              {data.doctorLoad.map((item) => (
                <li key={item.doctorId}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{fmt.doctorName(item.doctorId)}</span>
                    <span className="text-muted tabular-nums">{t("loadUnit", { count: item.value })}</span>
                  </div>
                  <div
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={maxLoad}
                    aria-valuenow={item.value}
                    aria-label={fmt.doctorName(item.doctorId)}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.value / maxLoad) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
