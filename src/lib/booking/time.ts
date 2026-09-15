/**
 * Clinic time helpers. Armenia is UTC+4 all year (no daylight saving time),
 * so a fixed offset is exact and avoids timezone libraries.
 * Dates are passed around as "YYYY-MM-DD" strings in clinic local time.
 */

export const CLINIC_TIME_ZONE = "Asia/Yerevan";
const CLINIC_UTC_OFFSET = "+04:00";

export const SLOT_STEP_MINUTES = 30;
/** Patients can't book a slot that starts sooner than this. */
export const MIN_LEAD_MINUTES = 60;
export const BOOKING_DAYS_AHEAD = 21;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T12:00:00${CLINIC_UTC_OFFSET}`);
  return !Number.isNaN(date.getTime()) && toClinicDateString(date) === value;
}

/** The calendar date in Yerevan for a given instant. */
export function toClinicDateString(instant: Date): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function todayInClinic(now = new Date()): string {
  return toClinicDateString(now);
}

/** Converts a clinic-local date + minutes from midnight into a real instant. */
export function clinicDateTime(date: string, minutes: number): Date {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return new Date(`${date}T${hh}:${mm}:00${CLINIC_UTC_OFFSET}`);
}

/** 0 = Sunday … 6 = Saturday, for a clinic-local date. */
export function weekdayOf(date: string): number {
  return clinicDateTime(date, 12 * 60).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const instant = clinicDateTime(date, 12 * 60);
  instant.setUTCDate(instant.getUTCDate() + days);
  return toClinicDateString(instant);
}

export function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function bookingDateRange(now = new Date()) {
  const first = todayInClinic(now);
  return { first, last: addDays(first, BOOKING_DAYS_AHEAD - 1) };
}
