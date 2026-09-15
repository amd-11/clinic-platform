import { ChevronLeft, ChevronRight, MessageSquareText, Phone, SearchX } from "lucide-react";
import { connection } from "next/server";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { AppointmentFilters } from "@/components/admin/appointment-filters";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDb } from "@/db";
import type { AppointmentStatus } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { PAGE_SIZE, RANGES, STATUSES, type RangeFilter } from "@/lib/admin/filters";
import { requireSession } from "@/lib/admin/guard";
import { getAdminFormatting } from "@/lib/admin/labels";
import { listAppointments, maskForRole, type AdminAppointment } from "@/lib/admin/queries";
import { doctors as doctorData } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminAppointmentsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/appointments">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  await connection();

  const session = await requireSession(locale);
  const search = await searchParams;

  const rangeParam = param(search.range);
  const statusParam = param(search.status);
  const doctorParam = param(search.doctor);
  const filters = {
    range: (RANGES.includes(rangeParam as RangeFilter) ? rangeParam : "upcoming") as RangeFilter,
    status: STATUSES.includes(statusParam as AppointmentStatus) ? (statusParam as AppointmentStatus) : null,
    doctorId: doctorData.some((doctor) => doctor.id === doctorParam) ? (doctorParam as string) : null,
    query: (param(search.q) ?? "").slice(0, 60),
    page: Math.max(1, Number.parseInt(param(search.page) ?? "1", 10) || 1),
  };

  const [t, fmt, result] = await Promise.all([
    getTranslations("admin.appointments"),
    getAdminFormatting(locale),
    getDb().then((db) => listAppointments(db, filters)),
  ]);

  const rows = maskForRole(result.rows, session.role);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const readOnly = session.role !== "admin";

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string" && key !== "page") next.set(key, value);
    }
    if (page > 1) next.set("page", String(page));
    const query = next.toString();
    return query ? `/admin/appointments?${query}` : "/admin/appointments";
  };

  const contact = (item: AdminAppointment) =>
    readOnly && !item.isDemo ? (
      <span className="text-sm text-muted tabular-nums">{item.patientPhone}</span>
    ) : (
      <a
        href={`tel:${item.patientPhone.replace(/[^\d+]/g, "")}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted tabular-nums hover:text-primary"
        title={t("call")}
      >
        <Phone className="size-3.5" aria-hidden />
        {item.patientPhone}
      </a>
    );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted">{t("found", { count: result.total })}</p>
      </div>

      <div className="mt-6">
        <AppointmentFilters
          doctors={doctorData.map((doctor) => ({ id: doctor.id, name: fmt.doctorName(doctor.id) }))}
          current={filters}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <SearchX className="size-8 text-muted" aria-hidden />
          <p className="mt-3 font-semibold">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted">{t("emptyHint")}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs tracking-wide whitespace-nowrap text-muted uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">{t("columns.when")}</th>
                  <th scope="col" className="px-5 py-3 font-semibold">{t("columns.patient")}</th>
                  <th scope="col" className="px-5 py-3 font-semibold">{t("columns.service")}</th>
                  <th scope="col" className="px-5 py-3 font-semibold">{t("columns.status")}</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">{t("actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((item) => (
                  <tr key={item.id} className="align-top transition-colors hover:bg-accent/30">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="block font-semibold tabular-nums">{fmt.time(item.startsAt)}</span>
                      <span className="block text-muted">{fmt.date(item.startsAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 font-semibold">
                        {item.patientName}
                        {item.isDemo && (
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted uppercase">
                            {t("demoTag")}
                          </span>
                        )}
                      </span>
                      {contact(item)}
                      {item.comment && (
                        <span className="mt-1 flex max-w-xs items-start gap-1.5 text-xs text-muted">
                          <MessageSquareText className="mt-0.5 size-3.5 shrink-0" aria-label={t("comment")} />
                          {item.comment}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-medium">{fmt.serviceTitle(item.serviceId)}</span>
                      <span className="block text-muted">{fmt.doctorName(item.doctorId)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="w-px px-5 py-4 whitespace-nowrap">
                      <AppointmentActions
                        id={item.id}
                        status={item.status}
                        readOnly={readOnly}
                        className="[&>div]:flex-nowrap"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 space-y-3 lg:hidden">
            {rows.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold tabular-nums">
                      {fmt.time(item.startsAt)}{" "}
                      <span className="font-sans text-sm font-normal text-muted">{fmt.date(item.startsAt)}</span>
                    </p>
                    <p className="mt-1 font-semibold">{item.patientName}</p>
                    {contact(item)}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm text-muted">
                  {fmt.serviceTitle(item.serviceId)} · {fmt.doctorName(item.doctorId)}
                </p>
                {item.comment && <p className="mt-1 text-xs text-muted">{item.comment}</p>}
                <AppointmentActions
                  id={item.id}
                  status={item.status}
                  readOnly={readOnly}
                  className="mt-3 items-stretch border-t border-border pt-3 [&>div]:justify-start"
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label={t("page", { page: filters.page, pages })}>
          <Link
            href={pageHref(filters.page - 1)}
            aria-disabled={filters.page <= 1}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold hover:bg-accent",
              filters.page <= 1 && "pointer-events-none opacity-40",
            )}
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t("prev")}
          </Link>
          <span className="text-sm text-muted">{t("page", { page: filters.page, pages })}</span>
          <Link
            href={pageHref(filters.page + 1)}
            aria-disabled={filters.page >= pages}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold hover:bg-accent",
              filters.page >= pages && "pointer-events-none opacity-40",
            )}
          >
            {t("next")}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </nav>
      )}
    </div>
  );
}
