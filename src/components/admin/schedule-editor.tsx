"use client";

import { AlertCircle, Check, Loader2, Save } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveDoctorSchedule, setDoctorActive } from "@/lib/admin/actions";
import {
  CLINIC_TIME_ZONE,
  SLOT_STEP_MINUTES,
  addDays,
  clinicDateTime,
  minutesToTime,
} from "@/lib/booking/time";
import { cn } from "@/lib/utils";

type ScheduleDay = { weekday: number; startMinute: number; endMinute: number };

type ScheduleEditorProps = {
  doctor: {
    id: string;
    name: string;
    role: string;
    hue: number;
    active: boolean;
    services: string[];
    schedule: ScheduleDay[];
  };
  readOnly: boolean;
};

// Monday first, as in Armenia and Russia
const WEEK = [1, 2, 3, 4, 5, 6, 0];
// 2026-09-13 is a Sunday: adding the weekday number gives a date with that weekday
const SUNDAY = "2026-09-13";
const TIME_OPTIONS = Array.from(
  { length: (22 - 6) * (60 / SLOT_STEP_MINUTES) + 1 },
  (_, index) => 6 * 60 + index * SLOT_STEP_MINUTES,
);

type DayState = { enabled: boolean; start: number; end: number };

export function ScheduleEditor({ doctor, readOnly }: ScheduleEditorProps) {
  const t = useTranslations("admin");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(doctor.active);
  const [status, setStatus] = useState<"idle" | "saved" | string>("idle");
  const [days, setDays] = useState<Record<number, DayState>>(() =>
    Object.fromEntries(
      WEEK.map((weekday) => {
        const existing = doctor.schedule.find((day) => day.weekday === weekday);
        return [
          weekday,
          existing
            ? { enabled: true, start: existing.startMinute, end: existing.endMinute }
            : { enabled: false, start: 9 * 60, end: 18 * 60 },
        ];
      }),
    ),
  );

  const invalid = WEEK.filter((weekday) => days[weekday].enabled && days[weekday].start >= days[weekday].end);

  function patchDay(weekday: number, patch: Partial<DayState>) {
    setStatus("idle");
    setDays((current) => ({ ...current, [weekday]: { ...current[weekday], ...patch } }));
  }

  function save() {
    startTransition(async () => {
      const result = await saveDoctorSchedule(
        doctor.id,
        WEEK.filter((weekday) => days[weekday].enabled).map((weekday) => ({
          weekday,
          startMinute: days[weekday].start,
          endMinute: days[weekday].end,
        })),
      );
      setStatus(result.ok ? "saved" : t(`errors.${result.error}`));
    });
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await setDoctorActive(doctor.id, next);
      if (!result.ok) {
        setActive(!next);
        setStatus(t(`errors.${result.error}`));
      }
    });
  }

  const weekdayName = (weekday: number) =>
    format.dateTime(clinicDateTime(addDays(SUNDAY, weekday), 12 * 60), {
      weekday: "short",
      timeZone: CLINIC_TIME_ZONE,
    });

  return (
    <article className={cn("rounded-2xl border border-border bg-surface", !active && "opacity-75")}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-full font-display font-semibold text-white"
            style={{ background: `linear-gradient(160deg, hsl(${doctor.hue} 45% 65%), hsl(${doctor.hue} 35% 45%))` }}
          >
            {doctor.name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2)}
          </span>
          <div>
            <h2 className="font-bold">{doctor.name}</h2>
            <p className="text-sm text-muted">{doctor.role}</p>
          </div>
        </div>
        <label className={cn("flex items-center gap-3 text-sm font-medium", readOnly ? "cursor-not-allowed" : "cursor-pointer")}>
          {t("schedule.active")}
          <button
            type="button"
            role="switch"
            aria-checked={active}
            disabled={readOnly || pending}
            onClick={toggleActive}
            title={readOnly ? t("errors.demo") : undefined}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed",
              active ? "bg-primary" : "bg-border",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                active && "translate-x-5",
              )}
            />
          </button>
        </label>
      </header>

      <div className="flex flex-wrap gap-1.5 px-5 pt-4">
        {doctor.services.map((service) => (
          <span key={service} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {service}
          </span>
        ))}
      </div>

      <fieldset disabled={readOnly} className="divide-y divide-border px-5 py-2">
        <legend className="sr-only">{doctor.name}</legend>
        {WEEK.map((weekday) => {
          const day = days[weekday];
          const dayInvalid = invalid.includes(weekday);
          return (
            <div key={weekday} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
              <label className="flex w-28 items-center gap-2.5 text-sm font-semibold capitalize">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) => patchDay(weekday, { enabled: event.target.checked })}
                  className="size-4 rounded accent-[var(--primary)]"
                />
                {weekdayName(weekday)}
              </label>
              {day.enabled ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">{t("schedule.from")}</span>
                  <TimeSelect value={day.start} onChange={(start) => patchDay(weekday, { start })} invalid={dayInvalid} />
                  <span className="text-muted">{t("schedule.to")}</span>
                  <TimeSelect value={day.end} onChange={(end) => patchDay(weekday, { end })} invalid={dayInvalid} />
                </div>
              ) : (
                <span className="text-sm text-muted">{t("schedule.dayOff")}</span>
              )}
              {dayInvalid && (
                <span className="flex items-center gap-1 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="size-3.5" aria-hidden />
                  {t("schedule.invalidRange")}
                </span>
              )}
            </div>
          );
        })}
      </fieldset>

      <footer className="flex items-center justify-end gap-3 border-t border-border p-4">
        <span aria-live="polite" className="text-sm">
          {status === "saved" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Check className="size-4" aria-hidden />
              {t("schedule.saved")}
            </span>
          ) : status !== "idle" ? (
            <span className="text-rose-700 dark:text-rose-300">{status}</span>
          ) : null}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={readOnly || pending || invalid.length > 0}
          title={readOnly ? t("errors.demo") : undefined}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {pending ? t("schedule.saving") : t("schedule.save")}
        </Button>
      </footer>
    </article>
  );
}

function TimeSelect({ value, onChange, invalid }: { value: number; onChange: (value: number) => void; invalid: boolean }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn(
        "h-9 rounded-lg border bg-surface px-2 text-sm tabular-nums focus:border-primary focus:ring-4 focus:ring-ring focus:outline-none disabled:opacity-60",
        invalid ? "border-rose-400" : "border-border",
      )}
    >
      {TIME_OPTIONS.map((minute) => (
        <option key={minute} value={minute}>
          {minutesToTime(minute)}
        </option>
      ))}
    </select>
  );
}
