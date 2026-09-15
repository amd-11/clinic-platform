import "server-only";
import type { Locale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { CLINIC_TIME_ZONE } from "@/lib/booking/time";
import type { doctors, services } from "@/lib/site-data";

type ServiceKey = (typeof services)[number]["id"];
type DoctorKey = (typeof doctors)[number]["id"];

/** Translated names and clinic-time formatting for server-rendered admin pages. */
export async function getAdminFormatting(locale: Locale) {
  const [tServices, tDoctors, format] = await Promise.all([
    getTranslations({ locale, namespace: "services.items" }),
    getTranslations({ locale, namespace: "doctors.items" }),
    getFormatter({ locale }),
  ]);

  return {
    serviceTitle: (id: string) => tServices(`${id as ServiceKey}.title`),
    doctorName: (id: string) => tDoctors(`${id as DoctorKey}.name`),
    time: (date: Date) =>
      format.dateTime(date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: CLINIC_TIME_ZONE }),
    date: (date: Date, weekday = true) =>
      format.dateTime(date, {
        weekday: weekday ? "short" : undefined,
        day: "numeric",
        month: "short",
        timeZone: CLINIC_TIME_ZONE,
      }),
    longDate: (date: Date) =>
      format.dateTime(date, { weekday: "long", day: "numeric", month: "long", timeZone: CLINIC_TIME_ZONE }),
  };
}
