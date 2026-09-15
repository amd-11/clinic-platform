"use client";

import { CalendarDays, Info, Stethoscope, UserRound, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { BookingService } from "@/lib/booking/catalog";
import { CLINIC_TIME_ZONE, clinicDateTime } from "@/lib/booking/time";
import { formatAmd } from "@/lib/utils";
import { useCatalogLabels } from "./labels";
import { ANY_DOCTOR } from "./step-doctor";

type BookingSummaryProps = {
  service: BookingService | null;
  doctorChoice: string | null;
  date: string | null;
  time: string | null;
};

/** "ср, 16 сентября" → "Ср, 16 сентября" (capitalised for use at the start of a line) */
export function useDateLabel() {
  const format = useFormatter();
  return (date: string, options: { long?: boolean } = {}) => {
    const label = format.dateTime(clinicDateTime(date, 12 * 60), {
      weekday: options.long ? "long" : "short",
      day: "numeric",
      month: "long",
      timeZone: CLINIC_TIME_ZONE,
    });
    return label.charAt(0).toLocaleUpperCase() + label.slice(1);
  };
}

export function BookingSummary({ service, doctorChoice, date, time }: BookingSummaryProps) {
  const t = useTranslations("booking.summary");
  const tServices = useTranslations("services");
  const labels = useCatalogLabels();
  const dateLabel = useDateLabel();

  const rows = [
    {
      icon: Stethoscope,
      label: t("service"),
      value: service ? labels.serviceTitle(service.id) : null,
    },
    {
      icon: UserRound,
      label: t("doctor"),
      value:
        doctorChoice === ANY_DOCTOR
          ? t("anyDoctor")
          : doctorChoice
            ? labels.doctorName(doctorChoice)
            : null,
    },
    {
      icon: CalendarDays,
      label: t("dateTime"),
      value: date ? `${dateLabel(date)}${time ? `, ${time}` : ""}` : null,
    },
    {
      icon: Wallet,
      label: t("price"),
      value: service ? `${tServices("from")} ${formatAmd(service.priceFrom)}` : null,
    },
  ];

  return (
    <aside className="rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-28">
      <h2 className="font-display text-xl font-semibold">{t("title")}</h2>
      <dl className="mt-5 space-y-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-[1.1rem]" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className={value ? "font-semibold" : "text-muted/70"}>
                {value ?? t("notSelected")}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="mt-6 flex gap-2 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        {t("note")}
      </p>
    </aside>
  );
}
