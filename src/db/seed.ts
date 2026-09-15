import { sql } from "drizzle-orm";
import { doctors as doctorData, services as serviceData } from "../lib/site-data";
import type { Database } from "./index";
import { doctorSchedules, doctorServices, doctors, services } from "./schema";

const durations: Record<(typeof serviceData)[number]["id"], number> = {
  therapy: 60,
  implants: 90,
  orthodontics: 60,
  aesthetics: 60,
  hygiene: 60,
  kids: 30,
};

const doctorServiceMap: Record<(typeof doctorData)[number]["id"], string[]> = {
  anna: ["orthodontics", "hygiene"],
  david: ["implants", "therapy"],
  mariam: ["therapy", "hygiene", "kids"],
  levon: ["aesthetics", "therapy"],
};

const h = (hours: number) => hours * 60;

// weekday: 0 = Sun … 6 = Sat. Clinic hours: Mon–Fri 9–20, Sat 10–16.
const scheduleMap: Record<(typeof doctorData)[number]["id"], [number, number, number][]> = {
  anna: [
    [1, h(9), h(18)],
    [2, h(9), h(18)],
    [3, h(9), h(18)],
    [4, h(9), h(18)],
    [5, h(9), h(18)],
    [6, h(10), h(16)],
  ],
  david: [
    [1, h(10), h(20)],
    [3, h(10), h(20)],
    [5, h(10), h(20)],
  ],
  mariam: [
    [1, h(9), h(15)],
    [2, h(9), h(15)],
    [3, h(9), h(15)],
    [4, h(9), h(15)],
    [5, h(9), h(15)],
    [6, h(10), h(16)],
  ],
  levon: [
    [2, h(11), h(20)],
    [4, h(11), h(20)],
    [6, h(10), h(16)],
  ],
};

/** Idempotent: safe to run on every start — updates reference data, never touches appointments. */
export async function seedReferenceData(db: Database) {
  await db
    .insert(services)
    .values(
      serviceData.map((service, index) => ({
        id: service.id,
        priceFrom: service.priceFrom,
        durationMinutes: durations[service.id],
        sortOrder: index,
      })),
    )
    .onConflictDoUpdate({
      target: services.id,
      set: {
        priceFrom: sql`excluded.price_from`,
        durationMinutes: sql`excluded.duration_minutes`,
        sortOrder: sql`excluded.sort_order`,
      },
    });

  const existingDoctorIds = new Set(
    (await db.select({ id: doctors.id }).from(doctors)).map((row) => row.id),
  );

  await db
    .insert(doctors)
    .values(
      doctorData.map((doctor, index) => ({
        id: doctor.id,
        experienceYears: doctor.experience,
        hue: doctor.hue,
        sortOrder: index,
      })),
    )
    .onConflictDoUpdate({
      target: doctors.id,
      // `active` is managed in the admin panel, so it is never overwritten here
      set: {
        experienceYears: sql`excluded.experience_years`,
        hue: sql`excluded.hue`,
        sortOrder: sql`excluded.sort_order`,
      },
    });

  await db
    .insert(doctorServices)
    .values(
      Object.entries(doctorServiceMap).flatMap(([doctorId, serviceIds]) =>
        serviceIds.map((serviceId) => ({ doctorId, serviceId })),
      ),
    )
    .onConflictDoNothing();

  // Default working hours only for doctors added just now —
  // schedules edited in the admin panel must survive every deploy.
  const newSchedules = Object.entries(scheduleMap)
    .filter(([doctorId]) => !existingDoctorIds.has(doctorId))
    .flatMap(([doctorId, days]) =>
      days.map(([weekday, startMinute, endMinute]) => ({ doctorId, weekday, startMinute, endMinute })),
    );

  if (newSchedules.length > 0) {
    await db.insert(doctorSchedules).values(newSchedules).onConflictDoNothing();
  }
}
