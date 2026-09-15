"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Moon, RotateCw, Sun, Sunrise } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRef } from "react";
import type { Slot } from "@/lib/booking/availability";
import { CLINIC_TIME_ZONE, clinicDateTime, timeToMinutes, weekdayOf } from "@/lib/booking/time";
import { cn } from "@/lib/utils";

type SlotsState =
  | { status: "idle" | "loading" }
  | { status: "ready"; slots: Slot[] }
  | { status: "error"; unavailable: boolean };

type StepDateTimeProps = {
  days: string[];
  /** Weekdays when at least one suitable doctor works. */
  workingWeekdays: Set<number>;
  selectedDate: string | null;
  selectedTime: string | null;
  slots: SlotsState;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onRetry: () => void;
};

const periods = [
  { id: "morning", icon: Sunrise, from: 0, to: 12 * 60 },
  { id: "afternoon", icon: Sun, from: 12 * 60, to: 17 * 60 },
  { id: "evening", icon: Moon, from: 17 * 60, to: 24 * 60 },
] as const;

export function StepDateTime({
  days,
  workingWeekdays,
  selectedDate,
  selectedTime,
  slots,
  onSelectDate,
  onSelectTime,
  onRetry,
}: StepDateTimeProps) {
  const t = useTranslations("booking.datetime");
  const format = useFormatter();
  const stripRef = useRef<HTMLDivElement>(null);

  function scrollStrip(direction: 1 | -1) {
    const strip = stripRef.current;
    if (strip) strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      {/* Date strip */}
      <div className="relative mt-6">
        <div
          ref={stripRef}
          role="radiogroup"
          aria-label={t("title")}
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
        >
          {days.map((day) => {
            const instant = clinicDateTime(day, 12 * 60);
            const open = workingWeekdays.has(weekdayOf(day));
            const selected = day === selectedDate;
            return (
              <button
                key={day}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!open}
                onClick={() => onSelectDate(day)}
                aria-label={`${format.dateTime(instant, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: CLINIC_TIME_ZONE,
                })}${open ? "" : ` — ${t("closed")}`}`}
                title={open ? undefined : t("closed")}
                className={cn(
                  "flex w-[4.25rem] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition-all focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border bg-surface hover:border-primary/40",
                  !open && "cursor-not-allowed border-dashed bg-transparent opacity-40 hover:border-border",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium uppercase",
                    selected ? "text-primary-foreground/80" : "text-muted",
                  )}
                >
                  {format.dateTime(instant, { weekday: "short", timeZone: CLINIC_TIME_ZONE })}
                </span>
                <span className="mt-0.5 text-xl font-bold">
                  {format.dateTime(instant, { day: "numeric", timeZone: CLINIC_TIME_ZONE })}
                </span>
                <span
                  className={cn("text-xs", selected ? "text-primary-foreground/80" : "text-muted")}
                >
                  {format.dateTime(instant, { month: "short", timeZone: CLINIC_TIME_ZONE })}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 hidden justify-end gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            aria-label={t("previousDays")}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface transition-colors hover:bg-accent"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            aria-label={t("nextDays")}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface transition-colors hover:bg-accent"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Time slots */}
      <div className="mt-6 min-h-48" aria-live="polite">
        {slots.status === "loading" && (
          <div>
            <p className="sr-only">{t("loading")}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-surface-muted" />
              ))}
            </div>
          </div>
        )}

        {slots.status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
            <AlertCircle className="size-6 text-muted" aria-hidden />
            <p className="text-muted">{t("error")}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <RotateCw className="size-4" aria-hidden />
              {t("retry")}
            </button>
          </div>
        )}

        {slots.status === "ready" && slots.slots.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            {t("empty")}
          </p>
        )}

        {slots.status === "ready" && slots.slots.length > 0 && (
          <div className="space-y-5">
            {periods.map((period) => {
              const items = slots.slots.filter((slot) => {
                const minutes = timeToMinutes(slot.time) ?? 0;
                return minutes >= period.from && minutes < period.to;
              });
              if (items.length === 0) return null;
              const Icon = period.icon;
              return (
                <div key={period.id}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
                    <Icon className="size-4" aria-hidden />
                    {t(period.id)}
                  </p>
                  <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {items.map((slot) => {
                      const selected = slot.time === selectedTime;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => onSelectTime(slot.time)}
                          className={cn(
                            "h-11 rounded-xl border text-sm font-semibold tabular-nums transition-all focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "border-border bg-surface hover:border-primary hover:text-primary",
                          )}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
