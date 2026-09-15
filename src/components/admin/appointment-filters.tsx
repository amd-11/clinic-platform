"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { RANGES, STATUSES, type RangeFilter } from "@/lib/admin/filters";
import { cn } from "@/lib/utils";

type AppointmentFiltersProps = {
  doctors: { id: string; name: string }[];
  current: { range: RangeFilter; status: string | null; doctorId: string | null; query: string };
};

const selectClass =
  "h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-ring focus:outline-none";

/** All filters live in the URL, so a filtered view can be bookmarked or shared. */
export function AppointmentFilters({ doctors, current }: AppointmentFiltersProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(current.query);

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const search = params.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname));
  }

  // Debounced search
  useEffect(() => {
    if (query === current.query) return;
    const timer = setTimeout(() => update({ q: query.trim() || null }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query]);

  const hasFilters =
    current.range !== "upcoming" || current.status || current.doctorId || current.query;

  return (
    <div className={cn("space-y-3 transition-opacity", isPending && "opacity-60")}>
      <div
        role="tablist"
        aria-label={t("appointments.title")}
        className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 [scrollbar-width:none]"
      >
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            role="tab"
            aria-selected={current.range === range}
            onClick={() => update({ range: range === "upcoming" ? null : range })}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
              current.range === range
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-accent hover:text-foreground",
            )}
          >
            {t(`appointments.range.${range}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative flex-1 sm:min-w-56">
          <span className="sr-only">{t("appointments.search")}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("appointments.search")}
            className={cn(selectClass, "w-full pl-9")}
          />
        </label>
        <select
          aria-label={t("appointments.columns.status")}
          value={current.status ?? ""}
          onChange={(event) => update({ status: event.target.value || null })}
          className={selectClass}
        >
          <option value="">{t("appointments.allStatuses")}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`status.${status}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t("appointments.columns.doctor")}
          value={current.doctorId ?? ""}
          onChange={(event) => update({ doctor: event.target.value || null })}
          className={selectClass}
        >
          <option value="">{t("appointments.allDoctors")}</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace(pathname));
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
            {t("appointments.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
