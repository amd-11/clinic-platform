"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Check, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/button";
import { clinicDateTime, timeToMinutes } from "@/lib/booking/time";
import { siteConfig } from "@/lib/site-data";
import { useDateLabel } from "./booking-summary";
import { useCatalogLabels } from "./labels";

type BookingSuccessProps = {
  appointment: { id: string; serviceId: string; doctorId: string; date: string; time: string };
  durationMinutes: number;
  onReset: () => void;
};

/** 2026-09-21T09:00:00+04:00 → 20260921T050000Z (format Google Calendar expects) */
function toCalendarStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function BookingSuccess({ appointment, durationMinutes, onReset }: BookingSuccessProps) {
  const t = useTranslations("booking.success");
  const tSummary = useTranslations("booking.summary");
  const tContact = useTranslations("contact");
  const labels = useCatalogLabels();
  const dateLabel = useDateLabel();

  const start = clinicDateTime(appointment.date, timeToMinutes(appointment.time) ?? 0);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const serviceTitle = labels.serviceTitle(appointment.serviceId);
  const doctorName = labels.doctorName(appointment.doctorId);

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.search = new URLSearchParams({
    action: "TEMPLATE",
    text: `${serviceTitle} — ${siteConfig.name}`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: `${tSummary("doctor")}: ${doctorName}`,
    location: tContact("addressValue"),
  }).toString();

  const shortId = appointment.id.slice(0, 8).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-xl rounded-[2rem] border border-border bg-surface p-8 text-center shadow-2xl shadow-black/5 sm:p-12"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30"
      >
        <Check className="size-10" strokeWidth={3} aria-hidden />
      </motion.span>

      <h1 className="mt-8 font-display text-4xl font-semibold" tabIndex={-1}>
        {t("title")}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("subtitle")}</p>

      <dl className="mt-8 divide-y divide-border rounded-2xl border border-border text-left">
        {[
          [t("number"), <span key="id" className="font-mono">#{shortId}</span>],
          [tSummary("service"), serviceTitle],
          [tSummary("doctor"), doctorName],
          [tSummary("dateTime"), `${dateLabel(appointment.date, { long: true })}, ${appointment.time}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <ButtonLink href={calendarUrl.toString()} target="_blank" rel="noopener noreferrer" size="lg">
          <CalendarPlus className="size-4" aria-hidden />
          {t("calendar")}
        </ButtonLink>
        <div className="grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/" variant="secondary" size="lg">
            {t("home")}
          </ButtonLink>
          <Button type="button" variant="secondary" size="lg" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            {t("another")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
