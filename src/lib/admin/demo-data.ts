import { and, eq, gte, lt, ne } from "drizzle-orm";
import type { Database } from "@/db";
import { appointments, doctorSchedules, doctorServices, doctors, services } from "@/db/schema";
import { SLOT_STEP_MINUTES, addDays, clinicDateTime, todayInClinic, weekdayOf } from "@/lib/booking/time";

const FIRST_NAMES = ["Анна", "Арам", "Лилит", "Давид", "Мариам", "Гор", "Ани", "Сергей", "Нарине", "Тигран", "Элен", "Карен", "Ева", "Армен", "Софи", "Левон"];
const LAST_NAMES = ["Акопян", "Петросян", "Саргсян", "Григорян", "Мартиросян", "Оганесян", "Карапетян", "Варданян", "Аветисян", "Геворкян"];
const COMMENTS = [null, null, null, "Болит зуб справа", "Хочу проконсультироваться по элайнерам", "Повторный визит", "Удобно после обеда"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic pseudo-random numbers, so the demo looks the same after every regeneration. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Replaces all demo appointments with a fresh set for the last and next 14 days.
 * Respects working hours and never overlaps real bookings.
 * Returns the number of generated appointments.
 */
export async function regenerateDemoAppointments(db: Database, now = new Date()): Promise<number> {
  const random = createRandom(2026);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];

  return db.transaction(async (tx) => {
    await tx.delete(appointments).where(eq(appointments.isDemo, true));

    const today = todayInClinic(now);
    const [serviceRows, links, schedules, busy] = await Promise.all([
      tx.select().from(services).where(eq(services.active, true)),
      tx.select().from(doctorServices),
      tx
        .select({
          doctorId: doctorSchedules.doctorId,
          weekday: doctorSchedules.weekday,
          startMinute: doctorSchedules.startMinute,
          endMinute: doctorSchedules.endMinute,
        })
        .from(doctorSchedules)
        .innerJoin(doctors, eq(doctors.id, doctorSchedules.doctorId))
        .where(eq(doctors.active, true)),
      tx
        .select({ doctorId: appointments.doctorId, startsAt: appointments.startsAt, endsAt: appointments.endsAt })
        .from(appointments)
        .where(
          and(
            ne(appointments.status, "cancelled"),
            gte(appointments.startsAt, clinicDateTime(addDays(today, -14), 0)),
            lt(appointments.startsAt, clinicDateTime(addDays(today, 15), 0)),
          ),
        ),
    ]);

    const rows: (typeof appointments.$inferInsert)[] = [];

    for (let offset = -14; offset <= 14; offset++) {
      const date = addDays(today, offset);

      for (const schedule of schedules.filter((row) => row.weekday === weekdayOf(date))) {
        const serviceIds = links.filter((link) => link.doctorId === schedule.doctorId).map((link) => link.serviceId);
        const options = serviceRows.filter((service) => serviceIds.includes(service.id));
        if (options.length === 0) continue;

        // 1–3 appointments per doctor per working day
        const target = 1 + Math.floor(random() * 3);
        let placed = 0;
        for (let attempt = 0; attempt < target * 4 && placed < target; attempt++) {
          const service = pick(options);
          const steps = Math.floor(
            (schedule.endMinute - schedule.startMinute - service.durationMinutes) / SLOT_STEP_MINUTES,
          );
          if (steps < 0) continue;

          const startsAt = clinicDateTime(date, schedule.startMinute + Math.floor(random() * (steps + 1)) * SLOT_STEP_MINUTES);
          const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
          const overlaps = busy.some(
            (item) => item.doctorId === schedule.doctorId && item.startsAt < endsAt && item.endsAt > startsAt,
          );
          if (overlaps) continue;

          const roll = random();
          const status =
            endsAt.getTime() < now.getTime()
              ? roll < 0.85 ? "completed" : "cancelled"
              : roll < 0.6 ? "confirmed" : "pending";

          placed++;
          busy.push({ doctorId: schedule.doctorId, startsAt, endsAt });
          rows.push({
            serviceId: service.id,
            doctorId: schedule.doctorId,
            startsAt,
            endsAt,
            patientName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            patientPhone: `+374 ${pick(["55", "77", "91", "93", "98", "99"])} ${100 + Math.floor(random() * 900)} ${100 + Math.floor(random() * 900)}`,
            comment: pick(COMMENTS),
            locale: "ru",
            status,
            isDemo: true,
            createdAt: new Date(Math.min(now.getTime(), startsAt.getTime() - (1 + Math.floor(random() * 6)) * DAY_MS)),
          });
        }
      }
    }

    if (rows.length > 0) await tx.insert(appointments).values(rows);
    return rows.length;
  });
}
