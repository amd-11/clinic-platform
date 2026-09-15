import { asc, eq } from "drizzle-orm";
import type { Database } from "@/db";
import { doctorSchedules, doctorServices, doctors, services } from "@/db/schema";

export type BookingService = {
  id: string;
  durationMinutes: number;
  priceFrom: number;
};

export type BookingDoctor = {
  id: string;
  experienceYears: number;
  hue: number;
  serviceIds: string[];
  /** Weekdays the doctor works (0 = Sunday), used to disable days in the calendar. */
  weekdays: number[];
};

export type BookingCatalog = {
  services: BookingService[];
  doctors: BookingDoctor[];
};

/** Everything the booking wizard needs to render, loaded in one go. */
export async function getBookingCatalog(db: Database): Promise<BookingCatalog> {
  const [serviceRows, doctorRows, links, schedules] = await Promise.all([
    db
      .select({
        id: services.id,
        durationMinutes: services.durationMinutes,
        priceFrom: services.priceFrom,
      })
      .from(services)
      .where(eq(services.active, true))
      .orderBy(asc(services.sortOrder)),
    db
      .select({ id: doctors.id, experienceYears: doctors.experienceYears, hue: doctors.hue })
      .from(doctors)
      .where(eq(doctors.active, true))
      .orderBy(asc(doctors.sortOrder)),
    db.select().from(doctorServices),
    db.select({ doctorId: doctorSchedules.doctorId, weekday: doctorSchedules.weekday }).from(doctorSchedules),
  ]);

  return {
    services: serviceRows,
    doctors: doctorRows.map((doctor) => ({
      ...doctor,
      serviceIds: links.filter((link) => link.doctorId === doctor.id).map((link) => link.serviceId),
      weekdays: schedules.filter((row) => row.doctorId === doctor.id).map((row) => row.weekday),
    })),
  };
}
